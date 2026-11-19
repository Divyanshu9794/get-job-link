/**
 * Role-Specific ATS & Resume Intelligence Engine
 * 
 * Implements practical, role-wise evaluation on four specific criteria:
 * 1. Keyword Matching (exact technical skills, tools, role titles, problem-solving, communication, teamwork - in context)
 * 2. Performance & Impact (measurable achievements e.g. throughput, latency, reliability, scale - never invent metrics)
 * 3. Technical Depth (role-relevant concepts appropriate for the specific role category)
 * 4. Role Alignment (headline, summary, skills and experience alignment with target title)
 */

// Domain taxonomies for role-specific technical depth evaluation
export const ROLE_TAXONOMIES = {
  frontend: {
    name: "Frontend Engineering",
    coreKeywords: [
      "react", "react.js", "next.js", "vue", "vue.js", "angular", "typescript", "javascript",
      "html5", "css3", "tailwind", "sass", "redux", "zustand", "graphql", "rest", "webpack",
      "vite", "jest", "cypress", "web vitals", "responsive design", "micro-frontends", "pwa"
    ],
    depthConcepts: [
      { name: "State Management", terms: ["redux", "zustand", "context api", "mobx", "recoil"] },
      { name: "Performance & Web Vitals", terms: ["core web vitals", "fcp", "lcp", "cls", "bundle size", "code splitting", "lazy loading", "tree shaking"] },
      { name: "Rendering & Architecture", terms: ["ssr", "ssg", "server components", "csr", "hydration", "micro-frontends"] },
      { name: "Testing & Quality", terms: ["jest", "cypress", "playwright", "react testing library", "vitest", "e2e"] },
      { name: "Accessibility & Design", terms: ["wcag", "a11y", "aria", "responsive", "design system"] },
    ],
    impactKeywords: ["bundle size", "load time", "fcp", "lcp", "conversion", "crash-free", "fps", "render time"],
  },
  backend: {
    name: "Backend & Systems",
    coreKeywords: [
      "node.js", "python", "java", "spring boot", "go", "golang", "c++", "c#", ".net",
      "fastapi", "django", "express", "microservices", "sql", "postgresql", "mysql", "mongodb",
      "redis", "kafka", "rabbitmq", "rest api", "grpc", "docker", "kubernetes", "aws", "system design"
    ],
    depthConcepts: [
      { name: "Distributed Systems & Messaging", terms: ["kafka", "rabbitmq", "event-driven", "pub/sub", "sqs", "microservices"] },
      { name: "Caching & In-Memory Stores", terms: ["redis", "memcached", "cache invalidation", "distributed cache"] },
      { name: "Database & Concurrency", terms: ["acid", "indexing", "sharding", "replication", "concurrency", "transactions", "nosql", "postgresql"] },
      { name: "API Architecture", terms: ["rest", "grpc", "graphql", "rate limiting", "api gateway", "openapi", "swagger"] },
      { name: "Reliability & Scalability", terms: ["fault tolerance", "circuit breaker", "load balancing", "horizontal scaling", "p99", "latency"] },
    ],
    impactKeywords: ["throughput", "qps", "rps", "latency", "p99", "uptime", "99.9%", "concurrency", "query optimization", "cost reduction"],
  },
  ai_ml: {
    name: "AI & Machine Learning",
    coreKeywords: [
      "python", "pytorch", "tensorflow", "machine learning", "deep learning", "llm", "large language models",
      "rag", "retrieval-augmented generation", "langchain", "llamaindex", "transformers", "hugging face",
      "fine-tuning", "vector database", "pinecone", "weaviate", "qdrant", "nlp", "computer vision", "openai"
    ],
    depthConcepts: [
      { name: "RAG & Vector Pipelines", terms: ["rag", "vector database", "embeddings", "pinecone", "weaviate", "qdrant", "chunking", "retrieval"] },
      { name: "LLM Frameworks & Fine-Tuning", terms: ["langchain", "llamaindex", "fine-tuning", "lora", "transformers", "hugging face", "prompt engineering"] },
      { name: "Model Serving & Inference", terms: ["onnx", "tensorrt", "triton", "quantization", "fastapi", "inference latency", "vllm"] },
      { name: "Evaluation & Monitoring", terms: ["evals", "ragas", "bleu", "rouge", "accuracy", "hallucination", "precision", "recall"] },
    ],
    impactKeywords: ["inference latency", "tokens/sec", "perplexity", "accuracy", "precision", "recall", "quantization", "gpu utilization"],
  },
  data: {
    name: "Data Engineering",
    coreKeywords: [
      "sql", "python", "spark", "pyspark", "hadoop", "snowflake", "bigquery", "databricks",
      "dbt", "airflow", "etl", "data pipeline", "kafka", "pandas", "data warehouse", "lakehouse",
      "power bi", "tableau", "aws redshift", "scikit-learn"
    ],
    depthConcepts: [
      { name: "Pipelines & Orchestration", terms: ["airflow", "dag", "prefect", "dagster", "etl", "elt", "data pipeline"] },
      { name: "Warehousing & Lakehouse", terms: ["snowflake", "bigquery", "redshift", "databricks", "delta lake", "iceberg"] },
      { name: "Stream & Batch Processing", terms: ["spark", "pyspark", "kafka", "flink", "streaming", "batch processing"] },
      { name: "Data Modeling & Quality", terms: ["dbt", "dimensional modeling", "star schema", "data quality", "soda", "great expectations"] },
    ],
    impactKeywords: ["data volume", "tb", "gb", "query time", "pipeline runtime", "daily records", "warehouse cost", "sla"],
  },
  devops_cloud: {
    name: "DevOps & Cloud Infrastructure",
    coreKeywords: [
      "aws", "azure", "gcp", "kubernetes", "k8s", "docker", "terraform", "ansible",
      "ci/cd", "github actions", "gitlab ci", "jenkins", "prometheus", "grafana", "helm",
      "linux", "bash", "networking", "security", "infrastructure as code", "iac", "site reliability"
    ],
    depthConcepts: [
      { name: "Container Orchestration", terms: ["kubernetes", "k8s", "helm", "docker", "pod", "ingress", "service mesh", "istio"] },
      { name: "Infrastructure as Code", terms: ["terraform", "terragrunt", "ansible", "cloudformation", "iac", "pulumi"] },
      { name: "CI/CD & Automation", terms: ["github actions", "gitlab ci", "jenkins", "argocd", "gitops", "deployment pipeline"] },
      { name: "Observability & SRE", terms: ["prometheus", "grafana", "datadog", "sli", "slo", "sla", "mttr", "distributed tracing", "opentelemetry"] },
    ],
    impactKeywords: ["uptime", "mttr", "deployment frequency", "lead time", "cloud spend", "cost savings", "autoscaling"],
  },
  mobile: {
    name: "Mobile Development",
    coreKeywords: [
      "react native", "flutter", "swift", "swiftui", "kotlin", "android", "ios",
      "mobile app", "xcode", "android studio", "rest api", "offline storage", "push notifications"
    ],
    depthConcepts: [
      { name: "State & Offline Persistence", terms: ["sqlite", "room", "core data", "realm", "watermelondb", "offline first"] },
      { name: "Native Bridges & Performance", terms: ["jni", "native modules", "memory leaks", "60fps", "app size", "cold start"] },
      { name: "Lifecycle & Background Tasks", terms: ["background fetch", "push notifications", "workmanager", "fcm", "apns"] },
      { name: "Publishing & CI/CD", terms: ["fastlane", "app store connect", "google play console", "testflight"] },
    ],
    impactKeywords: ["app launch time", "crash-free rate", "app size reduction", "fps", "downloads", "session length"],
  },
  qa_testing: {
    name: "QA & Test Automation",
    coreKeywords: [
      "selenium", "cypress", "playwright", "jest", "junit", "test automation",
      "api testing", "postman", "performance testing", "jmeter", "ci/cd", "bug tracking"
    ],
    depthConcepts: [
      { name: "UI Automation", terms: ["cypress", "playwright", "selenium", "page object model", "pom"] },
      { name: "API & Contract Testing", terms: ["postman", "rest assured", "pact", "mock server"] },
      { name: "Load & Performance Testing", terms: ["jmeter", "k6", "locust", "stress testing"] },
      { name: "CI/CD Integration", terms: ["test reporter", "parallel execution", "regression suite", "code coverage"] },
    ],
    impactKeywords: ["test coverage", "automation percentage", "regression cycle time", "bug detection rate", "flaky test reduction"],
  },
  general: {
    name: "Software Engineering",
    coreKeywords: [
      "data structures", "algorithms", "system design", "git", "ci/cd", "rest", "agile",
      "scrum", "object-oriented", "design patterns", "debugging", "code review", "unit testing"
    ],
    depthConcepts: [
      { name: "Software Design", terms: ["solid", "design patterns", "clean architecture", "refactoring"] },
      { name: "API & Data", terms: ["rest api", "sql", "databases", "json", "http"] },
      { name: "Development Practices", terms: ["git", "code review", "ci/cd", "unit testing", "agile"] },
    ],
    impactKeywords: ["performance", "efficiency", "reliability", "cost", "optimization", "user adoption"],
  },
};

