// Persisted state for the automated collection pipeline.
// `ingestion_runs` — one doc per run; manual & scheduled alike.
// `jobs_pending_approval` — jobs awaiting admin review after each run.
// `daily_reports` — snapshot of totals per source for the dashboard table.
import { doc, collection, writeBatch, setDoc, increment } from "firebase-admin/firestore";
import { db } from "./firebase.js";

const RUNS_COLLECTION = "ingestion_runs";
const PENDING_COLLECTION = "jobs_pending_approval";
const REPORTS_COLLECTION = "daily_reports";
const REPORT_FIELDS = ["date", "total_jobs", "added", "duplicates", "errors", "sources", "top_companies"];

export function newRunId() {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Atomically mark a job as pending approval if not already.
export async function markPendingApproval(job) {
  if (!job || !job.id || job.approved === true) return;
  await db.collection(PENDING_COLLECTION).doc(job.id).set({
    title: job.title,
    company: job.company,
    source: job.source,
    url: job.url,
    approved: false,
    createdAt: Date.now(),
  });
}

export async function clearApproval(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  await Promise.all(
    ids.map((id) => collection(db, PENDING_COLLECTION).doc(id).delete())
  );
}

export async function batchApprove(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  await Promise.all(
    ids.map((id) => collection(db, PENDING_COLLECTION).doc(id).update({ approved: true }))
  );
  return ids.length;
}

// Write a normalized job (schema preserved + additive approved/aiScore/dedupeKey fields).
export async function persistJob(normalized) {
  const data = { ...normalized };
  data.approved = false; // default pending
  data.dedupeKey = normalizeDedupeKey(normalized);
  // Cast ISO string dates to proper Date objects for ordered createdAt index usage.
  if (data.postedDate && typeof data.postedDate === "string") data.postedDate = new Date(data.postedDate);
  if (data.deadline && typeof data.deadline === "string") data.deadline = new Date(data.deadline);
  if (!data.createdAt) data.createdAt = new Date().toISOString();
  else if (typeof data.createdAt === "string") data.createdAt = new Date(data.createdAt);
  if (data.priority == null) {
    const prio = await getCompanyPriority(data.company);
    data.priority = prio;
  }
  await db.collection("jobs").doc(String(data.id)).set(data, { merge: false });
}

function normalizeDedupeKey(j) {
  const base = [String(j.source || j.sourceName || ""), String(j.url || "")].join("::");
  let s = base;
  for (const k of ["title", "company"]) {
    s += "|" + String(j[k] || "");
  }
  return s.replace(/[^a-z0-9]+/gi, "_");
}

async function getCompanyPriority(company) {
  if (!company) return 50;
  const q = await db.collection("companies_priority").where("name", "==", company).get();
  if (q.empty) return 50;
  const arr = Array.from(q.docs);
  arr.sort((a, b) => Number(a.data().priority) - Number(b.data().priority));
  const first = arr[0]?.data()?.priority ?? 50;
  return Number(first) > 0 ? Number(first) : 50;
}

export async function saveRunSummary(runDoc, result) {
  const summary = {
    startedAt: runDoc.startedAt ?? Date.now(),
    finishedAt: Date.now(),
    totalRaw: result.rawCount ?? 0,
    valid: result.validCount ?? 0,
    duplicates: result.duplicateCount ?? 0,
    errors: result.errors ?? [],
    sources: result.sources ?? [],
    added: result.storedCount ?? 0,
  };
  await collection(db, RUNS_COLLECTION).doc(runDoc.id).set({ ...summary, runId: runDoc.id }, { merge: true });
}

export async function writeDailyReport(date, totals) {
  const key = `${new Date(date).toISOString().slice(0, 10)}`;
  const sourcesRow = [];
  if (totals.sources) for (const [name, n] of Object.entries(totals.sources)) sourcesRow.push([name, Number(n)]);
  const companiesRow = [];
  if (totals.topCompanies) for (const [c, n] of totals.topCompanies) companiesRow.push([c, Number(n)]);
  const docData = {
    date: key,
    total_jobs: Number(totals.total ?? 0),
    added: Number(totals.added ?? 0),
    duplicates: Number(totals.duplicates ?? 0),
    errors: Number(totals.errors ?? 0),
    sources: sourcesRow.map(([name, count]) => ({ name, count })),
    top_companies: companiesRow.map(([company, count]) => ({ company, count })),
  };
  await setDoc(doc(db, `${REPORTS_COLLECTION}/${key}`), docData, { merge: true });
}
