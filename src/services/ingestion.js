import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

// Safe environment variable getter for browser/Vite compatibility
const getEnvVar = (key) => {
  // If running in Vite
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || "";
  }
  // Safe fallback if process exists (Node environment)
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || "";
  }
  return "";
};

// Helper: fetch with AbortController timeout
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

// CORS proxy for RSS feeds
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// Known job source adapters. Each returns an array of normalized job objects.
// To add a new source, add an entry here and implement the adapter function.
export const SOURCES = {
  greenhouse: {
    name: "Greenhouse",
    enabled: true,
    board: getEnvVar("VITE_GREENHOUSE_BOARDS") || "google,netflix,airbnb",
    company: "",
    feedUrl: "",
    apiKey: getEnvVar("VITE_GREENHOUSE_API_KEY"),
    // https://www.greenhouse.io/developers
    adapter: async (config) => {
      const boards = (config.board || getEnvVar("VITE_GREENHOUSE_BOARDS") || "").split(",").map(b => b.trim()).filter(Boolean);
      if (boards.length === 0) return [];

      const jobs = [];
      for (const board of boards) {
        try {
          const res = await fetchWithTimeout(`https://api.greenhouse.io/v1/boards/${board}/jobs`, {}, 15000);
          if (!res.ok) continue;
          const data = await res.json();
          const list = data.jobs || [];
          for (const j of list) {
            const loc = j.absolute_url || "";
            const desc = j.content || j.description || "";
            jobs.push({
              title: j.title || "",
              company: board,
              description: desc,
              url: loc,
              jobType: "",
              experience: "",
              salary: "",
              domain: "",
              isRemote: false,
              skills: [],
              fresherFriendly: false,
              category: "",
              subCategory: "",
              experienceLevel: "",
              remoteType: "",
              sourceUrl: loc,
              postedDate: null,
              deadline: null
            });
          }
        } catch (e) {
          console.error(`Greenhouse board ${board} error:`, e);
        }
      }
      return jobs;
    }
  },
  lever: {
    name: "Lever",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      const company = config.company || "";
      if (!company) return [];
      try {
        const res = await fetchWithTimeout(`https://api.lever.co/v0/postings/${company}`, {}, 15000);
        if (!res.ok) return [];
        const data = await res.json();
        return (data || []).map(j => ({
          title: j.text || "",
          company: j.hostedUrl ? j.hostedUrl.split("/")[2] : company,
          description: j.description || "",
          url: j.hostedUrl || "",
          jobType: "",
          experience: "",
          salary: "",
          domain: "",
          isRemote: false,
          skills: [],
          fresherFriendly: false,
          category: "",
          subCategory: "",
          experienceLevel: "",
          remoteType: "",
          sourceUrl: j.hostedUrl || "",
          postedDate: null,
          deadline: null
        }));
      } catch (e) {
        console.error(`Lever company ${company} error:`, e);
        return [];
      }
    }
  },
  workday: {
    name: "Workday",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from Workday career site
      return [];
    }
  },
  ashby: {
    name: "Ashby",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from Ashby API
      return [];
    }
  },
  smartrecruiters: {
    name: "SmartRecruiters",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from SmartRecruiters API
      return [];
    }
  },
  rss: {
    name: "RSS Feeds",
    enabled: false,
    board: "",
    company: "",
    feedUrl: "",
    apiKey: null,
    adapter: async (config) => {
      const feedUrl = config.feedUrl || "";
      if (!feedUrl) return [];
      try {
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
        const res = await fetchWithTimeout(proxyUrl, {}, 15000);
        if (!res.ok) return [];
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const items = xml.querySelectorAll("item, entry");
        return Array.from(items).map(item => {
          const titleEl = item.querySelector("title");
          const linkEl = item.querySelector("link");
          const descEl = item.querySelector("description, summary");
          return {
            title: titleEl ? titleEl.textContent : "",
            company: "",
            description: descEl ? descEl.textContent : "",
            url: linkEl ? (linkEl.getAttribute("href") || linkEl.textContent) : "",
            jobType: "",
            experience: "",
            salary: "",
            domain: "",
            isRemote: false,
            skills: [],
            fresherFriendly: false,
            category: "",
            subCategory: "",
            experienceLevel: "",
            remoteType: "",
            sourceUrl: linkEl ? (linkEl.getAttribute("href") || linkEl.textContent) : "",
            postedDate: null,
            deadline: null
          };
        });
      } catch (e) {
        console.error(`RSS feed ${feedUrl} error:`, e);
        return [];
      }
    }
  }
};

// Extract skills from job text
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
  const skills = extractSkills(description);

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
    skills: rawJob.skills || skills,
    fresherFriendly: Boolean(rawJob.fresherFriendly),
    category: rawJob.category || "Technical",
    subCategory: rawJob.subCategory || "Software Engineering",
    experienceLevel: rawJob.experienceLevel || "Entry Level",
    remoteType: rawJob.remoteType || "On-site",
    source: source,
    sourceUrl: rawJob.sourceUrl || "",
    postedDate: rawJob.postedDate || null,
    deadline: rawJob.deadline || null,
    createdAt: Date.now()
  };
}

// Deduplicate jobs by title + company + url
export async function deduplicateJob(normalizedJob) {
  const q = query(
    collection(db, "jobs"),
    where("title", "==", normalizedJob.title),
    where("company", "==", normalizedJob.company)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.some(doc => doc.data().url === normalizedJob.url);
}

// Ingest jobs from a specific source
export async function ingestJobs(sourceKey, config = {}) {
  const source = SOURCES[sourceKey];
  if (!source || !source.enabled) {
    throw new Error(`Source ${sourceKey} is not enabled`);
  }

  const rawJobs = await source.adapter(config);
  const normalizedJobs = rawJobs.map(job => normalizeJob(job, source.name));

  const batch = writeBatch(db);
  let addedCount = 0;
  for (const job of normalizedJobs) {
    const isDuplicate = await deduplicateJob(job);
    if (!isDuplicate) {
      const docRef = doc(collection(db, "jobs"));
      batch.set(docRef, job);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    await batch.commit();
  }

  return { source: source.name, rawCount: rawJobs.length, addedCount };
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
  // This is a placeholder for AI classification.
  // When @google/genai is available, this would call the model
  // to extract structured JSON from raw job text.
  return {
    category: "Technical",
    subCategory: "Software Engineering",
    experienceLevel: "Entry Level",
    fresherFriendly: false,
    remoteType: "On-site",
    skills: []
  };
}