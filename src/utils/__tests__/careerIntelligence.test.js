import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  classifyJobDomain,
  buildOpportunityClusters,
  computeDailyJobDrop,
  categorizeSkill,
  buildSkillDnaProfile,
  TECH_DOMAINS,
  CURATED_COLLECTION_TEMPLATES,
} from "../careerIntelligence.js";

describe("Career Intelligence & Taxonomy Engine", () => {
  it("classifies jobs into technical domains accurately", () => {
    assert.equal(classifyJobDomain({ title: "Frontend React Developer", domain: "Engineering" }), "frontend");
    assert.equal(classifyJobDomain({ title: "Senior Backend Engineer", jd: "Building Go microservices with Kafka" }), "backend");
    assert.equal(classifyJobDomain({ title: "ML Scientist", jd: "PyTorch deep learning computer vision" }), "ai-ml");
    assert.equal(classifyJobDomain({ title: "DevOps Engineer", skills: "AWS, Kubernetes, Terraform" }), "cloud-devops");
    assert.equal(classifyJobDomain({ title: "Android Software Engineer", jd: "Kotlin development" }), "mobile");
  });

  it("builds opportunity clusters by domain, location, and experience", () => {
    const mockJobs = [
      { id: "1", title: "React Dev", company: "Meta", location: "Bengaluru, India", experience: "0-1 yrs" },
      { id: "2", title: "Go Dev", company: "Google", location: "Bengaluru, India", experience: "3-5 yrs" },
      { id: "3", title: "DevOps", company: "Netflix", location: "Remote", experience: "1-3 yrs", isRemote: true },
    ];

    const clusters = buildOpportunityClusters(mockJobs);
    assert.equal(clusters.totalJobs, 3);
    assert.ok(clusters.domains.length >= TECH_DOMAINS.length);
    assert.equal(clusters.experience.fresher.count, 1);
    assert.equal(clusters.experience.junior.count, 1);
    assert.equal(clusters.experience.senior.count, 1);
  });

  it("calculates curated collections without errors", () => {
    assert.ok(CURATED_COLLECTION_TEMPLATES.length >= 6);
    const fresherFilter = CURATED_COLLECTION_TEMPLATES[0].filter;
    assert.equal(fresherFilter({ title: "Graduate Trainee", experience: "Fresher" }), true);
    assert.equal(fresherFilter({ title: "Staff Architect", experience: "8+ yrs" }), false);
  });

  it("computes daily job drops with fresher and remote segments", () => {
    const mockJobs = [
      { id: "1", title: "SDE 1", company: "Stripe", date: new Date().toISOString().split("T")[0], experience: "0-1 yrs", isRemote: true },
      { id: "2", title: "Senior Lead", company: "Amazon", date: "2026-11-20", experience: "5+ yrs", isRemote: false },
    ];

    const drop = computeDailyJobDrop(mockJobs);
    assert.ok(drop.jobs.length > 0);
    assert.ok(Array.isArray(drop.fresherJobs));
    assert.ok(Array.isArray(drop.remoteJobs));
  });

  it("categorizes skills and computes Skill DNA profiles correctly", () => {
    assert.equal(categorizeSkill("TypeScript"), "Languages");
    assert.equal(categorizeSkill("React.js"), "Frameworks");
    assert.equal(categorizeSkill("PostgreSQL"), "Databases");
    assert.equal(categorizeSkill("Kubernetes"), "CloudDevOps");

    const profile = buildSkillDnaProfile(["React", "Node.js", "Python"]);
    assert.ok(profile.dnaStrengthScore > 0);
    assert.ok(profile.recommendations.length > 0);
    assert.ok(profile.categorized.Languages.includes("python"));
  });
});
