/**
 * Hiring Radar & Hiring Analytics Core Aggregation Engine
 * GetJobLink (https://getjoblink.in)
 * 
 * Factual, idempotent analytical processor for job listings, companies, skills, and trends.
 * Computes public intelligence and admin telemetry directly from verified Firestore records.
 */

import { isRemoteJob } from "./jobClassification.js";

/**
 * Normalizes company names to prevent duplicate company records
 * Handles trimming, casing, and common legal suffixes (e.g. "Google LLC" -> "Google")
 */
export function normalizeCompanyName(rawName) {
  if (!rawName || typeof rawName !== "string") return "Unknown Company";
  let clean = rawName.trim();
  if (!clean) return "Unknown Company";

  // Remove trailing company entity designations while preserving brand identity
  const cleaned = clean
    .replace(/\s+(?:Inc\.?|LLC\.?|Ltd\.?|Pvt\.?\s*Ltd\.?|Limited|Corporation|Corp\.?)$/i, "")
    .trim();

  return cleaned || clean;
}

/**
 * Creates a URL-friendly slug from a company name (e.g. "Google Cloud" -> "google-cloud")
 */
export function createCompanySlug(companyName) {
  const norm = normalizeCompanyName(companyName);
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "unknown-company";
}

/**
 * Extracts a numeric timestamp from any job document date representation
 */
