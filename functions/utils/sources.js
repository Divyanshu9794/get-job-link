// Centralized source configuration for the automated job collection backend.
// Each source declares whether it has a usable integration and exposes adapter
// fetch + normalize functions. Sources that lack a stable public API are
// marked `requiresConfig: true` with a clear setup error — never emulate.
import { normalizeBase } from "../adapters/normalize.js";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

// ============================================================================
// GREENHOUSE
// ----------------------------------------------------------------------------
// Stable public API — board-based listing proxy already exists.
export const greenhouse = {
  name: "Greenhouse",
  source: "greenhouse",
  enabled: true,
  boards: getEnv("VITE_GREENHOUSE_BOARDS"),
  fetcher: async (board) => {
    if (!board) return [];
    try {
      const res = await fetchWithTimeout(`https://api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`, {}, 15000);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.jobs || [];
    } catch (e) {
      console.warn(`[greenhouse] board ${board} skipped: ${e.message}`);
      return [];
    }
  },
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: raw.office?.name || raw.office?.location || "",
    postedAt: raw.updated_at || raw.created_at || null,
    url: raw.absolute_url || raw.url || "",
    applyUrl: raw.absolute_url || raw.url || "",
    description: raw.content || raw.description || "",
  }, "greenhouse", String(raw.id || raw.job_id || "")),
};

// ============================================================================
// LEVER
// ----------------------------------------------------------------------------
// No public CORS-friendly listing endpoint without enterprise SDK access.
// Configurable via VITE_LEVER_COMPANIES + optional VITE_LEVER_API_TOKEN.
// Without both configured we surface a clear configuration error rather than
// emulate scraping.
export const lever = {
  name: "Lever",
  source: "lever",
  enabled: false,
  requiresConfig: true,
  companies: getEnv("VITE_LEVER_COMPANIES") || "",
  token: getEnv("VITE_LEVER_API_TOKEN") || "",
  fetcher: async () => {
    if (!lever.companies) {
      throw new Error("Lever integration requires configuration: set VITE_LEVER_COMPANIES");
    }
    // Enterprise onboarding path — user enters companies; otherwise prompt.
    const companies = lever.companies.split(",").map(c => c.trim()).filter(Boolean);
    let all = [];
    for (const c of companies) {
      try {
        const res = await fetchWithTimeout(
          `${CORS_PROXY}${encodeURIComponent(`https://api.lever.co/v0/postings?company=${c}`)}`, {}, 15000
        );
        if (!res.ok) continue;
        const d = await res.json();
        all = [...all, ...(Array.isArray(d) ? d : [])];
      } catch (e) { console.warn(`[lever] company ${c} skipped: ${e.message}`); }
    }
    return all;
  },
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: "",
    postedAt: null,
    url: raw.hostedUrl || raw.url || "",
    applyUrl: raw.hostedUrl || "",
    logo: "",
    description: raw.description || "",
  }, "lever", raw.id || raw.jobId || ""),
};

// ============================================================================
// ASHBY
// ----------------------------------------------------------------------------
// Public posting API — single company lookup works out of the box.
export const ashby = {
  name: "Ashby",
  source: "ashby",
  enabled: false,
  companies: getEnv("VITE_ASHBY_COMPANIES") || "",
  fetcher: async () => {
    if (!ashby.companies) throw new Error("Ashby integration requires configuration: set VITE_ASHBY_COMPANIES");
    const companies = ashby.companies.split(",").map(c => c.trim()).filter(Boolean);
    let all = [];
    for (const c of companies) {
      try {
        const res = await fetchWithTimeout(
          `${CORS_PROXY}${encodeURIComponent(`https://api.ashbyhq.com/posting-api/job-board/${c}?includeCompensation=true`)}`, {}, 15000
        );
        if (!res.ok) continue;
        const d = await res.json();
        all = [...all, ...(Array.isArray(d.jobs) ? d.jobs : [])];
      } catch (e) { console.warn(`[ashby] company ${c} skipped: ${e.message}`); }
    }
    return all;
  },
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: "",
    postedAt: raw.publishedAt || null,
    url: raw.jobUrl || raw.applyUrl || "",
    applyUrl: raw.jobUrl || "",
    description: raw.descriptionPlain || "",
  }, "ashby", String(raw.id || "")),
};

