/**
 * Multi-Source ATS Job Fetch Engine & Normalizer
 * Fetches open developer and engineering roles across India, World, and Remote sources.
 * 
 * Supports:
 * - Greenhouse ATS boards (Flipkart, Razorpay, Swiggy, Zomato, PhonePe, Paytm, Zepto, Blinkit, CRED, Groww, Meesho, InMobi, Freshworks, Atlassian, Adobe, Stripe, Airbnb, Figma, GitLab, GitHub, Coinbase)
 * - Ashby ATS boards (Zerodha, Linear, Vercel, Supabase)
 * - Lever ATS boards (Spotify, Netflix, Shopify)
 * - Remote Developer APIs (Jobicy, Remotive, Arbeitnow)
 * 
 * Includes:
 * - Intelligent duplicate detection against existing jobs
 * - Automated skill keyword extraction
 * - Salary / Pay-scale heuristics extraction
 * - Experience level parsing
 * - Work mode & location categorization
 */

import { formatDisplaySalary } from "./jobClassification.js";

// Curated ATS Sources
export const JOB_SOURCES = [
  // 1. Fantastic.jobs Active ATS Feed (High Freshness Verified ATS Aggregator)
  {
    id: "fantastic_jobs_india",
    name: "Fantastic Jobs (India Active ATS)",
    type: "fantastic_jobs",
    url: "https://data.fantastic.jobs/v1/active-ats?time_frame=24h&limit=20&location=India&description_format=text&title=%22Developer%22",
    category: "india",
  },
  {
    id: "fantastic_jobs_global",
    name: "Fantastic Jobs (Global Active ATS)",
    type: "fantastic_jobs",
    url: "https://data.fantastic.jobs/v1/active-ats?time_frame=24h&limit=20&description_format=text&title=%22Developer%22",
    category: "remote",
  },

  // 2. Top Indian Product Companies (Greenhouse)
  { id: "flipkart", name: "Flipkart", type: "greenhouse", board: "flipkart", category: "india" },
  { id: "razorpay", name: "Razorpay", type: "greenhouse", board: "razorpay", category: "india" },
  { id: "swiggy", name: "Swiggy", type: "greenhouse", board: "swiggy", category: "india" },
  { id: "zomato", name: "Zomato", type: "greenhouse", board: "zomato", category: "india" },
  { id: "phonepe", name: "PhonePe", type: "greenhouse", board: "phonepe", category: "india" },
  { id: "paytm", name: "Paytm", type: "greenhouse", board: "paytm", category: "india" },
  { id: "zepto", name: "Zepto", type: "greenhouse", board: "zepto", category: "india" },
  { id: "blinkit", name: "Blinkit", type: "greenhouse", board: "blinkit", category: "india" },
  { id: "cred", name: "CRED", type: "greenhouse", board: "cred", category: "india" },
  { id: "groww", name: "Groww", type: "greenhouse", board: "groww", category: "india" },
  { id: "meesho", name: "Meesho", type: "greenhouse", board: "meesho", category: "india" },
  { id: "inmobi", name: "InMobi", type: "greenhouse", board: "inmobi", category: "india" },
  { id: "freshworks", name: "Freshworks", type: "greenhouse", board: "freshworks", category: "india" },
  { id: "browserstack", name: "BrowserStack", type: "greenhouse", board: "browserstack", category: "india" },

  // 2. Top Indian & World Tech (Ashby)
  { id: "zerodha", name: "Zerodha", type: "ashby", board: "zerodha", category: "india" },
  { id: "linear", name: "Linear", type: "ashby", board: "linear", category: "remote" },
  { id: "vercel", name: "Vercel", type: "ashby", board: "vercel", category: "remote" },
  { id: "supabase", name: "Supabase", type: "ashby", board: "supabase", category: "remote" },

  // 3. Global Product Companies (Greenhouse & Lever)
  { id: "atlassian", name: "Atlassian", type: "greenhouse", board: "atlassian", category: "remote" },
  { id: "adobe", name: "Adobe", type: "greenhouse", board: "adobe", category: "world" },
  { id: "stripe", name: "Stripe", type: "greenhouse", board: "stripe", category: "world" },
  { id: "airbnb", name: "Airbnb", type: "greenhouse", board: "airbnb", category: "world" },
  { id: "figma", name: "Figma", type: "greenhouse", board: "figma", category: "world" },
  { id: "gitlab", name: "GitLab", type: "greenhouse", board: "gitlab", category: "remote" },
  { id: "github", name: "GitHub", type: "greenhouse", board: "github", category: "remote" },
  { id: "coinbase", name: "Coinbase", type: "greenhouse", board: "coinbase", category: "remote" },
  { id: "spotify", name: "Spotify", type: "lever", board: "spotify", category: "world" },
  { id: "netflix", name: "Netflix", type: "lever", board: "netflix", category: "world" },
  { id: "shopify", name: "Shopify", type: "lever", board: "shopify", category: "remote" },

  // 4. Remote Job APIs
  { id: "jobicy", name: "Jobicy API", type: "jobicy", url: "https://jobicy.com/api/v2/remote-jobs?count=25&industry=engineering", category: "remote" },
  { id: "remotive", name: "Remotive API", type: "remotive", url: "https://remotive.com/api/remote-jobs?category=software-dev&limit=25", category: "remote" },
  { id: "arbeitnow", name: "Arbeitnow API", type: "arbeitnow", url: "https://www.arbeitnow.com/api/job-board-api", category: "remote" },
];