export function getJobTimestamp(job) {
  if (!job) return 0;
  const t = job.createdAt || job.date;
  if (!t) return 0;
  if (typeof t === "object" && t.seconds) return t.seconds * 1000;
  if (typeof t === "number") return t;
  const parsed = new Date(t).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extracts skills array from job document
 */
export function extractSkills(job) {
  if (!job) return [];
  if (Array.isArray(job.skills) && job.skills.length > 0) {
    return job.skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0) {
    return job.requiredSkills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof job.skills === "string" && job.skills.trim()) {
    return job.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Computes full Hiring Radar & Hiring Analytics dataset from raw jobs list
 * 
 * @param {Array} jobs - Raw job documents from Firestore
 * @param {Object} options - Optional reference timestamp and configuration
 */
export function processHiringRadarData(jobs = [], options = {}) {
  const now = options.now || Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Time boundaries
  const t7DaysAgo = now - 7 * ONE_DAY_MS;
  const t14DaysAgo = now - 14 * ONE_DAY_MS;
  const t30DaysAgo = now - 30 * ONE_DAY_MS;
  const t60DaysAgo = now - 60 * ONE_DAY_MS;
  const t90DaysAgo = now - 90 * ONE_DAY_MS;

  // Storage aggregations
  const companyMap = new Map(); // key: normalizedCompanyName
  const skillFrequency7d = new Map();
  const skillFrequency30d = new Map();
  const skillFrequency90d = new Map();
  const skillFrequencyAll = new Map();
  const skillPairingsMap = new Map(); // "skillA + skillB" -> count

  const locationMap = new Map(); // city -> { city, country, count, companies: Set }
  const domainMap = new Map(); // domain -> count
  const dailyJobCounts = new Map(); // YYYY-MM-DD -> count
  const workModeCounts = { remote: 0, hybrid: 0, onsite: 0 };

  // Data Quality Metrics
  const dataQuality = {
    totalChecked: jobs.length,
    missingCompany: 0,
    missingLocation: 0,
    missingSkills: 0,
    missingDates: 0,
    malformedSkills: 0,
    potentialDuplicates: 0,
    duplicateGroups: [],
  };

  const seenJobSignatures = new Map(); // "company|title|location" -> [jobId]
  let earliestObservationDate = now;

  // 1. Process Individual Jobs
  jobs.forEach((job) => {
    const rawCompany = job.company;
    const companyName = normalizeCompanyName(rawCompany);
    const slug = createCompanySlug(companyName);
    const jobTime = getJobTimestamp(job);
    const isRemote = isRemoteJob(job);
    const locationStr = String(job.location || "").trim();
    const domainStr = String(job.domain || "Engineering").trim() || "Engineering";
    const skills = extractSkills(job);

    // Track earliest observation
    if (jobTime > 0 && jobTime < earliestObservationDate) {
      earliestObservationDate = jobTime;
    }

    // Data Quality Audits
    if (!rawCompany || String(rawCompany).trim().toLowerCase() === "null" || String(rawCompany).trim() === "") {
      dataQuality.missingCompany++;
    }
    if (!locationStr || locationStr.toLowerCase() === "null" || locationStr.toLowerCase() === "undefined") {
      dataQuality.missingLocation++;
    }
    if (skills.length === 0) {
      dataQuality.missingSkills++;
    } else if (skills.some((s) => s.length > 40 || s.includes("\n") || s.includes("{"))) {
      dataQuality.malformedSkills++;
    }
    if (jobTime === 0) {
      dataQuality.missingDates++;
    }

    // Duplicate detection heuristic (Normalized company + title + location)
    const signature = `${companyName.toLowerCase()}|${String(job.title || "").toLowerCase().trim()}|${locationStr.toLowerCase()}`;
    if (seenJobSignatures.has(signature)) {
      const existing = seenJobSignatures.get(signature);
      existing.push(job.id);
      if (existing.length === 2) {
        dataQuality.potentialDuplicates++;
        dataQuality.duplicateGroups.push({
          signature,
          company: companyName,
          title: job.title,
          ids: existing,
        });
      }
    } else {
      seenJobSignatures.set(signature, [job.id]);
    }

    // Work mode aggregation
    if (isRemote) {
      workModeCounts.remote++;
    } else if (locationStr.toLowerCase().includes("hybrid")) {
      workModeCounts.hybrid++;
    } else {
      workModeCounts.onsite++;
    }

    // Domain aggregation
    domainMap.set(domainStr, (domainMap.get(domainStr) || 0) + 1);

    // Location aggregation (Extract clean city/country)
    let cleanCity = locationStr || "India";
    let cleanCountry = "India";
    if (cleanCity.includes(",")) {
      const parts = cleanCity.split(",").map((p) => p.trim());
      cleanCity = parts[0];
      cleanCountry = parts[parts.length - 1];
    }
    if (!locationMap.has(cleanCity)) {
      locationMap.set(cleanCity, {
        city: cleanCity,
        country: cleanCountry,
        count: 0,
        companies: new Set(),
      });
    }
    const locItem = locationMap.get(cleanCity);
    locItem.count++;
    locItem.companies.add(companyName);

    // Daily trends aggregation
    if (jobTime > 0) {
      try {
        const d = new Date(jobTime);
        if (!isNaN(d.getTime())) {
          const dayKey = d.toISOString().split("T")[0];
          dailyJobCounts.set(dayKey, (dailyJobCounts.get(dayKey) || 0) + 1);
        }
      } catch {
        // Ignore invalid time value
      }
    }

    // Skills aggregation by time window
    skills.forEach((skill) => {
      skillFrequencyAll.set(skill, (skillFrequencyAll.get(skill) || 0) + 1);
      if (jobTime >= t90DaysAgo) {
        skillFrequency90d.set(skill, (skillFrequency90d.get(skill) || 0) + 1);
      }
      if (jobTime >= t30DaysAgo) {
        skillFrequency30d.set(skill, (skillFrequency30d.get(skill) || 0) + 1);
      }
      if (jobTime >= t7DaysAgo) {
        skillFrequency7d.set(skill, (skillFrequency7d.get(skill) || 0) + 1);
      }
    });

    // Skill co-occurrence / combinations (Top pairs)
    if (skills.length > 1) {
      const sortedSkills = [...new Set(skills)].sort();
      for (let i = 0; i < sortedSkills.length; i++) {
        for (let j = i + 1; j < sortedSkills.length; j++) {
          const pairKey = `${sortedSkills[i]} + ${sortedSkills[j]}`;
          skillPairingsMap.set(pairKey, (skillPairingsMap.get(pairKey) || 0) + 1);
        }
      }
    }

    // Company profile aggregation
    if (!companyMap.has(companyName)) {
      companyMap.set(companyName, {
        companyName,
        slug,
        activeJobs: 0,
        jobsLast7d: 0,
        jobsPrev7d: 0,
        jobsLast30d: 0,
        jobsPrev30d: 0,
        firstObservedAt: jobTime > 0 ? jobTime : now,
        lastJobAddedAt: jobTime > 0 ? jobTime : now,
        locations: new Set(),
        skills: new Map(),
        domains: new Set(),
        titles: new Set(),
        recentJobs: [],
      });
    }

    const c = companyMap.get(companyName);
    c.activeJobs++;
    if (locationStr) c.locations.add(locationStr);
    if (domainStr) c.domains.add(domainStr);
    if (job.title) c.titles.add(job.title.trim());

    if (jobTime > 0) {
      if (jobTime < c.firstObservedAt) c.firstObservedAt = jobTime;
      if (jobTime > c.lastJobAddedAt) c.lastJobAddedAt = jobTime;

      // 7d vs Prev 7d (7-14d)
      if (jobTime >= t7DaysAgo) {
        c.jobsLast7d++;
      } else if (jobTime >= t14DaysAgo && jobTime < t7DaysAgo) {
        c.jobsPrev7d++;
      }

      // 30d vs Prev 30d (30-60d)
      if (jobTime >= t30DaysAgo) {
        c.jobsLast30d++;
      } else if (jobTime >= t60DaysAgo && jobTime < t30DaysAgo) {
        c.jobsPrev30d++;
      }
    }

    skills.forEach((s) => {
      c.skills.set(s, (c.skills.get(s) || 0) + 1);
    });

    // Store up to 5 recent jobs for company card preview
    if (c.recentJobs.length < 5) {
      c.recentJobs.push({
        id: job.id,
        title: job.title,
        location: job.location,
        experience: job.experience,
        salary: job.salary,
        jobType: job.jobType,
        isRemote,
        createdAt: jobTime,
      });
    }
  });

  // 2. Format & Transform Company Profiles
  const companiesList = Array.from(companyMap.values()).map((c) => {
    // Sort company top skills
    const topCompanySkills = Array.from(c.skills.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    // Hiring trend calculation:
    // Compares recent 7-day velocity to previous 7-day velocity
    let trend = "Steady"; // "Surging" | "Increasing" | "Steady" | "New Listing"
    let velocityScore = c.jobsLast7d;

    if (c.firstObservedAt >= t7DaysAgo) {
      trend = "New This Week";
    } else if (c.jobsLast7d >= 3 && c.jobsLast7d > c.jobsPrev7d * 1.5) {
      trend = "Surging";
    } else if (c.jobsLast7d > c.jobsPrev7d && c.jobsLast7d >= 2) {
      trend = "Increasing";
    } else if (c.jobsLast30d > c.jobsPrev30d && c.jobsLast30d >= 3) {
      trend = "Active";
    }

    return {
      companyName: c.companyName,
      slug: c.slug,
      activeJobs: c.activeJobs,
      jobsLast7d: c.jobsLast7d,
      jobsPrev7d: c.jobsPrev7d,
      jobsLast30d: c.jobsLast30d,
      jobsPrev30d: c.jobsPrev30d,
      firstObservedAt: c.firstObservedAt,
      lastJobAddedAt: c.lastJobAddedAt,
      isNewThisWeek: c.firstObservedAt >= t7DaysAgo,
      isMultiRole: c.titles.size >= 2 || c.domains.size >= 2,
      distinctRolesCount: c.titles.size,
      distinctDomainsCount: c.domains.size,
      locations: Array.from(c.locations),
      topLocations: Array.from(c.locations).slice(0, 3),
      topSkills: topCompanySkills,
      domains: Array.from(c.domains),
      trend,
      velocityScore,
      recentJobs: c.recentJobs.sort((a, b) => b.createdAt - a.createdAt),
    };
  });

  // 3. Overview Metrics & Historical Comparisons
  const totalCompaniesCount = companiesList.length;
  const companiesHiringNowCount = companiesList.filter((c) => c.activeJobs > 0).length;

  const newCompaniesThisWeekCount = companiesList.filter((c) => c.firstObservedAt >= t7DaysAgo).length;
  const newCompaniesPrevWeekCount = companiesList.filter(
    (c) => c.firstObservedAt >= t14DaysAgo && c.firstObservedAt < t7DaysAgo
  ).length;

  const newJobsThisWeekCount = jobs.filter((j) => getJobTimestamp(j) >= t7DaysAgo).length;
  const newJobsPrevWeekCount = jobs.filter(
    (j) => getJobTimestamp(j) >= t14DaysAgo && getJobTimestamp(j) < t7DaysAgo
  ).length;

  const multiRoleCompaniesCount = companiesList.filter((c) => c.isMultiRole).length;

  // 4. Sorted Subsets for UI Sections
  // A. Rising Hiring Activity (Ranked by recent 7d/30d activity velocity)
  const risingCompanies = [...companiesList]
    .sort((a, b) => {
      if (b.jobsLast7d !== a.jobsLast7d) return b.jobsLast7d - a.jobsLast7d;
      if (b.jobsLast30d !== a.jobsLast30d) return b.jobsLast30d - a.jobsLast30d;
      return b.activeJobs - a.activeJobs;
    })
    .slice(0, 24);

  // B. Newly Discovered Companies (First observed date desc)
  const newlyDiscoveredCompanies = [...companiesList]
    .sort((a, b) => b.firstObservedAt - a.firstObservedAt)
    .slice(0, 16);

  // C. Top In-Demand Skills (with time-filtered arrays)
  const totalAnalyzedListings = jobs.length || 1;

  function formatSkillList(frequencyMap) {
    return Array.from(frequencyMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalAnalyzedListings) * 100) || 1,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  const topSkills7d = formatSkillList(skillFrequency7d);
  const topSkills30d = formatSkillList(skillFrequency30d);
  const topSkills90d = formatSkillList(skillFrequency90d);
  const topSkillsAll = formatSkillList(skillFrequencyAll);

  // D. Top Co-occurring Skill Combinations
  const topSkillPairings = Array.from(skillPairingsMap.entries())
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // E. Hiring Locations
  const topLocations = Array.from(locationMap.values())
    .map((loc) => ({
      city: loc.city,
      country: loc.country,
      count: loc.count,
      topCompanies: Array.from(loc.companies).slice(0, 4),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // F. Domain Distribution
  const domainDistribution = Array.from(domainMap.entries())
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / totalAnalyzedListings) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // G. Daily / Weekly Posting Trends
  const sortedDays = Array.from(dailyJobCounts.keys()).sort();
  const recentDays = sortedDays.slice(-30).map((date) => ({
    date,
    count: dailyJobCounts.get(date) || 0,
  }));

  return {
    updatedAt: now,
    earliestObservationDate,
    totalActiveJobs: jobs.length,
    overview: {
      totalCompanies: totalCompaniesCount,
      companiesHiring: companiesHiringNowCount,
      newCompaniesThisWeek: newCompaniesThisWeekCount,
      newCompaniesPrevWeek: newCompaniesPrevWeekCount,
      newJobsThisWeek: newJobsThisWeekCount,
      newJobsPrevWeek: newJobsPrevWeekCount,
      multiRoleCompanies: multiRoleCompaniesCount,
    },
    risingCompanies,
    newlyDiscoveredCompanies,
    skills: {
      "7d": topSkills7d,
      "30d": topSkills30d,
      "90d": topSkills90d,
      all: topSkillsAll,
      pairings: topSkillPairings,
    },
    locations: topLocations,
    domains: domainDistribution,
    workModes: workModeCounts,
    dailyTrends: recentDays,
    dataQuality,
    companies: companiesList, // Complete list for admin table
    companyDict: Object.fromEntries(companiesList.map((c) => [c.slug, c])),
  };
}
