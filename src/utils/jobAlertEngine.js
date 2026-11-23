/**
 * Smart Job Alert Engine
 * Evaluates whether new or indexed jobs match user alerts with zero false triggers.
 */

import { areSkillsMatching, normalizeToken } from "./jobMatchEngine.js";
import { getJobTimestamp, matchesExperienceFilter } from "./jobClassification.js";

/**
 * Checks if a job matches a specific alert definition
 * 
 * @param {Object} alert - Alert configuration
 * @param {Object} job - Job document
 * @returns {Object} { matches: boolean, matchedCriteria: string[], matchScore: number }
 */
export function checkAlertMatch(alert, job) {
  if (!alert || !job) {
    return { matches: false, matchedCriteria: [], matchScore: 0 };
  }

  // If alert is paused, never trigger
  if (alert.active === false || alert.paused === true) {
    return { matches: false, matchedCriteria: [], matchScore: 0 };
  }

  const matchedCriteria = [];
  let points = 0;
  let totalEvaluated = 0;

  // 1. Role / Title Match
  if (alert.role && alert.role.trim()) {
    totalEvaluated += 30;
    const alertRoleNorm = normalizeToken(alert.role);
    const titleNorm = normalizeToken(job.title || "");
    if (titleNorm.includes(alertRoleNorm) || alertRoleNorm.includes(titleNorm)) {
      matchedCriteria.push(`Role: ${alert.role}`);
      points += 30;
    } else {
      // If explicit role is set and completely mismatched, return false early
      const alertWords = alertRoleNorm.split(" ").filter((w) => w.length > 2);
      const titleWords = titleNorm.split(" ").filter((w) => w.length > 2);
      const hasCommon = alertWords.some((w) => titleWords.includes(w));
      if (!hasCommon) {
        return { matches: false, matchedCriteria: [], matchScore: 0 };
      }
      points += 15;
    }
  }

  // 2. Skills Match
  const alertSkills = (Array.isArray(alert.skills) ? alert.skills : (alert.skills || "").split(","))
    .map((s) => s.trim())
    .filter(Boolean);

  if (alertSkills.length > 0) {
    totalEvaluated += 35;
    const jobSkills = Array.isArray(job.skills)
      ? job.skills
      : (job.skills || "").split(/[,|/]/).map((s) => s.trim());

    const matchedSkills = alertSkills.filter((aSkill) =>
      jobSkills.some((jSkill) => areSkillsMatching(aSkill, jSkill))
    );

    if (matchedSkills.length > 0) {
      matchedCriteria.push(`Skills: ${matchedSkills.slice(0, 3).join(", ")}`);
      points += Math.min(35, Math.round((matchedSkills.length / alertSkills.length) * 35));
    }
  }

  // 3. Location Match
  if (alert.location && alert.location.trim()) {
    totalEvaluated += 15;
    const alertLocNorm = normalizeToken(alert.location);
    const jobLocNorm = normalizeToken(job.location || "");

    if (jobLocNorm.includes(alertLocNorm) || alertLocNorm.includes(jobLocNorm)) {
      matchedCriteria.push(`Location: ${alert.location}`);
      points += 15;
    }
  }

  // 4. Remote Filter
  if (alert.isRemoteOnly) {
    totalEvaluated += 10;
    const isJobRemote =
      job.isRemote === true ||
      (job.location || "").toLowerCase().includes("remote") ||
      (job.jobType || "").toLowerCase().includes("remote");

    if (isJobRemote) {
      matchedCriteria.push("Remote opportunity");
      points += 10;
    } else {
      return { matches: false, matchedCriteria: [], matchScore: 0 };
    }
  }

  // 5. Experience Filter
  if (alert.experienceLevel && alert.experienceLevel.trim()) {
    totalEvaluated += 10;
    const alertExp = alert.experienceLevel.toLowerCase();
    const jobExp = (job.experience || "").toLowerCase();

    const isFresherAlert = alertExp.includes("fresher") || alertExp.includes("0");
    const isFresherJob = jobExp.includes("fresher") || jobExp.includes("0") || jobExp.includes("intern");

    if (isFresherAlert && isFresherJob) {
      matchedCriteria.push("Fresher / Entry-level role");
      points += 10;
    } else if (!isFresherAlert && !isFresherJob) {
      points += 10;
    }
  }

  const matchScore = totalEvaluated > 0 ? Math.round((points / totalEvaluated) * 100) : 80;
  const matches = matchScore >= 60 && matchedCriteria.length > 0;

  return {
    matches,
    matchedCriteria,
    matchScore,
  };
}

/**
 * Generates an in-app alert notification item
 */
export function createNotificationItem(alert, job, matchedCriteria) {
  return {
    id: `notif_${alert.id}_${job.id}`,
    alertId: alert.id,
    alertTitle: alert.title || alert.role || "Job Alert",
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    isRemote: job.isRemote,
    url: `/job/${job.id}`,
    matchedCriteria: matchedCriteria || [],
    createdAt: new Date().toISOString(),
    isRead: false,
  };
}

/**
 * Filters a list of jobs to only those added within the specified time window (in hours).
 */
export function filterJobsByTimeWindow(jobs, hours = 24) {
  if (!Array.isArray(jobs)) return [];
  const cutoffMs = Date.now() - hours * 60 * 60 * 1000;
  return jobs.filter((job) => {
    const timeMs = getJobTimestamp(job);
    return timeMs !== null && timeMs >= cutoffMs;
  });
}

/**
 * Returns jobs from the past 24 hours that match a user alert.
 * Enforces the strict rule: Daily alerts trigger only from the last 24h of postings.
 */
export function getDailyAlertMatches(alert, jobs) {
  const last24hJobs = filterJobsByTimeWindow(jobs, 24);
  const matches = [];

  for (const job of last24hJobs) {
    const res = checkAlertMatch(alert, job);
    if (res.matches) {
      matches.push({ job, ...res });
    }
  }

  // Sort by highest match score, then newest
  return matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return (getJobTimestamp(b.job) || 0) - (getJobTimestamp(a.job) || 0);
  });
}

/**
 * Returns jobs from the past 7 days (last week only) tailored for the weekly digest.
 * Enforces the strict rule: Weekly digest sends opportunities posted within the last 7 days only.
 */
export function getWeeklyDigestMatches(subscriber = {}, jobs = []) {
  const last7DaysJobs = filterJobsByTimeWindow(jobs, 7 * 24);
  const preferredRole = (subscriber.rolePreference || "").toLowerCase().trim();
  const rawExp = (subscriber.experienceLevel || "").toLowerCase().trim();
  const preferredExp =
    rawExp.includes("fresher") || rawExp.includes("0")
      ? "fresher"
      : rawExp.includes("1-3") || rawExp.includes("1 - 3")
      ? "1-3"
      : rawExp.includes("3-5") || rawExp.includes("3 - 5")
      ? "3-5"
      : rawExp.includes("5") || rawExp.includes("senior")
      ? "5+"
      : rawExp;

  return last7DaysJobs.filter((job) => {
    if (preferredExp && !matchesExperienceFilter(job.experience, preferredExp)) {
      return false;
    }
    if (preferredRole) {
      const title = (job.title || "").toLowerCase();
      const roleWords = preferredRole.split(" ").filter((w) => w.length > 2);
      const matchesRole = roleWords.some((w) => title.includes(w));
      if (!matchesRole) return false;
    }
    return true;
  }).sort((a, b) => (getJobTimestamp(b) || 0) - (getJobTimestamp(a) || 0)).slice(0, 8);
}