const SOFT_SKILLS_TAXONOMY = [
  "problem solving", "communication", "teamwork", "leadership", "collaboration",
  "critical thinking", "ownership", "adaptability", "cross-functional", "mentoring"
];

/**
 * Detect role category from job title, domain, skills, and JD text.
 */
export function detectRoleCategory(job) {
  if (!job) return "general";
  const title = (job.title || "").toLowerCase();
  const domain = (job.domain || "").toLowerCase();
  const jd = (job.jd || job.description || "").toLowerCase();

  if (title.includes("frontend") || title.includes("react") || title.includes("angular") || title.includes("ui/ux") || title.includes("web dev") || jd.includes("frontend development")) {
    return "frontend";
  }
  if (title.includes("ai ") || title.includes("machine learning") || title.includes("ml ") || title.includes("llm") || title.includes("data scientist") || jd.includes("machine learning model")) {
    return "ai_ml";
  }
  if (title.includes("data engineer") || title.includes("data warehouse") || title.includes("etl") || domain.includes("data")) {
    return "data";
  }
  if (title.includes("devops") || title.includes("sre") || title.includes("cloud") || title.includes("platform engineer") || title.includes("infrastructure")) {
    return "devops_cloud";
  }
  if (title.includes("mobile") || title.includes("android") || title.includes("ios") || title.includes("flutter") || title.includes("react native")) {
    return "mobile";
  }
  if (title.includes("qa") || title.includes("test") || title.includes("automation engineer") || title.includes("quality assurance")) {
    return "qa_testing";
  }
  if (title.includes("backend") || title.includes("software engineer") || title.includes("sde") || title.includes("fullstack") || title.includes("developer")) {
    return "backend";
  }

  return "general";
}

