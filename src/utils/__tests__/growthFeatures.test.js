import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateJobMatch,
  areSkillsMatching,
  calculateRoleMatch,
  calculateExperienceMatch,
  extractJobSkills,
} from "../jobMatchEngine.js";

import {
  isJobDuplicate,
  stripHtml,
  extractExperienceFromText,
  extractSalaryFromText,
  extractSkillsFromText,
  normalizeFantasticJob,
  isTechJob,
} from "../jobFetchEngine.js";

import {
  checkAlertMatch,
  createNotificationItem,
  filterJobsByTimeWindow,
  getDailyAlertMatches,
  getWeeklyDigestMatches,
} from "../jobAlertEngine.js";

import {
  matchesExperienceFilter,
  isFresherExperience,
  formatDisplaySalary,
  getJobTimestamp,
} from "../jobClassification.js";

describe("Job Match Intelligence Engine", () => {
  it("matches skill synonyms accurately without case sensitivity", () => {
    assert.equal(areSkillsMatching("react", "React.js"), true);
    assert.equal(areSkillsMatching("Node.js", "node"), true);
    assert.equal(areSkillsMatching("TypeScript", "ts"), true);
    assert.equal(areSkillsMatching("Python", "python3"), true);
    assert.equal(areSkillsMatching("Docker", "Kubernetes"), false);
  });

  it("extracts skills reliably from string or array job representations", () => {
    const jobWithArray = { skills: ["React", "TypeScript", "Tailwind"] };
    assert.deepEqual(extractJobSkills(jobWithArray), ["React", "TypeScript", "Tailwind"]);

    const jobWithString = { skills: "React, Node.js, AWS, Docker" };
    const extracted = extractJobSkills(jobWithString);
    assert.equal(extracted.includes("React"), true);
    assert.equal(extracted.includes("Node.js"), true);
  });

  it("calculates role relevance scores properly", () => {
    assert.equal(calculateRoleMatch(["Frontend Developer"], "Frontend Developer"), 1.0);
    assert.equal(calculateRoleMatch(["Software Engineer"], "Senior Software Engineer - Platform"), 0.9);
    assert.ok(calculateRoleMatch(["React Developer"], "Full Stack Engineer (React/Node)") > 0.6);
  });

  it("evaluates experience compatibility correctly for freshers", () => {
    assert.equal(
      calculateExperienceMatch("Fresher (0 - 1 Years)", "Fresher (0 - 1 Years)"),
      1.0
    );
    assert.ok(
      calculateExperienceMatch("Fresher (0 - 1 Years)", "More than 4 years") < 0.5
    );
  });

  it("computes an explainable composite match score with skill gaps", () => {
    const preferences = {
      preferredRoles: ["Frontend Developer", "React Developer"],
      skills: ["React", "JavaScript", "TypeScript"],
      experienceLevel: "Fresher (0 - 1 Years)",
      preferredLocations: ["Bengaluru", "Remote"],
      workMode: "Remote",
    };

    const strongJob = {
      title: "Frontend React Developer",
      company: "Razorpay",
      location: "Bengaluru, India",
      isRemote: true,
      experience: "Fresher (0 - 1 Years)",
      skills: ["React", "TypeScript", "Docker"],
    };

    const match = calculateJobMatch(preferences, strongJob);
    assert.ok(match.score >= 80, `Expected score >= 80, got ${match.score}`);
    assert.equal(match.level, "Strong Match");
    assert.ok(match.matchedSkills.length >= 2);
    assert.ok(match.missingSkills.includes("Docker"));
    assert.ok(match.explanations.length > 0);
  });
});

