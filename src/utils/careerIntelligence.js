import {
  isRemoteJob,
  getJobTimestamp,
} from "./jobClassification.js";

/**
 * Standard Tech Domain Taxonomies & Keywords
 */
export const TECH_DOMAINS = [
  {
    id: "frontend",
    label: "Frontend Engineering",
    shortLabel: "Frontend",
    icon: "Layout",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    keywords: ["frontend", "front-end", "react", "vue", "angular", "next.js", "ui developer", "web developer", "html", "css", "tailwind"],
  },
  {
    id: "backend",
    label: "Backend & Systems",
    shortLabel: "Backend",
    icon: "Server",
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    textColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    keywords: ["backend", "back-end", "node", "nodejs", "express", "django", "spring", "golang", "go developer", "java developer", "ruby", "rust", "microservices"],
  },
  {
    id: "ai-ml",
    label: "AI, ML & Data Science",
    shortLabel: "AI / ML",
    icon: "Sparkles",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    keywords: ["ai", "ml", "machine learning", "deep learning", "nlp", "llm", "generative ai", "computer vision", "data scientist", "data science", "pytorch", "tensorflow"],
  },
  {
    id: "cloud-devops",
    label: "Cloud & DevOps / SRE",
    shortLabel: "Cloud / DevOps",
    icon: "Cloud",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    keywords: ["devops", "cloud", "aws", "azure", "gcp", "kubernetes", "k8s", "docker", "terraform", "ci/cd", "sre", "reliability", "infrastructure"],
  },
  {
    id: "mobile",
    label: "Mobile Development (Android / iOS)",
    shortLabel: "Mobile",
    icon: "Smartphone",
    color: "from-rose-500 to-red-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-200 dark:border-rose-800",
    keywords: ["android", "ios", "react native", "flutter", "swift", "kotlin", "mobile engineer", "mobile developer"],
  },
  {
    id: "data-eng",
    label: "Data Engineering & Analytics",
    shortLabel: "Data Eng",
    icon: "Database",
    color: "from-blue-600 to-indigo-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    textColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800",
    keywords: ["data engineer", "etl", "spark", "hadoop", "snowflake", "bigquery", "kafka", "pipeline"],
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity & InfoSec",
    shortLabel: "Security",
    icon: "Shield",
    color: "from-slate-600 to-slate-800",
    bgColor: "bg-slate-100 dark:bg-slate-800/60",
    textColor: "text-slate-700 dark:text-slate-300",
    borderColor: "border-slate-300 dark:border-slate-700",
    keywords: ["security", "cyber", "infosec", "soc", "penetration", "appsec", "vulnerability", "cryptography", "iam"],
  },
  {
    id: "fullstack",
    label: "Full Stack Development",
    shortLabel: "Full Stack",
    icon: "Layers",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    keywords: ["full stack", "fullstack", "full-stack", "mern", "mean", "software engineer", "sde", "software developer"],
  },
];

/**
 * Classifies a job into its primary and secondary tech domains based on title and description.
 */
export function classifyJobDomain(job) {
  if (!job) return "fullstack";
  const text = `${job.title || ""} ${job.domain || ""} ${job.skills || ""} ${(job.jd || "").slice(0, 400)}`.toLowerCase();

  for (const domain of TECH_DOMAINS) {
    if (domain.keywords.some((kw) => text.includes(kw))) {
      return domain.id;
    }
  }
  return "fullstack";
}

/**
 * Groups a collection of jobs into interactive clusters for the Opportunity Map.
 */