/**
 * Extracts JD keywords including explicit job.skills and taxonomy terms.
 */
export function extractJdKeywords(job) {
  if (!job) return [];
  const text = `${job.title || ""} ${job.domain || ""} ${(job.skills || []).join(" ")} ${job.jd || job.description || ""}`.toLowerCase();
  const found = new Set();

  if (Array.isArray(job.skills)) {
    job.skills.forEach((s) => {
      const clean = s.trim();
      if (clean && clean.length > 1 && !clean.includes("\n")) {
        found.add(clean);
      }
    });
  }

  const category = detectRoleCategory(job);
  const taxonomy = ROLE_TAXONOMIES[category] || ROLE_TAXONOMIES.general;
  taxonomy.coreKeywords.forEach((term) => {
    if (term.length <= 2) {
      const regex = new RegExp(`\\b${term}\\b`, "i");
      if (regex.test(text)) found.add(term.toUpperCase());
    } else if (text.includes(term.toLowerCase())) {
      found.add(term.charAt(0).toUpperCase() + term.slice(1));
    }
  });

  return Array.from(found).slice(0, 16);
}

/**
 * 4-Criteria Role-Wise ATS Evaluation Engine
 * Evaluates candidate resume against specific JD and role.
 */
export function calculateAtsMatch(resumeText, job) {
  if (!resumeText || !job) {
    return {
      score: 0,
      roleCategory: "general",
      matchedKeywords: [],
      missingKeywords: [],
      skillsGaps: [],
      keywordMatch: { score: 0, matched: [], missing: [], feedback: "" },
      performanceImpact: { score: 0, hasMetrics: false, feedback: "" },
      technicalDepth: { score: 0, skillsGaps: [], feedback: "" },
      roleAlignment: { score: 0, feedback: "" },
      strengths: [],
      improvements: [],
    };
  }

  const rLower = resumeText.toLowerCase();
  const roleCategory = detectRoleCategory(job);
  const taxonomy = ROLE_TAXONOMIES[roleCategory] || ROLE_TAXONOMIES.general;
  const jdKeywords = extractJdKeywords(job);

  // -------------------------------------------------------------
  // CRITERION 1: Keyword Matching (Technical + Soft + Role Titles)
  // Check contextual usage: does keyword appear in sentences/bullets?
  // -------------------------------------------------------------
  const matched = [];
  const missing = [];
  let contextualHits = 0;

  jdKeywords.forEach((kw) => {
    const kwLower = kw.toLowerCase();
    if (rLower.includes(kwLower)) {
      matched.push(kw);
      // Check if keyword is used contextually (surrounded by active words rather than a isolated list)
      const contextRegex = new RegExp(`(?:using|built|developed|architected|implemented|managed|with|in)\\s+[a-z0-9\\s]{0,20}${kwLower}|${kwLower}\\s+(?:to|for|with|reducing|improving|handling)`, "i");
      if (contextRegex.test(resumeText)) {
        contextualHits++;
      }
    } else {
      missing.push(kw);
    }
  });

  // Soft skills check
  const matchedSoftSkills = SOFT_SKILLS_TAXONOMY.filter((s) => rLower.includes(s));

  const keywordRatio = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0.6;
  let keywordScore = Math.round(keywordRatio * 85);
  if (contextualHits >= 3) keywordScore += 10;
  if (matchedSoftSkills.length >= 2) keywordScore += 5;
  keywordScore = Math.min(98, Math.max(25, keywordScore));

  const keywordFeedback = contextualHits >= 3
    ? `Matched ${matched.length}/${jdKeywords.length} core keywords with strong contextual usage in bullet points.`
    : `Matched ${matched.length}/${jdKeywords.length} keywords. Weave skills directly into project bullets rather than isolated skills lists.`;

  // -------------------------------------------------------------
  // CRITERION 2: Performance & Impact (Measurable Engineering Metrics)
  // Look for quantifiable achievements: latency, throughput, %, scale.
  // Never invent metrics.
  // -------------------------------------------------------------
  const metricRegex = /\b\d+(?:\.\d+)?(?:%|ms|s|k|m|b|tb|gb|qps|rps|req\/s|x)\b/i;
  const impactVerbsRegex = /\b(reduced|improved|increased|optimized|scaled|architected|accelerated|automated|saved|cut|boosted|maintained)\b/i;
  
  const sentences = resumeText.split(/\n|\. /);
  const impactfulBullets = sentences.filter((s) => metricRegex.test(s) && impactVerbsRegex.test(s));
  const hasMetrics = impactfulBullets.length > 0;

  let impactScore = 40;
  if (impactfulBullets.length >= 4) {
    impactScore = 95;
  } else if (impactfulBullets.length >= 2) {
    impactScore = 80;
  } else if (hasMetrics) {
    impactScore = 65;
  }

  const impactFeedback = hasMetrics
    ? `Detected ${impactfulBullets.length} bullet point(s) with verifiable, quantifiable achievements (percentages, scale, or latency).`
    : "No measurable engineering metrics detected. Add factual numbers (e.g. latency, throughput, reliability, cost savings) to prove real-world impact. Never invent fake metrics.";

  // -------------------------------------------------------------
  // CRITERION 3: Technical Depth (Role-Relevant Concepts)
  // Evaluate specific concepts required for this role category.
  // -------------------------------------------------------------
  const skillsGaps = [];
  let depthConceptHits = 0;

  taxonomy.depthConcepts.forEach((concept) => {
    const hasConcept = concept.terms.some((term) => rLower.includes(term.toLowerCase()));
    if (hasConcept) {
      depthConceptHits++;
    } else {
      skillsGaps.push(concept.name);
    }
  });

  const depthRatio = taxonomy.depthConcepts.length > 0
    ? depthConceptHits / taxonomy.depthConcepts.length
    : 0.5;
  let depthScore = Math.round(depthRatio * 75 + (matched.length > 4 ? 20 : 10));
  depthScore = Math.min(98, Math.max(30, depthScore));

  const depthFeedback = skillsGaps.length === 0
    ? `Excellent technical depth across all core ${taxonomy.name} architectural pillars.`
    : `Missing depth in ${skillsGaps.slice(0, 2).join(" & ")}. Highlight practical experience in these areas if applicable.`;

  // -------------------------------------------------------------
  // CRITERION 4: Role Alignment (Headline, Summary & Title Mirroring)
  // Suggest improvements without guaranteeing ATS selection.
  // -------------------------------------------------------------
  const targetTitle = (job.title || "").toLowerCase();
  const first20Percent = rLower.slice(0, Math.floor(rLower.length * 0.25));
  
  // Check if title or words from title appear in the top section
  const titleWords = targetTitle.split(/\s+/).filter((w) => w.length > 3 && !["with", "and", "the", "for"].includes(w));
  const titleMatchesInHeader = titleWords.filter((w) => first20Percent.includes(w));
  const hasDirectTitleMatch = targetTitle.length > 4 && first20Percent.includes(targetTitle);

  let alignmentScore = 45;
  if (hasDirectTitleMatch) {
    alignmentScore = 95;
  } else if (titleMatchesInHeader.length >= 2) {
    alignmentScore = 80;
  } else if (titleMatchesInHeader.length === 1) {
    alignmentScore = 65;
  }

  const alignmentFeedback = hasDirectTitleMatch
    ? `Target role title '${job.title}' is mirrored in your resume header, helping automated screeners index your profile.`
    : `Consider aligning your resume headline/summary with '${job.title}' to improve relevancy scoring in automated requisition filters.`;

  // -------------------------------------------------------------
  // COMPOSITE ATS SCORE (Role-Weighted)
  // -------------------------------------------------------------
  const finalScore = Math.round(
    keywordScore * 0.35 +
    impactScore * 0.25 +
    depthScore * 0.20 +
    alignmentScore * 0.20
  );

  // Short Improvement Suggestions (concise & practical)
  const improvements = [];
  if (missing.length > 0) {
    improvements.push(`Incorporate priority JD keywords: ${missing.slice(0, 5).join(", ")} into your experience bullets.`);
  }
  if (!hasMetrics) {
    improvements.push("Quantify achievements with real numbers (e.g. latency, throughput, scale, uptime) to demonstrate impact.");
  }
  if (skillsGaps.length > 0) {
    improvements.push(`Address skill gaps in ${skillsGaps.slice(0, 2).join(" and ")} relevant to this ${taxonomy.name} role.`);
  }
  if (!hasDirectTitleMatch) {
    improvements.push(`Update your resume headline/summary to explicitly reference '${job.title}'.`);
  }

  const strengths = [];
  if (matched.length > 0) {
    strengths.push(`Strong keyword match: identified ${matched.length} key technical terms from this JD.`);
  }
  if (hasMetrics) {
    strengths.push("Identified measurable engineering outcomes and action verbs in your experience.");
  }
  if (depthConceptHits >= 3) {
    strengths.push(`Demonstrated solid architectural depth across ${taxonomy.name} concepts.`);
  }

  return {
    score: finalScore,
    roleCategory,
    roleName: taxonomy.name,
    matchedKeywords: matched,
    missingKeywords: missing,
    skillsGaps,
    keywordMatch: {
      score: keywordScore,
      matched,
      missing,
      feedback: keywordFeedback,
    },
    performanceImpact: {
      score: impactScore,
      hasMetrics,
      feedback: impactFeedback,
    },
    technicalDepth: {
      score: depthScore,
      skillsGaps,
      feedback: depthFeedback,
    },
    roleAlignment: {
      score: alignmentScore,
      feedback: alignmentFeedback,
    },
    strengths,
    improvements: improvements.slice(0, 4),
  };
}

