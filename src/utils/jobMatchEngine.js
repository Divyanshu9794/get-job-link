/**
 * Job Match Intelligence Engine
 * Configurable, transparent, and explainable job matching for GetJobLink.
 * 
 * Computes a normalized match score (0-100%) against user preferences:
 * - Skills Overlap: 40%
 * - Role Relevance: 25%
 * - Experience Compatibility: 15%
 * - Location Relevance: 10%
 * - Work Mode: 5%
 * - Employment Type: 5%
 * 
 * Also generates transparent explanations, matching skills, and missing skill gaps.
 */

// Normalized skill synonyms for robust matching
const SKILL_SYNONYMS = {
  react: ["react", "react.js", "reactjs"],
  node: ["node", "node.js", "nodejs"],
  javascript: ["javascript", "js", "ecmascript"],
  typescript: ["typescript", "ts"],
  python: ["python", "python3", "py"],
  java: ["java", "core java", "j2ee"],
  cpp: ["c++", "cpp"],
  csharp: ["c#", "csharp", "dotnet", ".net"],
  aws: ["aws", "amazon web services", "cloud"],
  docker: ["docker", "containerization", "containers"],
  kubernetes: ["kubernetes", "k8s"],
  sql: ["sql", "mysql", "postgresql", "postgres"],
  mongodb: ["mongodb", "mongo", "nosql"],
  nextjs: ["next.js", "nextjs", "next"],
  vue: ["vue", "vue.js", "vuejs"],
  angular: ["angular", "angularjs"],
  git: ["git", "github", "gitlab"],
  ci_cd: ["ci/cd", "cicd", "continuous integration", "github actions"],
  rest_api: ["rest", "restful", "rest api", "apis", "api"],
  graphql: ["graphql", "gql"],
  flutter: ["flutter", "dart"],
  android: ["android", "kotlin", "android studio"],
  ios: ["ios", "swift", "swiftui"],
  machine_learning: ["machine learning", "ml", "ai", "deep learning"],
  data_analysis: ["data analysis", "pandas", "numpy", "power bi", "tableau"],
  tailwind: ["tailwind", "tailwindcss", "css", "css3"],
};

/**
 * Normalizes text to lower-case alphanumeric tokens
 */
export function normalizeToken(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9#+.]+/g, " ")
    .trim();
}

/**
 * Extracts skills list from job document (handles string, array, or JD text)
 */
export function extractJobSkills(job) {
  if (!job) return [];
  const skillsSet = new Set();

  const addSkills = (raw) => {
    if (!raw) return;
    if (Array.isArray(raw)) {
      raw.forEach((s) => {
        if (s && typeof s === "string") skillsSet.add(s.trim());
      });
    } else if (typeof raw === "string") {
      raw.split(/[,|/•\n]/).forEach((s) => {
        const trimmed = s.trim();
        if (trimmed && trimmed.length < 35) skillsSet.add(trimmed);
      });
    }
  };

  addSkills(job.skills);
  addSkills(job.requiredSkills);
  addSkills(job.tags);

  // If no explicit skills list, scan JD for known technical tokens
  if (skillsSet.size === 0 && (job.jd || job.description)) {
    const jdText = (job.jd || job.description).toLowerCase();
    Object.entries(SKILL_SYNONYMS).forEach(([canonical, variants]) => {
      if (variants.some((v) => jdText.includes(v))) {
        skillsSet.add(canonical.toUpperCase());
      }
    });
  }

  return Array.from(skillsSet);
}

/**
 * Checks if two skill names match or are synonyms
 */
export function areSkillsMatching(userSkill, jobSkill) {
  const normUser = normalizeToken(userSkill);
  const normJob = normalizeToken(jobSkill);

  if (normUser === normJob) return true;
  if (normUser.length > 2 && normJob.includes(normUser)) return true;
  if (normJob.length > 2 && normUser.includes(normJob)) return true;

  // Check synonym map
  for (const variants of Object.values(SKILL_SYNONYMS)) {
    const hasUser = variants.some((v) => normUser === v || normUser.includes(v));
    const hasJob = variants.some((v) => normJob === v || normJob.includes(v));
    if (hasUser && hasJob) return true;
  }

  return false;
}