export function buildOpportunityClusters(jobs = []) {
  const domainMap = {};
  TECH_DOMAINS.forEach((d) => {
    domainMap[d.id] = { ...d, jobs: [], count: 0, companies: new Set(), locations: new Set() };
  });

  const locationMap = {};
  const experienceMap = {
    fresher: { label: "Fresher / Entry Level (0-1 yrs)", count: 0, jobs: [] },
    junior: { label: "Junior / Mid-Level (1-3 yrs)", count: 0, jobs: [] },
    senior: { label: "Senior & Staff (3-5+ yrs)", count: 0, jobs: [] },
  };

  jobs.forEach((job) => {
    const domainId = classifyJobDomain(job);
    if (domainMap[domainId]) {
      domainMap[domainId].jobs.push(job);
      domainMap[domainId].count++;
      if (job.company) domainMap[domainId].companies.add(job.company);
      if (job.location) domainMap[domainId].locations.add(job.location);
    }

    // Location clustering
    const loc = (job.location || "Remote").split(",")[0].trim() || "Remote";
    if (!locationMap[loc]) {
      locationMap[loc] = { name: loc, count: 0, jobs: [] };
    }
    locationMap[loc].count++;
    locationMap[loc].jobs.push(job);

    // Experience clustering
    const exp = String(job.experience || "").toLowerCase();
    if (exp.includes("fresher") || exp.includes("0-1") || exp.includes("0 - 1") || exp.includes("intern")) {
      experienceMap.fresher.count++;
      experienceMap.fresher.jobs.push(job);
    } else if (exp.includes("3-5") || exp.includes("3 - 5") || exp.includes("5+") || exp.includes("senior") || exp.includes("lead") || exp.includes("staff")) {
      experienceMap.senior.count++;
      experienceMap.senior.jobs.push(job);
    } else {
      experienceMap.junior.count++;
      experienceMap.junior.jobs.push(job);
    }
  });

  return {
    domains: Object.values(domainMap).map((d) => ({
      ...d,
      companiesCount: d.companies.size,
      locationsCount: d.locations.size,
    })),
    topLocations: Object.values(locationMap).sort((a, b) => b.count - a.count).slice(0, 12),
    experience: experienceMap,
    totalJobs: jobs.length,
  };
}

/**
 * Standard Curated Job Bundles configurations
 */
export const CURATED_COLLECTION_TEMPLATES = [
  {
    slug: "fresher-tech-jobs",
    title: "Fresher Tech Opportunities",
    tagline: "Entry-level engineering roles welcoming 0-1 years experience and 2024-2026 graduates.",
    icon: "GraduationCap",
    badge: "Graduate Ready",
    color: "from-blue-600 to-indigo-600",
    filter: (j) => {
      const exp = String(j.experience || "").toLowerCase();
      const title = String(j.title || "").toLowerCase();
      return exp.includes("fresher") || exp.includes("0") || exp.includes("intern") || title.includes("intern") || title.includes("junior") || title.includes("graduate");
    },
  },
  {
    slug: "remote-tech-careers",
    title: "100% Remote Tech Jobs",
    tagline: "Verified remote-first engineering, data, and cloud roles across India and worldwide.",
    icon: "Globe",
    badge: "Work Anywhere",
    color: "from-emerald-600 to-teal-600",
    filter: (j) => isRemoteJob(j),
  },
  {
    slug: "react-frontend-engineering",
    title: "React & Next.js Developers",
    tagline: "High-impact frontend engineering roles building modern web experiences.",
    icon: "Layout",
    badge: "High Demand",
    color: "from-cyan-600 to-blue-600",
    filter: (j) => {
      const text = `${j.title || ""} ${j.skills || ""}`.toLowerCase();
      return text.includes("react") || text.includes("next.js") || text.includes("frontend");
    },
  },
  {
    slug: "backend-systems-microservices",
    title: "Backend & Distributed Systems",
    tagline: "Scalable architecture roles in Node.js, Go, Python, Java, and cloud microservices.",
    icon: "Server",
    badge: "Architecture",
    color: "from-indigo-600 to-violet-600",
    filter: (j) => {
      const d = classifyJobDomain(j);
      return d === "backend";
    },
  },
  {
    slug: "ai-data-intelligence",
    title: "AI, GenAI & Data Engineering",
    tagline: "Roles at the frontier of LLMs, machine learning, computer vision, and big data pipelines.",
    icon: "Sparkles",
    badge: "Trending Frontier",
    color: "from-amber-600 to-orange-600",
    filter: (j) => {
      const d = classifyJobDomain(j);
      return d === "ai-ml" || d === "data-eng";
    },
  },
  {
    slug: "cloud-devops-sre",
    title: "Cloud Infrastructure & DevOps",
    tagline: "Kubernetes, AWS, CI/CD, and platform reliability engineering openings.",
    icon: "Cloud",
    badge: "Platform Engineering",
    color: "from-purple-600 to-pink-600",
    filter: (j) => {
      const d = classifyJobDomain(j);
      return d === "cloud-devops";
    },
  },
];

/**
 * Computes Daily Job Drop metadata from jobs collection.
 */
