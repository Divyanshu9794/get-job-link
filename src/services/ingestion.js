import { normalizeSkills } from "../utils/skills";

// Firebase admin
import { doc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

// Cap per daily run per source at PER_SOURCE_PER_RUN (spec target: 50 total / day across 10 sources).
export const PER_SOURCE_PER_RUN = 5;

// Source enums used by ingestJobs callers / AdminPage toggles.
export const SOURCE_LABELS = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  smartrecruiters: "SmartRecruiters",
  workday: "Workday",
  linkedin: "LinkedIn",
  naukri: "Naukri",
  instahyre: "Instahyre",
  hirist: "Hirist",
  foundit: "Foundit",
};

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------
export const SOURCES = {
  // --- GREENHOUSE (stable public API) ---------------------------------------
  greenhouse: {
    name: "Greenhouse",
    enabled: true,
    board: getEnvVar("VITE_GREENHOUSE_BOARDS") || "airbnb,stripe,dropbox,discord,twitch,figma,reddit,canva,lyft,pinterest,instacart,github,gitlab,doordash,coinbase,zapier,asana,okta,cloudflare,datadog,snowflake,mongodb,elastic,twilio,postman,netlify,vercel,gusto,rippling,roblox,duolingo,wayfair,affirm,patreon,grammarly,upwork,docusign,zoominfo,intercom,coursera,razorpay,phonepe,myntra,groww,swiggy,cred,meesho,urbancompany,browserstack,dream11,thoughtworks,globant,fractal",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      const boardString = config.board || SOURCES.greenhouse.board;
      const boards = boardString.split(",").map(b => b.trim()).filter(Boolean);
      if (boards.length === 0) return [];
      let allJobs = [];
      for (const board of boards) {
        try {
          const res = await fetchWithTimeout(`/api/greenhouse/${encodeURIComponent(board)}/jobs`, {}, 15000);
          if (!res.ok) continue;
          const data = await res.json();
          const companyJobs = (data?.jobs || []).map(j => ({
            title: j.title || "",
            company: j.company_name || board.charAt(0).toUpperCase() + board.slice(1),
            description: j.content || j.description || "",
            url: j.absolute_url || "",
            jobType: "", experience: "", salary: "", domain: "", isRemote: false,
            skills: [], fresherFriendly: false, category: "", subCategory: "",
            experienceLevel: "", remoteType: "", sourceUrl: j.absolute_url || "",
            postedDate: null, deadline: null
          }));
          allJobs = [...allJobs, ...companyJobs];
        } catch (e) { console.warn(`Greenhouse board [${board}] skipped:`, e.message); }
      }
      return allJobs.slice(0, PER_SOURCE_PER_RUN);
    }
  },

  // --- LEVER (enterprise API; configured via env var) -----------------------
  lever: {
    name: "Lever",
    enabled: true,
    board: "",
    company: getEnvVar("VITE_LEVER_COMPANIES") || "netflix,spotify,yelp,atlassian,shopify,eventbrite,retool,hopper,clearbit,n26,qonto,monzo,deliveroo,auth0,framer,miro,typeform,wix,klarna,trustpilot,xero,opensea,medium,vanta,drata,remote,deel,gocardless,contentful,algolia,cypressio,outreach,zomato,cleartax",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      const companyString = config.company || SOURCES.lever.company;
      const companies = companyString.split(",").map(c => c.trim()).filter(Boolean);
      if (companies.length === 0) return [];
      let allJobs = [];
      for (const company of companies) {
        try {
          const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`https://api.lever.co/v0/postings?company=${company}`)}`;
          const res = await fetchWithTimeout(proxyUrl, {}, 15000);
          if (!res.ok) continue;
          const data = await res.json();
          const companyJobs = (data || []).map(j => ({
            title: j.text || "",
            company: j.hostedUrl ? j.hostedUrl.split("/")[2] : company.charAt(0).toUpperCase() + company.slice(1),
            description: j.description || "",
            url: j.hostedUrl || "",
            jobType: "", experience: "", salary: "", domain: "", isRemote: false,
            skills: [], fresherFriendly: false, category: "", subCategory: "",
            experienceLevel: "", remoteType: "", sourceUrl: j.hostedUrl || "",
            postedDate: null, deadline: null
          }));
          allJobs = [...allJobs, ...companyJobs];
        } catch (e) { console.warn(`Lever company [${company}] skipped:`, e.message); }
      }
      return allJobs.slice(0, PER_SOURCE_PER_RUN);
    }
  },

  // --- ASHBY (public posting API) -------------------------------------------
  ashby: {
    name: "Ashby",
    enabled: true,
    board: "",
    company: getEnvVar("VITE_ASHBY_COMPANIES") || "openai,anthropic,ramp,deel,replit,cohere,clerk,posthog,render,neon,railway,supabase,freshpaint,loom",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      const companyString = config.company || SOURCES.ashby.company;
      const companies = companyString.split(",").map(c => c.trim()).filter(Boolean);
      if (companies.length === 0) return [];
      let allJobs = [];
      for (const company of companies) {
        try {
          const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`https://api.ashbyhq.com/posting-api/job-board/${company}?includeCompensation=true`)}`;
          const res = await fetchWithTimeout(proxyUrl, {}, 15000);
          if (!res.ok) continue;
          const data = await res.json();
          const companyJobs = (data?.jobs || []).map(j => ({
            title: j.title || "",
            company: company.charAt(0).toUpperCase() + company.slice(1),
            description: j.descriptionPlain || "",
            url: j.jobUrl || j.applyUrl || "",
            jobType: j.employmentType || "",
            experience: "", salary: j.compensation ? `${j.compensation.currency} ${j.compensation.min}-${j.compensation.max}` : "",
            domain: j.department || "",
            isRemote: Boolean(j.isRemote || (j.workplaceType && j.workplaceType.toLowerCase() === 'remote')),
            skills: [], fresherFriendly: false, category: "", subCategory: "",
            experienceLevel: "", remoteType: j.workplaceType || "",
            sourceUrl: j.jobUrl || "",
            postedDate: j.publishedAt || null, deadline: null
          }));
          allJobs = [...allJobs, ...companyJobs];
        } catch (e) { console.warn(`Ashby company [${company}] skipped:`, e.message); }
      }
      return allJobs.slice(0, PER_SOURCE_PER_RUN);
    }
  },

  // --- SMARTRECRUITERS (public v1 endpoint) --------------------------------
  smartrecruiters: {
    name: "SmartRecruiters",
    enabled: true,
    board: "",
    company: getEnvVar("VITE_SMARTRECRUITERS_COMPANIES") || "nagarro1,publicissapient,capgemini,soprasteria,epam,visa,ubisoft,bosch,ikea,mcdonalds,nielsen,smartrecruiters",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      const companyString = config.company || SOURCES.smartrecruiters.company;
      const companies = companyString.split(",").map(c => c.trim()).filter(Boolean);
      if (companies.length === 0) return [];
      let allJobs = [];
      for (const company of companies) {
        try {
          const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`https://api.smartrecruiters.com/v1/companies/${company}/postings`)}`;
          const res = await fetchWithTimeout(proxyUrl, {}, 15000);
          if (!res.ok) continue;
          const data = await res.json();
          const companyJobs = (data.content || []).map(j => ({
            title: j.name || "",
            company: j.company?.name || company.charAt(0).toUpperCase() + company.slice(1),
            description: "",
            url: `https://jobs.smartrecruiters.com/${company}/${j.id}`,
            jobType: j.typeOfEmployment?.label || "",
            experience: j.experienceLevel?.label || "",
            salary: "", domain: j.department?.label || "",
            isRemote: j.location?.remote || false,
            skills: [], fresherFriendly: false, category: "", subCategory: "",
            experienceLevel: j.experienceLevel?.label || "",
            remoteType: j.location?.remote ? "Remote" : "On-site",
            sourceUrl: `https://jobs.smartrecruiters.com/${company}/${j.id}`,
            postedDate: j.releasedDate || null, deadline: null
          }));
          allJobs = [...allJobs, ...companyJobs];
        } catch (e) { console.warn(`SmartRecruiters company [${company}] skipped:`, e.message); }
      }
      return allJobs.slice(0, PER_SOURCE_PER_RUN);
    }
  },

  // --- WORKDAY (requires enterprise configuration) -------------------------
  workday: {
    name: "Workday",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async () => {
      throw new Error("Workday integration requires configuration (VITE_WORKDAY_*). Until configured this source returns no jobs.");
    }
  },

  // --- LINKEDIN (partner API — mark requiring config) -----------------------
  linkedin: {
    name: "LinkedIn",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async () => {
      throw new Error("LinkedIn integration requires configuration: set VITE_LINKEDIN_API_TOKEN and complete Recruiter API partner onboarding.");
    }
  },

  // --- NAUKRI (scraped SaaS — placeholder) ---------------------------------
  naukri: {
    name: "Naukri",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async () => {
      throw new Error("Naukri integration requires configuration: supply a validated JSON feed endpoint (VITE_NAUKRI_FEED_URL) via fetchAndNormalize.");
    }
  },

  // --- INSTAHYRE (scraped SaaS — placeholder) -------------------------------
  instahyre: {
    name: "Instahyre",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async () => {
      throw new Error("Instahyre integration requires configuration: supply a validated JSON feed endpoint (VITE_INSTAHYRE_ENDPOINT) via fetchAndNormalize.");
    }
  },

  // --- HIRIST (scraped SaaS — placeholder) ----------------------------------
  hirist: {
    name: "Hirist",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async () => {
      throw new Error("Hirist integration requires configuration: supply a validated JSON feed endpoint (VITE_HIRIST_FEED_URL) via fetchAndNormalize.");
    }
  },

  // --- FOUNDIT (scraped SaaS — placeholder) ---------------------------------
  foundit: {
    name: "Foundit",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async () => {
      throw new Error("Foundit integration requires configuration: supply a validated JSON feed endpoint (VITE_FOUNDIT_FEED_URL) via fetchAndNormalize.");
    }
  },
};