/**
 * 4 Practical ATS Tips specifically tailored for this role and JD.
 */
export function getRoleSpecificAtsTips(job) {
  if (!job) return [];
  const category = detectRoleCategory(job);
  const keywords = extractJdKeywords(job);
  const title = job.title || "Software Engineer";
  const experience = job.experience || "0+ years";
  const company = job.company || "Employer";

  const topKeywordsList = keywords.length > 0 
    ? keywords.slice(0, 5).join(", ") 
    : "Primary language, cloud services, and framework tags";

  switch (category) {
    case "frontend":
      return [
        {
          id: 1,
          category: "Keyword Matching",
          badge: "Contextual Syntax",
          color: "blue",
          title: "Hard Syntax & Framework Parsing",
          description: `ATS filters for ${company}'s frontend stack (targeting: ${topKeywordsList}). Automated scanners flag resumes where tools are only listed in a bottom 'Skills' list; weave them directly into your Experience bullets (e.g., 'Architected responsive UI in ${keywords[0] || "React"} using ${keywords[1] || "TypeScript"} and state management').`
        },
        {
          id: 2,
          category: "Performance & Impact",
          badge: "Measurable Impact",
          color: "emerald",
          title: "Core Web Vitals & Bundle Metrics",
          description: `Recruiters filter for quantifiable performance wins. Don't write 'built performant web pages'. ATS scanners look for metrics like 'Reduced bundle size by 35% via code splitting', 'Improved FCP from 2.8s to 1.1s', or 'Maintained 99.8% crash-free sessions'. Never invent metrics.`
        },
        {
          id: 3,
          category: "Technical Depth",
          badge: "Architecture Gatekeeper",
          color: "amber",
          title: "Production State & Component Architecture",
          description: `For ${experience} roles, screeners reject simple demo projects. Highlight production architecture: state management patterns (Redux/Zustand), automated unit/e2e testing (Jest/Cypress), SSR/SSG hydration, and responsive accessibility (WCAG AA).`
        },
        {
          id: 4,
          category: "Role Alignment",
          badge: "Title Mirroring",
          color: "purple",
          title: "Direct Title Mirroring in Professional Summary",
          description: `Set your resume headline to mirror this exact role: '${title}'. Title alignment triggers algorithmic relevance in recruiter ATS views without guaranteeing final candidate selection.`
        }
      ];

    case "ai_ml":
      return [
        {
          id: 1,
          category: "Keyword Matching",
          badge: "Taxonomy Matching",
          color: "blue",
          title: "LLM, RAG & Vector Stack Taxonomy",
          description: `This JD specifically screens for modern AI engineering terminology: ${topKeywordsList}. Citing explicit pipelines like 'RAG retrieval with chunking', 'Vector embeddings', or 'PyTorch model fine-tuning' scores significantly higher than generic 'AI/ML' claims.`
        },
        {
          id: 2,
          category: "Performance & Impact",
          badge: "Measurable Impact",
          color: "emerald",
          title: "Inference Latency & Evaluation Benchmarks",
          description: `Hiring algorithms look for mathematical and operational benchmarks: 'Decreased query latency from 1.4s to 420ms via prompt caching and streaming', 'Boosted retrieval precision by 18%', or 'Reduced inference compute costs by 35% via quantization'.`
        },
        {
          id: 3,
          category: "Technical Depth",
          badge: "Production Deployment",
          color: "amber",
          title: "Production Pipelines vs Isolated Notebooks",
          description: `Screening filters for ${company} look for end-to-end deployment signals: FastAPI/gRPC inference servers, Dockerized pipelines, token monitoring/observability, and evaluation test suites.`
        },
        {
          id: 4,
          category: "Role Alignment",
          badge: "Header Alignment",
          color: "purple",
          title: "Highlight Applied Systems in Top Experience Bullets",
          description: `Allocate the first bullet of your recent roles to production AI pipeline architecture. Use '${title}' in your resume headline so ATS classification engines map your profile to engineering bands rather than academic research.`
        }
      ];

    case "data":
      return [
        {
          id: 1,
          category: "Keyword Matching",
          badge: "Pipeline Taxonomy",
          color: "blue",
          title: "Data Warehouse & Pipeline Keywords",
          description: `ATS filters for ${company} look for: ${topKeywordsList}. Pair storage engines with transformation tools in your bullets (e.g. 'Constructed automated dbt models inside Snowflake orchestrated via Airflow').`
        },
        {
          id: 2,
          category: "Performance & Impact",
          badge: "Measurable Impact",
          color: "emerald",
          title: "Data Volume & Query Cost Reductions",
          description: `The screening algorithm ranks high on throughput and financial optimization: 'Processed 5TB+ daily streaming events with 99.9% uptime', 'Reduced analytical query runtime by 60%', or 'Lowered monthly compute costs by 28% via query clustering'.`
        },
        {
          id: 3,
          category: "Technical Depth",
          badge: "Governance Gatekeeper",
          color: "amber",
          title: "Data Modeling & Governance Standards",
          description: `For a ${experience} data role, automated filters look for dimensional modeling (Star/Snowflake schema), data quality validation suites, and CI/CD version-controlled data pipelines.`
        },
        {
          id: 4,
          category: "Role Alignment",
          badge: "Header Alignment",
          color: "purple",
          title: "Lead With Core Pipeline Scale",
          description: `Lead every job experience entry with the scale of data handled (records, gigabytes/terabytes, SLA). Align your target resume title directly with '${title}'.`
        }
      ];

    default: // backend / general engineering
      return [
        {
          id: 1,
          category: "Keyword Matching",
          badge: "Exact Keywords",
          color: "blue",
          title: "Backend & Systems Taxonomy Matching",
          description: `ATS filters for ${company} are actively scanning for: ${topKeywordsList}. Modern ATS engines verify that technical terms appear in context alongside problem statements, not just isolated in a comma-separated skills list at the bottom of the page.`
        },
        {
          id: 2,
          category: "Performance & Impact",
          badge: "Measurable Impact",
          color: "emerald",
          title: "Throughput, Latency & Reliability Benchmarks",
          description: `Recruiters filter for high-impact engineering metrics. Replace 'worked on backend APIs' with measurable outcomes: 'Engineered high-throughput REST/gRPC microservices handling 12,000 requests/sec with p99 latency < 45ms', or 'Optimized PostgreSQL indexing reducing query execution times by 55%'.`
        },
        {
          id: 3,
          category: "Technical Depth",
          badge: "Distributed Systems",
          color: "amber",
          title: "Concurrency & Distributed Systems Gatekeepers",
          description: `For ${experience} roles, the automated parser screens for architectural maturity: asynchronous messaging (Kafka/RabbitMQ), distributed caching (Redis), transaction consistency, and database schema migrations under zero downtime.`
        },
        {
          id: 4,
          category: "Role Alignment",
          badge: "Header Alignment",
          color: "purple",
          title: "Mirror the Title in Your Profile Header",
          description: `Explicitly set your resume headline to '${title}'. Recruiters sorting 500+ applicants often use title filters as their first screening pass. Matching the target role title in your resume summary triggers an immediate relevance boost.`
        }
      ];
  }
}