/**
 * Common technical skills to automatically identify from descriptions
 */
const TECH_SKILL_PATTERNS = [
  "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "C++", "Golang",
  "Go", "Rust", "Kotlin", "Swift", "Flutter", "Android", "iOS", "SQL", "PostgreSQL",
  "MongoDB", "Redis", "Kafka", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "Terraform", "CI/CD", "Next.js", "Vue.js", "Angular", "GraphQL", "REST APIs",
  "Microservices", "Spring Boot", "Django", "FastAPI", "Tailwind CSS", "DSA",
  "System Design", "Machine Learning", "Data Engineering", "Snowflake"
];

/**
 * Strips HTML tags cleanly into readable text
 */
export function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extracts skills from job text
 */
export function extractSkillsFromText(text) {
  if (!text) return ["Engineering", "Problem Solving"];
  const matched = new Set();
  const lower = text.toLowerCase();

  TECH_SKILL_PATTERNS.forEach((skill) => {
    const sLower = skill.toLowerCase();
    // Word boundary match
    const regex = new RegExp(`\\b${sLower.replace(/[+.]/g, "\\$&")}\\b`, "i");
    if (regex.test(lower)) {
      matched.add(skill);
    }
  });

  return matched.size > 0 ? Array.from(matched).slice(0, 8) : ["Software Engineering", "Tech"];
}

/**
 * Validates whether a job posting belongs to software engineering or technology
 */
export function isTechJob(title = "") {
  const t = title.toLowerCase();

  // Strong tech keywords (e.g. "software", "developer", "engineer", "data")
  const strongTechKeywords = [
    "software",
    "developer",
    "engineer",
    "devops",
    "architect",
    "data scientist",
    "data analyst",
    "data engineer",
    "frontend",
    "backend",
    "full stack",
    "fullstack",
    "sde",
    "qa",
    "test engineer",
    "machine learning",
    "ai ",
  ];

  if (strongTechKeywords.some((k) => t.includes(k))) {
    if (t.includes("safety") || t.includes("facilities") || t.includes("receptionist") || t.includes("warehouse")) {
      return false;
    }
    return true;
  }

  const nonTechKeywords = [
    "marketing",
    "sales",
    "recruiter",
    "recruiting",
    "talent acquisition",
    "human resources",
    "hr ",
    "payroll",
    "safety",
    "facilities",
    "legal",
    "paralegal",
    "accountant",
    "accounting",
    "customer service",
    "customer support",
    "community support",
    "receptionist",
    "executive assistant",
    "operations associate",
    "operations manager",
    "cashier",
    "driver",
    "warehouse",
    "nurse",
  ];

  if (nonTechKeywords.some((k) => t.includes(k))) {
    return false;
  }

  return true;
}

/**
 * Guesses experience requirements from text
 */