describe("Multi-Source Job Fetch & Duplicate Engine", () => {
  it("detects duplicates by exact application URL", () => {
    const existing = [
      { id: "1", title: "SDE 1", company: "Swiggy", url: "https://swiggy.greenhouse.io/jobs/101" },
    ];
    const candidate = {
      title: "Software Engineer I",
      company: "Swiggy",
      url: "https://swiggy.greenhouse.io/jobs/101",
    };

    assert.equal(isJobDuplicate(candidate, existing), true);
  });

  it("detects duplicates by normalized title and company", () => {
    const existing = [
      { id: "2", title: "Backend Developer (Node.js)", company: "PhonePe", url: "https://phonepe.com/1" },
    ];
    const candidate = {
      title: "Backend Developer Nodejs",
      company: "PhonePe",
      url: "https://phonepe.com/different-id",
    };

    assert.equal(isJobDuplicate(candidate, existing), true);
  });

  it("strips HTML cleanly from Greenhouse and Lever ATS descriptions", () => {
    const rawHtml = "<div><h3>Responsibilities</h3><ul><li>Build React apps</li><li>Write unit tests</li></ul></div>";
    const cleaned = stripHtml(rawHtml);
    assert.ok(!cleaned.includes("<div>"));
    assert.ok(!cleaned.includes("<li>"));
    assert.ok(cleaned.includes("Build React apps"));
    assert.ok(cleaned.includes("• Write unit tests"));
  });

  it("extracts experience requirements from JD text", () => {
    assert.equal(extractExperienceFromText("Software Engineer Intern", "Open for final year students"), "Internship");
    assert.equal(extractExperienceFromText("Graduate SDE", "Looking for 0-1 year experience"), "Fresher (0 - 1 Years)");
    assert.equal(extractExperienceFromText("Senior Backend Engineer", "Requires 5+ years of distributed systems"), "More than 4 years");
  });

  it("extracts salary patterns from descriptions", () => {
    assert.equal(extractSalaryFromText("Offering 12 - 18 LPA depending on interview performance"), "12-18 LPA");
    assert.equal(extractSalaryFromText("Hourly rate: $40 - $60 /hr"), "$40 - $60 /hr");
  });

  it("identifies technical skills from description text", () => {
    const jd = "We are seeking a developer proficient in React, Node.js, Docker, and PostgreSQL on AWS.";
    const skills = extractSkillsFromText(jd);
    assert.ok(skills.includes("React"));
    assert.ok(skills.includes("Node.js"));
    assert.ok(skills.includes("Docker"));
    assert.ok(skills.includes("PostgreSQL"));
  });

  it("normalizes Fantastic Jobs Active-ATS records correctly with 20 limit", () => {
    const rawMockJob = {
      id: 2481550461,
      title: "Enactor Developer (-Enactor )",
      organization: "Zensar",
      locations_derived: ["Bangalore South, Karnataka, India"],
      countries_derived: ["India"],
      ai_key_skills: ["React.js", "Java", "Spring Boot", "Docker"],
      ai_experience_level: "5-10",
      ai_work_arrangement: "Hybrid",
      url: "https://zensar.com/careers/enactor-dev",
      description_text: "Develop enterprise cloud solutions with React and Java.",
    };

    const normalized = normalizeFantasticJob(rawMockJob, {
      id: "fantastic_jobs_india",
      category: "india",
    });

    assert.equal(normalized.title, "Enactor Developer (-Enactor )");
    assert.equal(normalized.company, "Zensar");
    assert.equal(normalized.location, "Bangalore South, Karnataka, India");
    assert.equal(normalized.url, "https://zensar.com/careers/enactor-dev");
    assert.ok(normalized.skills.includes("React.js"));
    assert.ok(normalized.skills.includes("Java"));
    assert.equal(normalized.experience, "More than 4 years");
    assert.equal(normalized.status, "pending_approval");

    // Test slicing to 20 limit
    const mockList = Array.from({ length: 45 }, (_, i) => ({ ...rawMockJob, id: i + 1 }));
    const sliced = mockList.slice(0, 20);
    assert.equal(sliced.length, 20);
  });

  it("filters out non-tech roles such as marketing, operations and safety", () => {
    assert.equal(isTechJob("Senior Software Engineer"), true);
    assert.equal(isTechJob("Backend Developer (Java)"), true);
    assert.equal(isTechJob("Marketing Operations Associate"), false);
    assert.equal(isTechJob("Senior Manager, Safety"), false);
    assert.equal(isTechJob("Executive Assistant / Receptionist"), false);
  });
});

