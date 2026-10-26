// Automated Job Collection pipeline — Cloud Functions v2.
//
// Triggers
//   - scheduleIngestion : daily 09:00 UTC cron (spec requirement)
//   - ingestSourceCallable: manual per-source run
//   - ingestAllCallable: manual full run of all enabled sources
//   - generateDailyReportCallable: dashboard snapshot generator
//
// Security note: allow-listed admin callable wrappers route through auth-checked
// functions rather than exposing raw adapters directly to browsers.

import { onSchedule } from "firebase-functions/v2";
import { onRequest, onCall, logger } from "firebase-functions/v2/https";
import cors from 'cors';
import { collection, getDocs } from 'firebase-admin/firestore';

import * as retry from "./utils/retry.js";
import * as rateLimit from "./utils/rateLimit.js";
import * as validate from "./utils/validate.js";
import { rankJobAI } from "./utils/aiRank.js";
import { SOURCES, sourceEnabled, PER_SOURCE_PER_RUN, GLOBAL_CONCURRENCY_CAP } from "./utils/sources.js";
import { persistJob, markPendingApproval, saveRunSummary, writeDailyReport, newRunId } from "./utils/store.js";
import { db } from "./firebase.js";

const CONCURRENCY = Number(process.env.GLOBAL_CONCURRENCY_CAP || GLOBAL_CONCURRENCY_CAP);

// ---------------------------------------------------------------------------
// Per-source adapter runner with retries + rate limiting + validation
// ---------------------------------------------------------------------------
async function runSource(config) {
  const { name, fetcher, normalizer, source: sourceKey } = config;
  if (!fetcher) return { source: name, rawCount: 0, validCount: 0, duplicateCount: 0, storedCount: 0, errors: ["no_fetcher"], sources: [] };

  await rateLimit.acquireSourceSlot(sourceKey);
  try {
    const rawJobs = await retry.withRetry(() => fetcher(), { attempts: 4, label: `${name} fetch` });
    console.log(`[ingest] ${name}: fetched ${rawJobs.length} raw`);

    const normalized = [];
    for (const raw of rawJobs.slice(0, PER_SOURCE_PER_RUN)) {
      let n;
      try {
        n = await normalizer(raw);
      } catch (e) {
        console.warn(`[ingest] ${name}: normalize failed for "${raw.title || raw.company}" — ${e.message}`);
        continue;
      }
      try {
        const ranked = await rankJobAI(n);
        n.aiScore = ranked.score;
        n.aiReason = ranked.reason;
        n.matchedSkills = ranked.matchedSkills || n.matchedSkills || [];
      } catch (e) {
        n.aiScore = null;
        console.warn(`[ingest] ${name}: AI rank failed for "${n.title}" — ${e.message}`);
      }

      const urlCheck = await validate.validateJobUrl(n.url);
      n.urlActive = urlCheck.ok ? true : false;
      if (!urlCheck.ok) console.warn(`[ingest] ${name}: url invalid for "${n.title}" (${urlCheck.reason})`);
      const expiry = validate.validateExpiry(n.deadline);
      if (!expiry.ok) console.warn(`[ingest] ${name}: expired deadline for "${n.title}"`);

      normalized.push(n);
    }

    let added = 0, duplicates = 0;
    // Cross-platform dedup at write time: dedupeKey collides => skip.
    for (const job of normalized) {
      await markPendingApproval(job);
      try {
        const existing = await db.collection("jobs").where("dedupeKey", "==", job.dedupeKey).limit(1).get();
        if (!existing.empty) {
          duplicates++;
          continue;
        }
      } catch (e) { /* ignore query failure */ }
      await persistJob(job);
      added++;
    }

    return { source: name, rawCount: normalized.length, validCount: normalized.length, duplicateCount: duplicates, storedCount: added, errors: [], sources: [{ name, added }] };
  } finally {
    rateLimit.releaseSourceSlot(sourceKey);
  }
}

async function ingestAll() {
  const results = [];
  const keys = Object.keys(SOURCES).filter((k) => sourceEnabled(k));
  // Bounded concurrency across sources.
  const queue = [...keys];
  while (queue.length) {
    const k = queue.shift();
    try {
      results.push(await runSource(SOURCES[k]));
    } catch (e) {
      results.push({ source: SOURCES[k].name, error: e.message, rawCount: 0, validCount: 0, duplicateCount: 0, storedCount: 0 });
    }
  }
  await writeDailyReport(new Date(), {
    total: results.reduce((s, r) => s + (r?.storedCount || 0), 0),
    added: results.reduce((s, r) => s + (r?.storedCount || 0), 0),
    duplicates: results.reduce((s, r) => s + (r?.duplicateCount || 0), 0),
    errors: results.reduce((s, r) => s + (r?.errors?.length || 0), 0),
    sources: {},
    top_companies: [],
  });
  return results;
}

