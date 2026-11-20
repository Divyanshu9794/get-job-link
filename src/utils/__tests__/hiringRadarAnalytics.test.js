import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCompanyName,
  createCompanySlug,
  processHiringRadarData,
  extractSkills,
} from "../hiringRadarAnalytics.js";

describe("Hiring Radar Analytics Engine", () => {
  it("normalizes company names cleanly without stripping core names", () => {
    assert.equal(normalizeCompanyName("Google LLC"), "Google");
    assert.equal(normalizeCompanyName("Microsoft Corporation"), "Microsoft");
    assert.equal(normalizeCompanyName("Amazon Inc."), "Amazon");
    assert.equal(normalizeCompanyName("Atlassian Pvt. Ltd."), "Atlassian");
    assert.equal(normalizeCompanyName(" Stripe "), "Stripe");
    assert.equal(normalizeCompanyName(""), "Unknown Company");
    assert.equal(normalizeCompanyName(null), "Unknown Company");
  });

  it("creates valid URL-friendly slugs", () => {
    assert.equal(createCompanySlug("Google Cloud"), "google-cloud");
    assert.equal(createCompanySlug("Wells Fargo & Co."), "wells-fargo-co");
    assert.equal(createCompanySlug("JP Morgan Chase"), "jp-morgan-chase");
  });

  it("extracts skills reliably from arrays and comma-separated strings", () => {
    assert.deepEqual(extractSkills({ skills: ["React", "Node.js"] }), ["React", "Node.js"]);
    assert.deepEqual(extractSkills({ requiredSkills: ["Python", "FastAPI"] }), ["Python", "FastAPI"]);
    assert.deepEqual(extractSkills({ skills: "Go, Kubernetes, Docker" }), ["Go", "Kubernetes", "Docker"]);
    assert.deepEqual(extractSkills({}), []);
  });

  it("correctly aggregates jobs, identifies multi-role companies, and calculates velocity without inventing data", () => {
    const fixedNow = new Date("2026-11-20T12:00:00Z").getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    const sampleJobs = [
      {
        id: "job-1",
        company: "Google",
        title: "Frontend Engineer",
        location: "Bengaluru, India",
        domain: "Frontend",
        skills: ["React", "TypeScript", "Tailwind"],
        createdAt: fixedNow - 2 * dayMs, // 2 days ago (within 7d)
      },
      {
        id: "job-2",
        company: "Google LLC",
        title: "Backend Engineer",
        location: "Hyderabad, India",
        domain: "Backend",
        skills: ["Go", "Kubernetes", "Docker", "TypeScript"],
        createdAt: fixedNow - 3 * dayMs, // 3 days ago (within 7d)
      },
      {
        id: "job-3",
        company: "Google",
        title: "Site Reliability Engineer",
        location: "Bengaluru, India",
        domain: "DevOps",
        skills: ["Go", "Kubernetes", "Terraform"],
        createdAt: fixedNow - 10 * dayMs, // 10 days ago (within 7-14d)
      },
      {
        id: "job-4",
        company: "Acme Startup",
        title: "Full Stack Builder",
        location: "Remote",
        isRemote: true,
        skills: ["React", "Node.js", "MongoDB"],
        createdAt: fixedNow - 1 * dayMs, // 1 day ago
      },
      // Data quality test: duplicate job record
      {
        id: "job-5-dup",
        company: "Acme Startup",
        title: "Full Stack Builder",
        location: "Remote",
        isRemote: true,
        skills: ["React", "Node.js"],
        createdAt: fixedNow - 1 * dayMs,
      },
      // Data quality test: job with missing fields
      {
        id: "job-6-bad",
        company: "",
        title: "Mystery Role",
        location: "",
        skills: [],
        createdAt: 0,
      },
    ];

    const result = processHiringRadarData(sampleJobs, { now: fixedNow });

    // 1. Overall stats
    assert.equal(result.totalActiveJobs, 6);
    assert.equal(result.overview.totalCompanies, 3); // Google (normalized), Acme Startup, Unknown Company
    assert.equal(result.overview.newJobsThisWeek, 4); // job-1, job-2, job-4, job-5-dup

    // 2. Company grouping
    const google = result.companyDict["google"];
    assert.ok(google);
    assert.equal(google.companyName, "Google");
    assert.equal(google.activeJobs, 3);
    assert.equal(google.jobsLast7d, 2);
    assert.equal(google.jobsPrev7d, 1);
    assert.equal(google.isMultiRole, true); // Frontend, Backend, SRE
    assert.equal(google.distinctRolesCount, 3);

    // 3. In-demand skills
    const topSkills7d = result.skills["7d"];
    assert.ok(topSkills7d.length > 0);
    const reactEntry = topSkills7d.find((s) => s.name === "React");
    assert.ok(reactEntry);
    assert.equal(reactEntry.count, 3); // job-1, job-4, and job-5-dup all have React

    // 4. Data Quality Flags
    assert.equal(result.dataQuality.missingCompany, 1);
    assert.equal(result.dataQuality.missingLocation, 1);
    assert.equal(result.dataQuality.missingSkills, 1);
    assert.equal(result.dataQuality.missingDates, 1);
    assert.equal(result.dataQuality.potentialDuplicates, 1);
  });
});
