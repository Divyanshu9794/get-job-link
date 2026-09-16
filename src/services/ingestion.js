// // AI Job Ingestion Pipeline
// // This module provides a skeleton for ingesting jobs from legitimate, publicly-available
// // career endpoints (Greenhouse, Lever, Workday, Ashby, SmartRecruiters, RSS feeds).
// // It does NOT scrape LinkedIn, Indeed, or any site that prohibits automated access.
// // Each adapter must be explicitly enabled by an admin and may require API keys
// // stored in environment variables.

// import { doc, setDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
// import { db } from "../firebase";

// // Known job source adapters. Each returns an array of normalized job objects.
// // To add a new source, add an entry here and implement the adapter function.
// export const SOURCES = {
//   greenhouse: {
//     name: "Greenhouse",
//     enabled: false,
//     apiKey: process.env.GREENHOUSE_API_KEY,
//     // https://www.greenhouse.io/developers
//     adapter: async (config) => {
//       // Placeholder: fetch from Greenhouse job board API
//       return [];
//     }
//   },
//   lever: {
//     name: "Lever",
//     enabled: false,
//     apiKey: null,
//     adapter: async (config) => {
//       // Placeholder: fetch from Lever API
//       return [];
//     }
//   },
//   workday: {
//     name: "Workday",
//     enabled: false,
//     apiKey: null,
//     adapter: async (config) => {
//       // Placeholder: fetch from Workday career site
//       return [];
//     }
//   },
//   ashby: {
//     name: "Ashby",
//     enabled: false,
//     apiKey: null,
//     adapter: async (config) => {
//       // Placeholder: fetch from Ashby API
//       return [];
//     }
//   },
//   smartrecruiters: {
//     name: "SmartRecruiters",
//     enabled: false,
//     apiKey: null,
//     adapter: async (config) => {
//       // Placeholder: fetch from SmartRecruiters API
//       return [];
//     }
//   },
//   rss: {
//     name: "RSS Feeds",
//     enabled: false,
//     apiKey: null,
//     adapter: async (config) => {
//       // Placeholder: fetch from RSS feed
//       return [];
//     }
//   }
// };

// // Normalize a raw job object into the GetJobLink schema.
// // This is where AI classification would happen (using @google/genai).
// export function normalizeJob(rawJob, source) {
//   return {
//     title: rawJob.title || "Unknown Title",
//     company: rawJob.company || "Unknown Company",
//     jd: rawJob.description || "No description provided.",
//     url: rawJob.url || "",
//     jobType: rawJob.jobType || "Full Time",
//     experience: rawJob.experience || "More than 0 year",
//     salary: rawJob.salary || "Competitive",
//     domain: rawJob.domain || "Engineering",
//     isRemote: Boolean(rawJob.isRemote),
//     skills: rawJob.skills || [],
//     fresherFriendly: Boolean(rawJob.fresherFriendly),
//     category: rawJob.category || "Technical",
//     subCategory: rawJob.subCategory || "Software Engineering",
//     experienceLevel: rawJob.experienceLevel || "Entry Level",
//     remoteType: rawJob.remoteType || "On-site",
//     source: source,
//     sourceUrl: rawJob.sourceUrl || "",
//     postedDate: rawJob.postedDate || null,
//     deadline: rawJob.deadline || null,
//     createdAt: Date.now()
//   };
// }

// // Deduplicate jobs by title + company + url
// export async function deduplicateJob(normalizedJob) {
//   const q = query(
//     collection(db, "jobs"),
//     where("title", "==", normalizedJob.title),
//     where("company", "==", normalizedJob.company)
//   );
//   const snapshot = await getDocs(q);
//   return snapshot.docs.some(doc => doc.data().url === normalizedJob.url);
// }

// // Ingest jobs from a specific source
// export async function ingestJobs(sourceKey, config = {}) {
//   const source = SOURCES[sourceKey];
//   if (!source || !source.enabled) {
//     throw new Error(`Source ${sourceKey} is not enabled`);
//   }

//   const rawJobs = await source.adapter(config);
//   const normalizedJobs = rawJobs.map(job => normalizeJob(job, source.name));

//   const batch = writeBatch(db);
//   let addedCount = 0;
//   for (const job of normalizedJobs) {
//     const isDuplicate = await deduplicateJob(job);
//     if (!isDuplicate) {
//       const docRef = doc(collection(db, "jobs"));
//       batch.set(docRef, job);
//       addedCount++;
//     }
//   }

//   if (addedCount > 0) {
//     await batch.commit();
//   }

//   return { source: source.name, rawCount: rawJobs.length, addedCount };
// }

// // Ingest from all enabled sources
// export async function ingestAllJobs() {
//   const results = [];
//   for (const [key, source] of Object.entries(SOURCES)) {
//     if (source.enabled) {
//       try {
//         const result = await ingestJobs(key);
//         results.push(result);
//       } catch (error) {
//         console.error(`Error ingesting from ${key}:`, error);
//         results.push({ source: source.name, error: error.message });
//       }
//     }
//   }
//   return results;
// }

// // AI classification using Google GenAI (when available)
// export async function classifyJobAI(rawText) {
//   // This is a placeholder for AI classification.
//   // When @google/genai is available, this would call the model
//   // to extract structured JSON from raw job text.
//   return {
//     category: "Technical",
//     subCategory: "Software Engineering",
//     experienceLevel: "Entry Level",
//     fresherFriendly: false,
//     remoteType: "On-site",
//     skills: []
//   };
// }










// AI Job Ingestion Pipeline
// This module provides a skeleton for ingesting jobs from legitimate, publicly-available
// career endpoints (Greenhouse, Lever, Workday, Ashby, SmartRecruiters, RSS feeds).
// It does NOT scrape LinkedIn, Indeed, or any site that prohibits automated access.
// Each adapter must be explicitly enabled by an admin and may require API keys.

import { doc, setDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
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

// Known job source adapters. Each returns an array of normalized job objects.
// To add a new source, add an entry here and implement the adapter function.
export const SOURCES = {
  greenhouse: {
    name: "Greenhouse",
    enabled: false,
    apiKey: getEnvVar("VITE_GREENHOUSE_API_KEY"),
    // https://www.greenhouse.io/developers
    adapter: async (config) => {
      // Placeholder: fetch from Greenhouse job board API
      return [];
    }
  },
  lever: {
    name: "Lever",
    enabled: false,
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from Lever API
      return [];
    }
  },
  workday: {
    name: "Workday",
    enabled: false,
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from Workday career site
      return [];
    }
  },
  ashby: {
    name: "Ashby",
    enabled: false,
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from Ashby API
      return [];
    }
  },
  smartrecruiters: {
    name: "SmartRecruiters",
    enabled: false,
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from SmartRecruiters API
      return [];
    }
  },
  rss: {
    name: "RSS Feeds",
    enabled: false,
    apiKey: null,
    adapter: async (config) => {
      // Placeholder: fetch from RSS feed
      return [];
    }
  }
};

// Normalize a raw job object into the GetJobLink schema.
// This is where AI classification would happen (using @google/genai).
export function normalizeJob(rawJob, source) {
  return {
    title: rawJob.title || "Unknown Title",
    company: rawJob.company || "Unknown Company",
    jd: rawJob.description || "No description provided.",
    url: rawJob.url || "",
    jobType: rawJob.jobType || "Full Time",
    experience: rawJob.experience || "More than 0 year",
    salary: rawJob.salary || "Competitive",
    domain: rawJob.domain || "Engineering",
    isRemote: Boolean(rawJob.isRemote),
    skills: rawJob.skills || [],
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