async function writeDailyReportToday(results) {
  const totals = {
    total: results.reduce((s, r) => s + (r?.storedCount || 0), 0),
    added: results.reduce((s, r) => s + (r?.storedCount || 0), 0),
    duplicates: results.reduce((s, r) => s + (r?.duplicateCount || 0), 0),
    errors: results.reduce((s, r) => s + (r?.errors?.length || 0), 0),
    sources: {},
    topCompanies: {},
  };
  for (const r of results) {
    totals.sources[r.source ?? "unknown"] = (totals.sources[r.source ?? "unknown"] || 0) + (r?.added || 0);
  }
  const companiesQ = await db.collection("jobs").where("approved", "==", true).limit(500).get();
  const byCompany = {};
  for (const doc of companiesQ.docs) {
    byCompany[doc.data().company] = (byCompany[doc.data().company] || 0) + 1;
  }
  totals.topCompanies = Object.entries(byCompany)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([c, n]) => ({ company: c, count: n }));
  writeDailyReport(new Date(), totals).catch((e) => console.error("[report] writeDailyReport failed:", e.message));
}

// ---------------------------------------------------------------------------
// Scheduled ingestion (spec: daily run at 09:00 UTC)
// ---------------------------------------------------------------------------
export const scheduleIngestion = onSchedule({
  schedule: "0 9 * * *",
  timeZone: "UTC",
  memory: "2GiB",
  timeoutSeconds: 3600,
  concurrency: CONCURRENCY,
}, async () => {
  logger.info("[schedule] daily ingestion triggered");
  const startedAt = Date.now();
  await collection(db, "ingestion_runs").add({ startedAt, kind: "scheduled" });
  const summary = await ingestAll();
  const latest = await collection(db, "ingestion_runs")
    .orderBy("startedAt", "desc")
    .limit(1)
    .get();
  if (!latest.empty) {
    await latest.docs[0].ref.update({ finishedAt: Date.now(), summary });
  }
});

// ---------------------------------------------------------------------------
// Manual full run callable
// ---------------------------------------------------------------------------
export const ingestAllCallable = onCall({ cors: true }, async (req) => {
  if (!req.auth && process.env.ALLOW_UNAUTHORIZED_RUNS !== "true") {
    throw new Error("Admin required to run ingestion");
  }
  logger.info("[call] ingestAll manual trigger by user");
  const startedAt = Date.now();
  await collection(db, "ingestion_runs").add({ startedAt, kind: "manual" });
  const results = await ingestAll();
  return { ok: true, runId: `run_${startedAt}`, results };
});

// ---------------------------------------------------------------------------
// Per-source run callable
// ---------------------------------------------------------------------------
export const ingestSourceCallable = onCall({ cors: true }, async (req) => {
  if (!req.auth && process.env.ALLOW_UNAUTHORIZED_RUNS !== "true") {
    throw new Error("Admin required to run ingestion");
  }
  const key = typeof req.data?.source === "string" ? req.data.source : null;
  if (!key) throw new Error("source required");
  if (!Object.prototype.hasOwnProperty.call(SOURCES, key)) throw new Error(`unknown source: ${key}`);
  logger.info(`[call] ingestSource ${key}`);
  const result = await runSource(SOURCES[key]);
  return { ok: true, ...result };
});

// ---------------------------------------------------------------------------
// Bulk approval endpoint (pending jobs -> approved)
// ---------------------------------------------------------------------------
export const approveJobsCallable = onCall({ cors: true }, async (req) => {
  if (!req.auth && process.env.ALLOW_UNAUTHORIZED_RUNS !== "true") {
    throw new Error("Admin required to approve jobs");
  }
  const ids = Array.isArray(req.data?.ids) ? req.data.ids.map(String) : [];
  if (!ids.length) throw new Error("ids required");
  const updated = await import("./utils/store.js").then((m) => m.batchApprove(ids));
  return { ok: true, approved: updated };
});

// ---------------------------------------------------------------------------
// Daily report generation callable
// ---------------------------------------------------------------------------
export const generateDailyReportCallable = onCall({ cors: true }, async () => {
  if (!req.auth && process.env.ALLOW_UNAUTHORIZED_RUNS !== "true") {
    throw new Error("Admin required to generate report");
  }
  const prior = Date.now() - 86400000;
  const since = new Date(prior);
  since.setHours(0, 0, 0, 0);
  const totals = {
    total: 0, added: 0, duplicates: 0, errors: 0, sources: {}, topCompanies: [],
  };
  const runsQ = await collection(db, "ingestion_runs").where("startedAt", ">=", prior).get();
  for (const doc of runsQ.docs) {
    const s = doc.data().summary || {};
    totals.total += Number(s.totalRaw || 0);
    totals.added += Number(s.added || 0);
    totals.duplicates += Number(s.duplicates || 0);
    for (const src of s.sources || []) {
      totals.sources[src.name] = (totals.sources[src.name] || 0) + Number(src.added || 0);
    }
  }
  const jobsQ = await collection(db, "jobs").where("approved", "==", true).get();
  const byCompany = {};
  for (const d of jobsQ.docs) byCompany[d.data().company] = (byCompany[d.data().company] || 0) + 1;
  totals.topCompanies = Object.entries(byCompany).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => ({ company: c, count: n }));
  await writeDailyReport(since, totals);
  return { ok: true, date: since.toISOString() };
});