/**
 * Evaluates role relevance score (0 - 1)
 */
export function calculateRoleMatch(preferredRoles, jobTitle) {
  if (!preferredRoles || preferredRoles.length === 0) return 0.8; // neutral when unconfigured
  if (!jobTitle) return 0.5;

  const titleNorm = normalizeToken(jobTitle);
  let bestScore = 0;

  for (const role of preferredRoles) {
    const roleNorm = normalizeToken(role);
    if (titleNorm === roleNorm) {
      return 1.0;
    }
    if (titleNorm.includes(roleNorm) || roleNorm.includes(titleNorm)) {
      bestScore = Math.max(bestScore, 0.9);
      continue;
    }

    // Word token overlap
    const roleWords = roleNorm.split(" ").filter((w) => w.length > 2);
    const titleWords = titleNorm.split(" ").filter((w) => w.length > 2);
    const common = roleWords.filter((w) => titleWords.includes(w));

    if (common.length > 0) {
      const overlap = common.length / Math.max(roleWords.length, 1);
      bestScore = Math.max(bestScore, Math.min(0.85, 0.4 + overlap * 0.5));
    }
  }

  return bestScore;
}

/**
 * Evaluates experience level compatibility (0 - 1)
 */
export function calculateExperienceMatch(userExp, jobExp) {
  if (!userExp) return 0.85; // neutral
  if (!jobExp) return 0.8;

  const u = userExp.toLowerCase();
  const j = jobExp.toLowerCase();

  const isFresherUser = u.includes("fresher") || u.includes("0") || u.includes("entry");
  const isFresherJob = j.includes("fresher") || j.includes("0") || j.includes("intern");

  if (isFresherUser && isFresherJob) return 1.0;
  if (isFresherUser && (j.includes("3") || j.includes("4") || j.includes("5") || j.includes("senior") || j.includes("lead"))) return 0.3;

  const isSeniorUser = u.includes("3") || u.includes("4") || u.includes("5") || u.includes("senior");
  if (isSeniorUser && isFresherJob) return 0.7; // Can apply, but likely overqualified
  if (isSeniorUser && (j.includes("2") || j.includes("3") || j.includes("4") || j.includes("5"))) return 1.0;

  return 0.75;
}

/**
 * Evaluates location relevance (0 - 1)
 */
export function calculateLocationMatch(preferredLocations, isRemotePreferred, job) {
  if (!job) return 0.5;
  const isJobRemote =
    job.isRemote === true ||
    (job.location || "").toLowerCase().includes("remote") ||
    (job.jobType || "").toLowerCase().includes("remote");

  if (isRemotePreferred && isJobRemote) return 1.0;

  if (!preferredLocations || preferredLocations.length === 0) {
    return isJobRemote ? 0.9 : 0.8;
  }

  const jobLoc = normalizeToken(job.location || "");
  for (const loc of preferredLocations) {
    const locNorm = normalizeToken(loc);
    if (jobLoc.includes(locNorm) || locNorm.includes(jobLoc)) {
      return 1.0;
    }
  }

  if (isJobRemote) return 0.85;
  return 0.4;
}

/**
 * Calculates complete match intelligence for a job against a user profile
 * 
 * @param {Object} preferences - User preferences
 * @param {Object} job - Job document
 * @param {Object} weights - Configurable weights
 * @returns {Object} { score, percentage, matchedSkills, missingSkills, explanations, level }
 */