export function computeDailyJobDrop(jobs = []) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const past24Hours = now.getTime() - 24 * 60 * 60 * 1000;

  // Filter jobs added in the current drop window
  const dropJobs = jobs.filter((j) => {
    const ts = getJobTimestamp(j) || 0;
    return j.date === todayStr || ts >= startOfToday || ts >= past24Hours;
  });

  const targetList = dropJobs.length >= 10 ? dropJobs : jobs.slice(0, 24);

  const fresherJobs = targetList.filter((j) => {
    const exp = String(j.experience || "").toLowerCase();
    return exp.includes("fresher") || exp.includes("0") || exp.includes("intern");
  });

  const remoteJobs = targetList.filter((j) => isRemoteJob(j));

  // Companies hiring in this drop
  const companyCounts = {};
  targetList.forEach((j) => {
    const c = j.company || "Verified Tech Co";
    companyCounts[c] = (companyCounts[c] || 0) + 1;
  });

  const topHiringCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  return {
    dropDate: todayStr,
    totalDropCount: targetList.length,
    jobs: targetList,
    fresherJobs,
    remoteJobs,
    topHiringCompanies,
  };
}

/**
 * Skill DNA Categorizer: Maps arbitrary raw skills to categorized tech competencies.
 */
export const SKILL_CATEGORIES = {
  Databases: ["postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "cassandra", "firebase", "sqlite", "snowflake", "bigquery"],
  Frameworks: ["react", "react.js", "next.js", "vue", "angular", "node.js", "express", "django", "spring boot", "fastapi", "flutter", "react native", "tailwind"],
  CloudDevOps: ["aws", "azure", "gcp", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "github actions", "linux", "jenkins", "ansible"],
  CoreCS: ["data structures", "algorithms", "system design", "oop", "microservices", "rest api", "graphql", "git", "operating systems", "networking"],
  Languages: ["javascript", "typescript", "python", "java", "golang", "go", "c++", "c#", "rust", "ruby", "php", "kotlin", "swift", "sql", "html", "css"],
};

export function categorizeSkill(skillName) {
  const norm = String(skillName || "").toLowerCase().trim();
  // 1. Exact match check
  for (const [category, items] of Object.entries(SKILL_CATEGORIES)) {
    if (items.includes(norm)) {
      return category;
    }
  }
  // 2. Substring check
  for (const [category, items] of Object.entries(SKILL_CATEGORIES)) {
    if (items.some((item) => item.length > 2 && norm.includes(item))) {
      return category;
    }
  }
  return "Specialized";
}

/**
 * Computes Skill DNA graph and gap recommendations from user skills.
 */
export function buildSkillDnaProfile(userSkills = [], _targetRole = "Full Stack Engineer") {
  const normalized = Array.from(new Set(userSkills.map((s) => s.toLowerCase().trim()).filter(Boolean)));

  const categorized = {
    Languages: [],
    Frameworks: [],
    Databases: [],
    CloudDevOps: [],
    CoreCS: [],
    Specialized: [],
  };

  normalized.forEach((skill) => {
    const cat = categorizeSkill(skill);
    if (categorized[cat]) categorized[cat].push(skill);
    else categorized.Specialized.push(skill);
  });

  // Adjacent skill recommendations based on current profile
  const recommendations = [];
  if (categorized.Languages.includes("python") && !categorized.Frameworks.includes("fastapi")) {
    recommendations.push({ skill: "FastAPI", category: "Frameworks", reason: "Natural companion for Python backend & AI microservices" });
  }
  if ((categorized.Languages.includes("javascript") || categorized.Frameworks.includes("react")) && !categorized.Languages.includes("typescript")) {
    recommendations.push({ skill: "TypeScript", category: "Languages", reason: "Standard requirement across 85% of modern frontend job openings" });
  }
  if (!categorized.CloudDevOps.includes("docker")) {
    recommendations.push({ skill: "Docker", category: "CloudDevOps", reason: "Foundational containerization required across backend and full stack roles" });
  }
  if (!categorized.Databases.includes("postgresql")) {
    recommendations.push({ skill: "PostgreSQL", category: "Databases", reason: "Most requested relational database in verified tech job listings" });
  }

  return {
    skills: normalized,
    categorized,
    totalSkillsCount: normalized.length,
    recommendations: recommendations.slice(0, 5),
    dnaStrengthScore: Math.min(100, Math.round(normalized.length * 9.5)),
  };
}