// ============================================================================
// SMARTRECRUITERS
// ----------------------------------------------------------------------------
// Public v1 endpoint with tenant prefixes.
export const smartrecruiters = {
  name: "SmartRecruiters",
  source: "smartrecruiters",
  enabled: false,
  companies: getEnv("VITE_SMARTRECRUITERS_COMPANIES") || "",
  fetcher: async () => {
    if (!smartrecruiters.companies) throw new Error("SmartRecruiters integration requires configuration: set VITE_SMARTRECRUITERS_COMPANIES");
    const companies = smartrecruiters.companies.split(",").map(c => c.trim().replace(/^[a-zA-Z]+1$/, c)).filter(Boolean);
    let all = [];
    for (const c of companies) {
      try {
        const res = await fetchWithTimeout(
          `${CORS_PROXY}${encodeURIComponent(`https://api.smartrecruiters.com/v1/companies/${c}/postings`)}`, {}, 15000
        );
        if (!res.ok) continue;
        const d = await res.json();
        all = [...all, ...(Array.isArray(d.content) ? d.content : [])];
      } catch (e) { console.warn(`[smartrecruiters] company ${c} skipped: ${e.message}`); }
    }
    return all;
  },
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: "",
    postedAt: raw.releasedDate || null,
    url: `https://jobs.smartrecruiters.com/${raw.company || ""}/${raw.id || ""}`,
    applyUrl: `https://jobs.smartrecruiters.com/${raw.company || ""}/${raw.id || ""}`,
    description: "",
  }, "smartrecruiters", String(raw.id || "")),
};

// ============================================================================
// WORKDAY
// ----------------------------------------------------------------------------
// No stable public listing API; broker/enterprise paths exist but need
// integration authorisation. Marked requiresConfig so we don't pretend.
export const workday = {
  name: "Workday",
  source: "workday",
  enabled: false,
  requiresConfig: true,
  setup: "Configure Workday via the Business Objects Partner Connector or broker credentials (VITE_WORKDAY_*). Until configured this source returns no jobs.",
};

// ============================================================================
// LINKEDIN
// ----------------------------------------------------------------------------
// Official Recruiter API requires enterprise/partner approval.
export const linkedin = {
  name: "LinkedIn",
  source: "linkedin",
  enabled: false,
  requiresConfig: true,
  setup: "LinkedIn integration requires configuration: set VITE_LINKEDIN_API_TOKEN and complete the Recruiter API partner onboarding.",
};

// ============================================================================
// NAUKRI
// ----------------------------------------------------------------------------
// Closed SaaS target, no public API. Configurable scraper pipeline required.
export const naukri = {
  name: "Naukri",
  source: "naukri",
  enabled: false,
  requiresConfig: true,
  setup: "Naukri integration requires configuration: supply a validated RSS or JSON feed URL (VITE_NAUKRI_FEED_URL) consumed via fetchAndNormalize.",
  fetcher: async () => [],
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: "",
    postedAt: null,
    url: raw.url || raw.link || "",
    applyUrl: raw.url || "",
    description: raw.description || "",
  }, "naukri", String(raw.id || "")),
};

// ============================================================================
// INSTAHYRE
// ----------------------------------------------------------------------------
export const instahyre = {
  name: "Instahyre",
  source: "instahyre",
  enabled: false,
  requiresConfig: true,
  setup: "Instahyre integration requires configuration: supply a validated JSON endpoint (VITE_INSTAHYRE_ENDPOINT) consumed via fetchAndNormalize.",
  fetcher: async () => [],
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: "",
    postedAt: null,
    url: raw.url || raw.link || "",
    applyUrl: raw.url || "",
    description: raw.description || "",
  }, "instahyre", String(raw.id || "")),
};

// ============================================================================
// HIRIST
// ----------------------------------------------------------------------------
export const hirist = {
  name: "Hirist",
  source: "hirist",
  enabled: false,
  requiresConfig: true,
  setup: "Hirist integration requires configuration: supply a validated JSON feed (VITE_HIRIST_FEED_URL) consumed via fetchAndNormalize.",
  fetcher: async () => [],
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: "",
    postedAt: null,
    url: raw.url || raw.link || "",
    applyUrl: raw.url || "",
    description: raw.description || "",
  }, "hirist", String(raw.id || "")),
};

// ============================================================================
// FOUNDIT
// ----------------------------------------------------------------------------
export const foundit = {
  name: "Foundit",
  source: "foundit",
  enabled: false,
  requiresConfig: true,
  setup: "Foundit integration requires configuration: supply a validated JSON feed (VITE_FOUNDIT_FEED_URL) consumed via fetchAndNormalize.",
  fetcher: async () => [],
  normalizer: (raw) => normalizeBase({
    ...raw,
    location: "",
    postedAt: null,
    url: raw.url || raw.link || "",
    applyUrl: raw.url || "",
    description: raw.description || "",
  }, "foundit", String(raw.id || "")),
};

function getEnv(key) {
  if (typeof process !== "undefined" && process.env && process.env[key]) return process.env[key];
  return "";
}

export const SOURCES = {
  greenhouse,
  lever,
  ashby,
  smartrecruiters,
  workday,
  linkedin,
  naukri,
  instahyre,
  hirist,
  foundit,
};

export function sourceEnabled(key) {
  const s = SOURCES[key];
  if (!s) return false;
  if (typeof s.enabled !== "boolean") return s.enabled === true; // default true unless explicitly false
  return s.enabled;
}

// Cap per source to ~5 fresh jobs per daily run (spec target: 50 total / day).
export const PER_SOURCE_PER_RUN = 5;

export const GLOBAL_CONCURRENCY_CAP = 4;