export function extractExperienceFromText(title = "", jd = "") {
  const combined = `${title} ${jd.slice(0, 1000)}`.toLowerCase();

  if (combined.includes("intern") || combined.includes("internship")) {
    return "Internship";
  }
  if (combined.includes("fresher") || combined.includes("0-1 year") || combined.includes("0 - 1 year") || combined.includes("graduate") || combined.includes("entry level")) {
    return "Fresher (0 - 1 Years)";
  }
  if (combined.includes("1-2") || combined.includes("1 - 2") || combined.includes("1+ year") || combined.includes("1 year")) {
    return "More than 1 year";
  }
  if (combined.includes("2-4") || combined.includes("2 - 3") || combined.includes("2+ year") || combined.includes("2 years")) {
    return "More than 2 years";
  }
  if (combined.includes("3-5") || combined.includes("3+ year") || combined.includes("3 years") || combined.includes("mid-level")) {
    return "More than 3 years";
  }
  if (combined.includes("5+") || combined.includes("5 years") || combined.includes("senior") || combined.includes("lead") || combined.includes("staff")) {
    return "More than 4 years";
  }

  return "More than 0 year";
}

/**
 * Extracts salary or competitive pay scale
 */
export function extractSalaryFromText(text = "") {
  if (!text) return "Competitive";

  // Look for LPA patterns (India)
  const lpaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)/i);
  if (lpaMatch) {
    return `${lpaMatch[1]}-${lpaMatch[2]} LPA`;
  }

  // Look for Hourly patterns ($)
  const hourlyMatch = text.match(/\$\s*(\d+)\s*(?:-|to)\s*\$?\s*(\d+)\s*(?:\/|\s*per\s*)hr/i);
  if (hourlyMatch) {
    return `$${hourlyMatch[1]} - $${hourlyMatch[2]} /hr`;
  }

  // Look for Annual USD
  const usdMatch = text.match(/\$\s*(\d{2,3}),?000\s*(?:-|to)\s*\$?\s*(\d{2,3}),?000/i);
  if (usdMatch) {
    return `$${usdMatch[1]}k - $${usdMatch[2]}k /yr`;
  }

  return "Competitive";
}

/**
 * Checks if a candidate job is a duplicate of any existing job
 */