function getEnvVar(key) {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || "";
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || "";
  }
  return "";
}

// ---------------------------------------------------------------------------
// Extract skills from job text
// ---------------------------------------------------------------------------
export function extractSkills(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const skillPatterns = [
    "javascript", "typescript", "python", "java", "react", "angular", "vue", "vuejs",
    "node", "nodejs", "express", "django", "flask", "ruby", "rails", "php", "laravel",
    "go", "golang", "rust", "c++", "csharp", "asp.net", "swift", "kotlin", "scala",
    "html", "css", "sass", "scss", "less", "webpack", "vite", "docker", "kubernetes",
    "aws", "gcp", "azure", "terraform", "ansible", "jenkins", "ci/cd", "git",
    "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
    "graphql", "rest", "api", "microservices", "linux", "bash", "shell",
    "agile", "scrum", "jira", "confluence", "figma", "photoshop", "illustrator",
    "tensorflow", "pytorch", "keras", "opencv", "nlp", "machine learning", "deep learning",
    "ai", "data science", "data engineering", "spark", "hadoop", "airflow", "kafka",
    "postman", "junit", "selenium", "cypress", "jest", "mocha", "playwright"
  ];
  const found = new Set();
  for (const skill of skillPatterns) {
    const pattern = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${pattern}\\b`, "i");
    if (regex.test(lower)) found.add(skill);
  }
  return Array.from(found);
}

// Clean HTML description to plain text
const cleanHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Normalize a raw job object into the GetJobLink schema.
// This is where AI classification would happen (using @google/genai).
export function normalizeJob(rawJob, source) {
  const description = cleanHtml(rawJob.description || "");
  const skills = normalizeSkills(rawJob.skills);

  return {
    title: rawJob.title || "Unknown Title",
    company: rawJob.company || "Unknown Company",
    jd: description || "No description provided.",
    url: rawJob.url || "",
    jobType: rawJob.jobType || "Full Time",
    experience: rawJob.experience || "More than 0 year",
    salary: rawJob.salary || "Competitive",
    domain: rawJob.domain || "Engineering",
    isRemote: Boolean(rawJob.isRemote),
    skills: skills,
    fresherFriendly: Boolean(rawJob.fresherFriendly),
    category: rawJob.category || "Technical",
    subCategory: rawJob.subCategory || "Software Engineering",
    experienceLevel: rawJob.experienceLevel || "Entry Level",
    remoteType: rawJob.remoteType || "On-site",
    source: source,
    sourceUrl: rawJob.sourceUrl || "",
    postedDate: rawJob.postedDate || null,
    deadline: rawJob.deadline || null,
    createdAt: Date.now(),
    dedupeKey: String([source, rawJob.url || "", rawJob.title || "", rawJob.company || ""].join("::")).replace(/[^a-zA-Z0-9]+/g, "_")
  };
}

// Deduplicate jobs by dedupeKey (source+url+title+company) or title+company+url.
export async function deduplicateJob(normalizedJob) {
  if (normalizedJob.dedupeKey) {
    const dq = query(collection(db, "jobs"), where("dedupeKey", "==", normalizedJob.dedupeKey));
    const ds = await getDocs(dq);
    if (!ds.empty) return true;
  }
  // Fallback: check by title+company+url exact match
  const q = query(
    collection(db, "jobs"),
    where("title", "==", normalizedJob.title),
    where("company", "==", normalizedJob.company),
    where("url", "==", normalizedJob.url)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Ingest jobs from a specific source
export async function ingestJobs(sourceKey, config = {}) {
  const source = SOURCES[sourceKey];
  if (!source || !source.enabled) {
    throw new Error(`Source ${sourceKey} is not enabled`);
  }

  let rawCount = 0;
  let validCount = 0;
  let duplicateCount = 0;
  let storedCount = 0;
  const errors = [];

  console.log(`[INGEST] SOURCE_STARTED: ${source.name} (${sourceKey})`);
  console.log(`[INGEST] config: board=${config.board || 'default'}`);

  console.log(`[INGEST] REQUEST_SENT: calling ${source.name} adapter`);
  let rawJobs;
  try {
    rawJobs = await source.adapter(config);
    rawCount = rawJobs.length;
  } catch (e) {
    errors.push(e.message);
    console.error(`[INGEST] SOURCE_FAILED: ${source.name} adapter error:`, e.message);
    return { source: source.name, rawCount: 0, validCount: 0, duplicateCount: 0, storedCount: 0, failed: 1, errors };
  }
  console.log(`[INGEST] RESPONSE_RECEIVED: ${rawCount} raw jobs from ${source.name}`);

  const normalizedJobs = rawJobs.map(job => normalizeJob(job, source.name));

  const validJobs = [];
  for (const job of normalizedJobs) {
    if (!job.title || !job.company || !job.url) {
      console.warn(`[INGEST] JOB_REJECTED: missing required fields (title=${!!job.title}, company=${!!job.company}, url=${!!job.url})`);
      continue;
    }
    validJobs.push(job);
  }
  validCount = validJobs.length;
  console.log(`[INGEST] JOBS_VALIDATED: ${validCount} valid out of ${rawCount} raw`);

  const uniqueJobs = [];
  for (const job of validJobs) {
    const isDuplicate = await deduplicateJob(job);
    if (isDuplicate) {
      duplicateCount++;
      console.log(`[INGEST] DUPLICATE_SKIPPED: ${job.title} at ${job.url}`);
    } else {
      uniqueJobs.push(job);
    }
  }
  console.log(`[INGEST] JOBS_DEDUPLICATED: ${uniqueJobs.length} unique, ${duplicateCount} duplicates skipped`);

  if (uniqueJobs.length > 0) {
    const batch = writeBatch(db);
    for (const job of uniqueJobs) {
      const docRef = doc(collection(db, "jobs"));
      batch.set(docRef, job);
      storedCount++;
    }
    await batch.commit();
    console.log(`[INGEST] JOBS_STORED: ${storedCount} jobs written to Firestore`);
  } else {
    console.log(`[INGEST] JOBS_STORED: 0 (no new jobs)`);
  }

  return {
    source: source.name,
    rawCount,
    validCount,
    duplicateCount,
    storedCount,
    failed: errors.length,
    errors
  };
}

// Ingest from all enabled sources
export async function ingestAllJobs() {
  const results = [];
  for (const [key, source] of Object.entries(SOURCES)) {
    if (source.enabled) {
      try {
        const result = await ingestJobs(key);
        results.push(result);
      } catch (error) {
        console.error(`Error ingesting from ${key}:`, error);
        results.push({ source: source.name, error: error.message });
      }
    }
  }
  return results;
}

// AI classification using Google GenAI (when available)
export async function classifyJobAI(rawText) {
  // Real classification lives in functions/utils/aiRank.js — this remains a
  // fallback heuristic so browser ingestion keeps working offline.
  return {
    category: "Technical",
    subCategory: "Software Engineering",
    experienceLevel: "Entry Level",
    fresherFriendly: false,
    remoteType: "On-site",
    skills: []
  };
}