export function calculateJobMatch(preferences, job, customWeights = {}) {
  const weights = {
    skills: 0.40,
    role: 0.25,
    experience: 0.15,
    location: 0.10,
    workMode: 0.05,
    employmentType: 0.05,
    ...customWeights,
  };

  if (!preferences || Object.keys(preferences).length === 0) {
    return {
      score: 75,
      percentage: "75%",
      level: "Good Match",
      matchedSkills: [],
      missingSkills: [],
      explanations: ["Complete your career preferences to get precision match scores."],
      isEstimated: true,
    };
  }

  const userSkills = (preferences.skills || []).map((s) => s.trim()).filter(Boolean);
  const jobSkills = extractJobSkills(job);

  // 1. Skill Overlap Calculation
  const matchedSkills = [];
  const missingSkills = [];

  if (jobSkills.length > 0 && userSkills.length > 0) {
    jobSkills.forEach((jSkill) => {
      const isMatch = userSkills.some((uSkill) => areSkillsMatching(uSkill, jSkill));
      if (isMatch) {
        matchedSkills.push(jSkill);
      } else {
        missingSkills.push(jSkill);
      }
    });
  }

  let skillScore = 0.5;
  if (userSkills.length > 0 && jobSkills.length > 0) {
    const coverage = matchedSkills.length / Math.min(jobSkills.length, 6);
    skillScore = Math.min(1.0, Math.max(0.2, coverage));
  } else if (userSkills.length > 0) {
    skillScore = 0.7; // Unspecified in job JD
  }

  // 2. Role Relevance
  const roleScore = calculateRoleMatch(preferences.preferredRoles, job.title);

  // 3. Experience Compatibility
  const expScore = calculateExperienceMatch(preferences.experienceLevel, job.experience);

  // 4. Location Relevance
  const locScore = calculateLocationMatch(
    preferences.preferredLocations,
    preferences.workMode === "Remote" || preferences.isRemoteOnly,
    job
  );

  // 5. Work Mode
  let workModeScore = 0.8;
  if (preferences.workMode) {
    const isJobRemote =
      job.isRemote === true ||
      (job.location || "").toLowerCase().includes("remote");
    if (preferences.workMode === "Remote" && isJobRemote) workModeScore = 1.0;
    else if (preferences.workMode === "Remote" && !isJobRemote) workModeScore = 0.3;
    else if (preferences.workMode === "Onsite" && !isJobRemote) workModeScore = 1.0;
    else workModeScore = 0.85;
  }

  // 6. Employment Type
  let empTypeScore = 0.8;
  if (preferences.jobType && job.jobType) {
    const prefType = preferences.jobType.toLowerCase();
    const jType = job.jobType.toLowerCase();
    if (prefType.includes("intern") && jType.includes("intern")) empTypeScore = 1.0;
    else if (prefType.includes("full") && jType.includes("full")) empTypeScore = 1.0;
    else if (prefType.includes("intern") && !jType.includes("intern")) empTypeScore = 0.4;
    else empTypeScore = 0.8;
  }

  // Composite Weighted Score
  const rawScore =
    skillScore * weights.skills +
    roleScore * weights.role +
    expScore * weights.experience +
    locScore * weights.location +
    workModeScore * weights.workMode +
    empTypeScore * weights.employmentType;

  // Normalized to 0 - 100 integer with reasonable bounds (30% to 98% to avoid false 100% guarantees)
  const finalScore = Math.min(98, Math.max(35, Math.round(rawScore * 100)));

  // Generate transparent explanations
  const explanations = [];

  if (matchedSkills.length > 0) {
    explanations.push(`${matchedSkills.length} key technical skills match (${matchedSkills.slice(0, 3).join(", ")})`);
  }
  if (roleScore >= 0.8) {
    explanations.push("Role title strongly aligns with your target job positions");
  }
  if (expScore >= 0.85) {
    explanations.push("Experience requirements are compatible with your background");
  }
  if (locScore >= 0.85) {
    explanations.push(
      job.isRemote
        ? "Remote work flexibility matches your location preferences"
        : "Location directly matches your target cities"
    );
  }
  if (missingSkills.length > 0 && missingSkills.length <= 4) {
    explanations.push(`Skill growth opportunities: ${missingSkills.join(", ")}`);
  }

  let level = "Fair Match";
  if (finalScore >= 80) level = "Strong Match";
  else if (finalScore >= 65) level = "Good Match";
  else if (finalScore < 50) level = "Low Match";

  return {
    score: finalScore,
    percentage: `${finalScore}%`,
    level,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 5),
    explanations,
    breakdown: {
      skills: Math.round(skillScore * 100),
      role: Math.round(roleScore * 100),
      experience: Math.round(expScore * 100),
      location: Math.round(locScore * 100),
    },
  };
}