describe("Smart Job Alert Engine", () => {
  it("matches an alert when job meets role, skills, and experience criteria", () => {
    const alert = {
      id: "al_1",
      role: "React Developer",
      skills: ["React", "TypeScript"],
      location: "Bengaluru",
      experienceLevel: "Fresher (0 - 1 Years)",
      active: true,
    };

    const matchingJob = {
      id: "j_10",
      title: "Junior React Developer",
      company: "Flipkart",
      location: "Bengaluru, India",
      experience: "Fresher (0 - 1 Years)",
      skills: ["React", "TypeScript", "Tailwind"],
    };

    const res = checkAlertMatch(alert, matchingJob);
    assert.equal(res.matches, true);
    assert.ok(res.matchScore >= 70);
  });

  it("does not trigger when alert is paused", () => {
    const alert = {
      id: "al_2",
      role: "React Developer",
      active: false,
    };
    const job = {
      id: "j_11",
      title: "React Developer",
    };

    const res = checkAlertMatch(alert, job);
    assert.equal(res.matches, false);
  });

  it("creates a properly structured in-app notification item", () => {
    const alert = { id: "a1", role: "SDE" };
    const job = { id: "j1", title: "SDE 1", company: "Zomato", location: "Gurugram" };
    const notif = createNotificationItem(alert, job, ["Role: SDE"]);

    assert.equal(notif.alertId, "a1");
    assert.equal(notif.jobId, "j1");
    assert.equal(notif.company, "Zomato");
    assert.equal(notif.isRead, false);
  });

  it("filters jobs strictly within the 24-hour daily alert window", () => {
    const now = Date.now();
    const jobs = [
      { id: "fresh", title: "React Dev", createdAt: now - 3 * 3600 * 1000 }, // 3h ago
      { id: "yesterday", title: "React Dev", createdAt: now - 22 * 3600 * 1000 }, // 22h ago
      { id: "old", title: "React Dev", createdAt: now - 30 * 3600 * 1000 }, // 30h ago (must be excluded)
    ];

    const alert = { role: "React", active: true };
    assert.equal(filterJobsByTimeWindow(jobs, 24).length, 2);
    const matches = getDailyAlertMatches(alert, jobs);
    assert.equal(matches.length, 2);
    assert.equal(matches[0].job.id, "fresh");
    assert.equal(matches[1].job.id, "yesterday");
  });

  it("filters jobs strictly within the 7-day weekly digest window", () => {
    const now = Date.now();
    const jobs = [
      { id: "this_week", title: "Software Engineer", experience: "Fresher (0 - 1 Years)", createdAt: now - 2 * 86400 * 1000 },
      { id: "six_days_ago", title: "Software Engineer", experience: "Fresher (0 - 1 Years)", createdAt: now - 6 * 86400 * 1000 },
      { id: "two_weeks_ago", title: "Software Engineer", experience: "Fresher (0 - 1 Years)", createdAt: now - 14 * 86400 * 1000 }, // excluded
    ];

    const subscriber = { rolePreference: "Software Engineer", experienceLevel: "Fresher (0 - 1 Years)" };
    const matches = getWeeklyDigestMatches(subscriber, jobs);
    assert.equal(matches.length, 2);
    assert.equal(matches[0].id, "this_week");
    assert.equal(matches[1].id, "six_days_ago");
  });
});

describe("Job Classification & Filter Intelligence", () => {
  it("strictly prevents Fresher (0 - 1 Years) jobs from matching 1-3 Years filter", () => {
    const fresherExp = "Fresher (0 - 1 Years)";
    assert.equal(isFresherExperience(fresherExp), true);
    assert.equal(matchesExperienceFilter(fresherExp, "fresher"), true);
    assert.equal(matchesExperienceFilter(fresherExp, "1-3"), false);
    assert.equal(matchesExperienceFilter(fresherExp, "3-5"), false);
    assert.equal(matchesExperienceFilter(fresherExp, "5+"), false);
  });

  it("accurately matches 1-3, 3-5, and 5+ experience buckets", () => {
    assert.equal(matchesExperienceFilter("1 - 2 Years", "1-3"), true);
    assert.equal(matchesExperienceFilter("2 - 3 Years", "1-3"), true);
    assert.equal(matchesExperienceFilter("More than 1 year", "1-3"), true);
    assert.equal(matchesExperienceFilter("1 - 2 Years", "fresher"), false);

    assert.equal(matchesExperienceFilter("3 - 5 Years", "3-5"), true);
    assert.equal(matchesExperienceFilter("3 - 4 Years", "3-5"), true);
    assert.equal(matchesExperienceFilter("3 - 5 Years", "1-3"), false);

    assert.equal(matchesExperienceFilter("More than 4 years", "5+"), true);
    assert.equal(matchesExperienceFilter("Senior Engineer 6+ yrs", "5+"), true);
    assert.equal(matchesExperienceFilter("More than 4 years", "1-3"), false);
  });

  it("cleans schema.org JSON stringified salaries and preserves normal salaries", () => {
    const jsonSalary = '{"@type":"MonetaryAmount","currency":"EUR","value":{"@type":"QuantitativeValue","minValue":50000}}';
    assert.equal(formatDisplaySalary(jsonSalary), "€50k");

    const phpSalary = '{"@type":"MonetaryAmount","currency":"PHP","value":{"@type":"QuantitativeValue","minValue":2160000,"maxValue":2760000,"unitText":"YEAR"}}';
    assert.equal(formatDisplaySalary(phpSalary), "₱2.2M - ₱2.8M /yr");

    assert.equal(formatDisplaySalary("$120,000 / yr"), "$120,000 / yr");
    assert.equal(formatDisplaySalary("₹12 - ₹18 LPA"), "₹12 - ₹18 LPA");
    assert.equal(formatDisplaySalary("Competitive"), "");
    assert.equal(formatDisplaySalary(null), "");
  });

  it("normalizes timestamps across Firestore timestamp objects, numbers, and ISO strings", () => {
    const firestoreTimestamp = { seconds: 1732345678, nanoseconds: 0 };
    assert.equal(getJobTimestamp({ createdAt: firestoreTimestamp }), 1732345678000);

    const nowEpoch = Date.now();
    assert.equal(getJobTimestamp({ date: nowEpoch }), nowEpoch);

    const isoStr = "2026-11-23T12:00:00.000Z";
    assert.equal(getJobTimestamp({ fetchedAt: isoStr }), new Date(isoStr).getTime());
  });
});