export function isJobDuplicate(newJob, existingJobs = []) {
  if (!newJob || !existingJobs || existingJobs.length === 0) return false;

  const normNewTitle = (newJob.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normNewCompany = (newJob.company || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const newUrl = (newJob.url || "").trim().toLowerCase();

  return existingJobs.some((existing) => {
    // 1. Direct URL match
    const existingUrl = (existing.url || existing.link || "").trim().toLowerCase();
    if (newUrl && existingUrl && newUrl === existingUrl) {
      return true;
    }

    // 2. Exact Title + Company match
    const normExistingTitle = (existing.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const normExistingCompany = (existing.company || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    if (
      normNewTitle &&
      normExistingTitle &&
      normNewCompany &&
      normExistingCompany &&
      normNewTitle === normExistingTitle &&
      normNewCompany === normExistingCompany
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Fetches and normalizes jobs from a specific source
 */
export async function fetchJobsFromSource(source) {
  try {
    let rawJobs = [];

    // 1. Greenhouse ATS
    if (source.type === "greenhouse") {
      const url = `https://boards-api.greenhouse.io/v1/boards/${source.board}/jobs?content=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Greenhouse API responded with ${res.status}`);
      const data = await res.json();
      rawJobs = (data.jobs || []).filter((item) => isTechJob(item.title));

      return rawJobs.map((item) => {
        const plainJd = stripHtml(item.content);
        const title = item.title?.trim() || "Software Engineer";
        const location = item.location?.name?.trim() || (source.category === "india" ? "Bengaluru, India" : "Remote");
        const isRemote =
          location.toLowerCase().includes("remote") ||
          title.toLowerCase().includes("remote") ||
          source.category === "remote";

        return {
          sourceId: source.id,
          sourceName: source.name,
          externalId: `gh_${source.board}_${item.id}`,
          title,
          company: source.name,
          location,
          url: item.absolute_url,
          jobType: title.toLowerCase().includes("intern") ? "Internship" : "Full Time",
          experience: extractExperienceFromText(title, plainJd),
          salary: extractSalaryFromText(plainJd),
          domain: "Engineering",
          isRemote,
          skills: extractSkillsFromText(`${title}\n${plainJd}`).join(", "),
          jd: plainJd || `Apply directly for ${title} at ${source.name}. Full details on official company board.`,
          fetchedAt: new Date().toISOString(),
          status: "pending_approval",
        };
      });
    }

    // 2. Ashby ATS
    if (source.type === "ashby") {
      const url = `https://jobs.ashbyhq.com/api/non-public/job-board/${source.board}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Ashby API responded with ${res.status}`);
      const data = await res.json();
      rawJobs = (data.jobs || []).filter((item) => isTechJob(item.title));

      return rawJobs.map((item) => {
        const title = item.title?.trim() || "Software Engineer";
        const location = item.locationName || (source.category === "india" ? "Bengaluru, India" : "Remote");
        const isRemote =
          item.isRemote === true ||
          location.toLowerCase().includes("remote") ||
          title.toLowerCase().includes("remote");

        const plainJd = stripHtml(item.descriptionHtml || item.jobSummary || "");

        return {
          sourceId: source.id,
          sourceName: source.name,
          externalId: `ashby_${source.board}_${item.id}`,
          title,
          company: source.name,
          location,
          url: item.jobUrl || `https://jobs.ashbyhq.com/${source.board}/${item.id}`,
          jobType: item.employmentType === "Intern" || title.toLowerCase().includes("intern") ? "Internship" : "Full Time",
          experience: extractExperienceFromText(title, plainJd),
          salary: extractSalaryFromText(plainJd),
          domain: item.department || "Engineering",
          isRemote,
          skills: extractSkillsFromText(`${title}\n${plainJd}`).join(", "),
          jd: plainJd || `Apply directly for ${title} at ${source.name}.`,
          fetchedAt: new Date().toISOString(),
          status: "pending_approval",
        };
      });
    }

    // 3. Lever ATS
    if (source.type === "lever") {
      const url = `https://api.lever.co/v0/postings/${source.board}?mode=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Lever API responded with ${res.status}`);
      rawJobs = await res.json();

      return (Array.isArray(rawJobs) ? rawJobs : [])
        .filter((item) => isTechJob(item.text))
        .map((item) => {
        const title = item.text?.trim() || "Software Engineer";
        const location = item.categories?.location || "Remote";
        const isRemote =
          location.toLowerCase().includes("remote") ||
          item.categories?.commitment?.toLowerCase().includes("remote") ||
          source.category === "remote";

        const plainJd = stripHtml(item.description || item.descriptionPlain || "");

        return {
          sourceId: source.id,
          sourceName: source.name,
          externalId: `lever_${source.board}_${item.id}`,
          title,
          company: source.name,
          location,
          url: item.hostedUrl || item.applyUrl,
          jobType: item.categories?.commitment === "Internship" ? "Internship" : "Full Time",
          experience: extractExperienceFromText(title, plainJd),
          salary: extractSalaryFromText(plainJd),
          domain: item.categories?.department || "Engineering",
          isRemote,
          skills: extractSkillsFromText(`${title}\n${plainJd}`).join(", "),
          jd: plainJd || `Apply directly for ${title} at ${source.name}.`,
          fetchedAt: new Date().toISOString(),
          status: "pending_approval",
        };
      });
    }

    // 4. Jobicy Remote API
    if (source.type === "jobicy") {
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`Jobicy API error: ${res.status}`);
      const data = await res.json();
      rawJobs = data.jobs || [];

      return rawJobs.map((item) => {
        const title = item.jobTitle || "Remote Software Engineer";
        const plainJd = stripHtml(item.jobDescription || "");

        return {
          sourceId: source.id,
          sourceName: item.companyName || "Tech Employer",
          externalId: `jobicy_${item.id}`,
          title,
          company: item.companyName || "Tech Employer",
          location: item.jobGeo || "Worldwide Remote",
          url: item.url,
          jobType: item.jobType?.includes("Intern") ? "Internship" : "Full Time",
          experience: extractExperienceFromText(title, plainJd),
          salary: extractSalaryFromText(plainJd) || item.annualSalaryMin ? `$${item.annualSalaryMin}k-$${item.annualSalaryMax}k` : "Competitive",
          domain: "Engineering",
          isRemote: true,
          skills: extractSkillsFromText(`${title}\n${plainJd}`).join(", "),
          jd: plainJd,
          fetchedAt: new Date().toISOString(),
          status: "pending_approval",
        };
      });
    }

    // 5. Remotive Remote API
    if (source.type === "remotive") {
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`Remotive API error: ${res.status}`);
      const data = await res.json();
      rawJobs = data.jobs || [];

      return rawJobs.map((item) => {
        const title = item.title || "Remote Developer";
        const plainJd = stripHtml(item.description || "");

        return {
          sourceId: source.id,
          sourceName: item.company_name || "Tech Company",
          externalId: `remotive_${item.id}`,
          title,
          company: item.company_name || "Tech Company",
          location: item.candidate_required_location || "Worldwide Remote",
          url: item.url,
          jobType: item.job_type === "internship" ? "Internship" : "Full Time",
          experience: extractExperienceFromText(title, plainJd),
          salary: item.salary || extractSalaryFromText(plainJd),
          domain: item.category || "Engineering",
          isRemote: true,
          skills: (item.tags && item.tags.length > 0) ? item.tags.slice(0, 6).join(", ") : extractSkillsFromText(plainJd).join(", "),
          jd: plainJd,
          fetchedAt: new Date().toISOString(),
          status: "pending_approval",
        };
      });
    }

    // 6. Fantastic.jobs Active ATS API
    if (source.type === "fantastic_jobs") {
      const apiKey =
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_FANTASTIC_JOBS_API_KEY) ||
        (typeof process !== "undefined" && process.env?.VITE_FANTASTIC_JOBS_API_KEY) ||
        "";
      let res;

      try {
        res = await fetch(source.url, {
          headers: {
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`Fantastic Jobs responded with ${res.status}`);
      } catch (directErr) {
        // Fallback to local dev proxy if browser environment blocks direct cross-origin
        try {
          const proxyEndpoint = `/api/fantastic-jobs?url=${encodeURIComponent(source.url)}`;
          res = await fetch(proxyEndpoint);
        } catch {
          throw directErr;
        }
      }

      if (!res.ok) throw new Error(`Fantastic Jobs API error: ${res.status}`);
      const data = await res.json();

      // Enforce strict limit of 20 jobs and filter tech roles
      const jobsList = (Array.isArray(data) ? data : [])
        .filter((item) => isTechJob(item.title))
        .slice(0, 20);
      const creditsUsed = res.headers?.get ? res.headers.get("x-api-jobs-this-request") : "1";
      console.log(jobsList.length, "jobs,", creditsUsed, "credits used");

      return jobsList.map((item) => normalizeFantasticJob(item, source));
    }

    return [];
  } catch (err) {
    console.error(`Error fetching from ${source.name}:`, err);
    throw err;
  }
}

/**
 * Normalizes a Fantastic.jobs Active-ATS job record into the standard GetJobLink format
 */
export function normalizeFantasticJob(item, source = {}) {
  const title = item.title?.trim() || "Software Developer";
  const company = item.organization?.trim() || "Tech Company";

  let location;
  if (Array.isArray(item.locations_derived) && item.locations_derived.length > 0) {
    location = item.locations_derived[0];
  } else if (Array.isArray(item.countries_derived) && item.countries_derived.length > 0) {
    location = item.countries_derived[0];
  } else if (source.category === "india") {
    location = "India (Multiple Locations)";
  } else {
    location = "Remote";
  }

  const isRemote =
    item.ai_work_arrangement === "Remote" ||
    item.location_type === "TELECOMMUTE" ||
    location.toLowerCase().includes("remote") ||
    title.toLowerCase().includes("remote") ||
    source.category === "remote";

  const plainJd = item.description_text || stripHtml(item.description || "");

  let skillsList;
  if (Array.isArray(item.ai_key_skills) && item.ai_key_skills.length > 0) {
    skillsList = item.ai_key_skills.slice(0, 8);
  } else {
    skillsList = extractSkillsFromText(`${title}\n${plainJd}`);
  }

  let experience;
  if (item.ai_experience_level) {
    const expStr = String(item.ai_experience_level).toLowerCase();
    if (expStr.includes("0-1") || expStr.includes("0-2") || expStr.includes("intern") || expStr.includes("entry")) {
      experience = "Fresher (0 - 1 Years)";
    } else if (expStr.includes("1-2") || expStr.includes("1-3") || expStr.includes("2-3")) {
      experience = "1 - 2 Years";
    } else if (expStr.includes("2-4") || expStr.includes("3-5") || expStr.includes("3-4")) {
      experience = "2 - 4 Years";
    } else if (expStr.includes("5") || expStr.includes("more than 4") || expStr.includes("senior") || expStr.includes("lead")) {
      experience = "More than 4 years";
    } else {
      experience = extractExperienceFromText(title, plainJd);
    }
  } else {
    experience = extractExperienceFromText(title, plainJd);
  }

  let salary;
  if (item.salary) {
    salary = formatDisplaySalary(item.salary);
  }
  if (!salary && (item.ai_salary_value || item.ai_salary_min_value)) {
    const cur = item.ai_salary_currency === "INR" ? "₹" : (item.ai_salary_currency || "$");
    const minVal = item.ai_salary_min_value || item.ai_salary_value;
    const maxVal = item.ai_salary_max_value ? ` - ${cur}${item.ai_salary_max_value}` : "";
    salary = `${cur}${minVal}${maxVal}`;
  }
  if (!salary) {
    salary = extractSalaryFromText(plainJd) || "Competitive";
  }

  const empType = (item.ai_employment_type || item.employment_type || "").toLowerCase();
  const jobType = empType.includes("intern") || title.toLowerCase().includes("intern") ? "Internship" : "Full Time";

  return {
    sourceId: source.id || "fantastic_jobs",
    sourceName: company,
    externalId: `fantastic_${item.id}`,
    title,
    company,
    location,
    url: item.url,
    jobType,
    experience,
    salary,
    domain: "Engineering",
    isRemote,
    skills: skillsList.join(", "),
    jd: plainJd || `Apply directly for ${title} at ${company}. Direct verified ATS job posting.`,
    fetchedAt: new Date().toISOString(),
    status: "pending_approval",
  };
}

// -------------------------------------------------------------
// Persistent Storage for Auto-Fetched Admin Staging Queue
// Uses IndexedDB for full large-capacity storage with localStorage fallback
// -------------------------------------------------------------

const STAGING_DB_NAME = "GetJobLinkDB";
const STAGING_STORE_NAME = "admin_staging";
const STAGING_DB_VERSION = 1;
const STAGING_LOCAL_STORAGE_KEY = "gjl_admin_staged_jobs_cache";

function openStagingDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available in current environment"));
    }
    const req = window.indexedDB.open(STAGING_DB_NAME, STAGING_DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STAGING_STORE_NAME)) {
        db.createObjectStore(STAGING_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Persists staged jobs so that refreshing the page or switching tabs retains them.
 * @param {Array} jobs - List of unapproved staged job objects
 */
export async function saveStagedJobsPersistent(jobs) {
  if (!Array.isArray(jobs)) return;

  // 1. Try IndexedDB first (virtually unlimited capacity, handles long JDs seamlessly)
  try {
    const db = await openStagingDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STAGING_STORE_NAME, "readwrite");
      const store = tx.objectStore(STAGING_STORE_NAME);
      const req = store.put(jobs, "staged_jobs_list");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // If IndexedDB is blocked or private browsing mode, fallback to localStorage
  }

  // 2. Synchronous / quick fallback to localStorage if available
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STAGING_LOCAL_STORAGE_KEY, JSON.stringify(jobs));
    } catch {
      // Ignore QuotaExceededError if payload is too large for localStorage
    }
  }
}

/**
 * Loads staged jobs from persistent storage (IndexedDB or localStorage fallback).
 * @returns {Promise<Array>} Staged jobs array or empty array
 */
export async function loadStagedJobsPersistent() {
  // 1. Try IndexedDB
  try {
    const db = await openStagingDB();
    const jobs = await new Promise((resolve, reject) => {
      const tx = db.transaction(STAGING_STORE_NAME, "readonly");
      const store = tx.objectStore(STAGING_STORE_NAME);
      const req = store.get("staged_jobs_list");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (Array.isArray(jobs) && jobs.length > 0) {
      return jobs;
    }
  } catch {
    // Fall through to localStorage
  }

  // 2. Fallback to localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STAGING_LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return [];
}

/**
 * Clears staged jobs from persistent storage when queue is cleared or emptied.
 */
export async function clearStagedJobsPersistent() {
  try {
    const db = await openStagingDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STAGING_STORE_NAME, "readwrite");
      const store = tx.objectStore(STAGING_STORE_NAME);
      const req = store.delete("staged_jobs_list");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(STAGING_LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
