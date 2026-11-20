const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!admin.apps.length) {
  admin.initializeApp();
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const ADMIN_EMAILS = ["sdivyanshu352@gmail.com", "getjoblink647@gmail.com"];
const GA4_PROPERTY_ID = "543069695"; // GA4 Property: https://analytics.google.com/analytics/web/#/a302626524p543069695

/**
 * 1. ATS Scoring Engine (Cloud Function)
 */
exports.analyzeATS = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { resumeText, jobDescription, targetRole } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Resume text and Job Description are required." });
    }

    if (!genAI) {
      return res.status(503).json({ error: "Gemini API key is not configured on server." });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are an expert, strict, and role-specific Applicant Tracking System (ATS) evaluator.
      Target Role: ${targetRole || "Software Engineering"}
      
      Job Description:
      ${jobDescription}
      
      Candidate Resume:
      ${resumeText}
      
      Evaluate the candidate strictly on these 4 core criteria without inventing any metrics or guaranteeing ATS selection:
      1. Keyword Matching (exact technical skills, tools, role titles, problem-solving, communication and teamwork. Check contextual usage).
      2. Performance & Impact (identify measurable engineering achievements such as throughput, latency, reliability and optimization).
      3. Technical Depth (evaluate role-relevant concepts appropriate for the specific role).
      4. Role Alignment (check whether the resume headline, summary, skills and experience align with the target job title).
      
      Respond with raw JSON strictly matching:
      {
        "atsScore": 82,
        "keywordMatch": {
          "score": 85,
          "matchedKeywords": ["React", "TypeScript", "REST APIs"],
          "missingKeywords": ["GraphQL", "Docker"],
          "feedback": "Core technical skills appear in context within experience bullets."
        },
        "performanceImpact": {
          "score": 75,
          "hasMetrics": true,
          "feedback": "Found measurable latency and bundle optimization achievements."
        },
        "technicalDepth": {
          "score": 80,
          "skillsGaps": ["Containerization", "CI/CD automation"],
          "feedback": "Demonstrates strong frontend architecture; needs more depth in build pipelines."
        },
        "roleAlignment": {
          "score": 85,
          "feedback": "Headline aligns well with the target role title."
        },
        "shortSuggestions": [
          "Incorporate missing keywords into your experience bullets.",
          "Add quantifiable performance numbers (e.g. latency, throughput, scale) to your projects."
        ]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text().trim();
    const json = JSON.parse(responseText);
    return res.status(200).json(json);
  } catch (err) {
    console.error("ATS analysis error:", err);
    return res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  }
});

/**
 * Helper to securely load GA4 service account credentials from:
 * 1. Cloud Secret Manager / Environment variable: GA_SERVICE_ACCOUNT_KEY
 * 2. Secure gitignored backend file: functions/service-account.json
 * 3. Standard Google Application Credentials: GOOGLE_APPLICATION_CREDENTIALS
 */
function resolveGA4Credentials() {
  if (process.env.GA_SERVICE_ACCOUNT_KEY) {
    try {
      return typeof process.env.GA_SERVICE_ACCOUNT_KEY === "string"
        ? JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY)
        : process.env.GA_SERVICE_ACCOUNT_KEY;
    } catch {
      if (fs.existsSync(process.env.GA_SERVICE_ACCOUNT_KEY)) {
        return JSON.parse(fs.readFileSync(process.env.GA_SERVICE_ACCOUNT_KEY, "utf-8"));
      }
    }
  }

  const localKeyPath = path.join(__dirname, "service-account.json");
  if (fs.existsSync(localKeyPath)) {
    try {
      return JSON.parse(fs.readFileSync(localKeyPath, "utf-8"));
    } catch (e) {
      console.warn("Could not parse local service-account.json:", e.message);
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    try {
      return JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf-8"));
    } catch (e) {
      console.warn("Could not parse GOOGLE_APPLICATION_CREDENTIALS:", e.message);
    }
  }

  return null;
}

/**
 * 2. Secure Google Analytics 4 Data API (Cloud Function)
 * Connects directly to GA4 Property 543069695 via service account getjoblink-analytics.
 * Strictly verifies admin credentials before querying.
 */
exports.getGA4Analytics = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  // 1. Verify Admin Authentication via Firebase ID Token
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized: Missing or malformed Authorization header.",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];
  let userEmail = "";
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    userEmail = (decodedToken.email || "").toLowerCase();
    const isAdmin = ADMIN_EMAILS.some((e) => e.toLowerCase() === userEmail);
    if (!isAdmin) {
      return res.status(403).json({
        error: "Forbidden: Only authorized administrators may view analytics data.",
      });
    }
  } catch (authErr) {
    console.error("Token verification failed:", authErr);
    return res.status(401).json({ error: "Invalid or expired authorization token." });
  }

  // 2. Parse Date Filter: today | 7days | 30days | ytd
  const dateRangeParam = (req.body?.dateRange || req.query?.dateRange || "7days").toLowerCase();
  const currentYear = new Date().getFullYear();
  let startDate = "7daysAgo";
  let endDate = "today";

  if (dateRangeParam === "today") {
    startDate = "today";
    endDate = "today";
  } else if (dateRangeParam === "30days") {
    startDate = "30daysAgo";
    endDate = "today";
  } else if (dateRangeParam === "ytd") {
    startDate = `${currentYear}-01-01`;
    endDate = "today";
  } else {
    startDate = "7daysAgo";
    endDate = "today";
  }

  // 3. Resolve GA4 Credentials and Client
  let BetaAnalyticsDataClient;
  try {
    const gaDataModule = require("@google-analytics/data");
    BetaAnalyticsDataClient = gaDataModule.BetaAnalyticsDataClient;
  } catch (err) {
    console.warn("@google-analytics/data not installed yet:", err.message);
  }

  const credentials = resolveGA4Credentials();

  if (!BetaAnalyticsDataClient || (!credentials && !process.env.K_SERVICE)) {
    return res.status(200).json({
      configured: false,
      propertyId: GA4_PROPERTY_ID,
      measurementId: "G-7LPCET02EM",
      message: "GA4 Data API client credentials are not yet configured on the Cloud Function runtime.",
      setupInstructions: [
        "1. Open Google Cloud Console -> IAM -> Service Accounts.",
        "2. Locate service account getjoblink-analytics@get-job-link.iam.gserviceaccount.com.",
        `3. In Google Analytics -> Admin -> Property Access Management (Property ID ${GA4_PROPERTY_ID}), verify Viewer role is granted.`,
        "4. Set GA_SERVICE_ACCOUNT_KEY in Google Cloud Secret Manager or environment variables.",
      ],
      currentFilter: {
        dateRange: dateRangeParam,
        startDate,
        endDate,
      },
    });
  }

  // 4. Query Live GA4 Data API
  try {
    let clientOptions = {};
    if (credentials) {
      clientOptions.credentials = credentials;
    }

    const analyticsDataClient = new BetaAnalyticsDataClient(clientOptions);

    // Query A: Core Summary Metrics (Total users, new users, active users, page views, event count)
    const [summaryResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "eventCount" },
      ],
    });

    const summaryRow = summaryResponse.rows?.[0]?.metricValues || [];
    const totalUsers = parseInt(summaryRow[0]?.value || "0", 10);
    const newUsers = parseInt(summaryRow[1]?.value || "0", 10);
    const activeUsers = parseInt(summaryRow[2]?.value || "0", 10);
    const screenPageViews = parseInt(summaryRow[3]?.value || "0", 10);
    const eventCount = parseInt(summaryRow[4]?.value || "0", 10);

    // Query B: Interaction & Feature Usage Events
    const [eventsResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
    });

    const eventCounts = {};
    (eventsResponse.rows || []).forEach((row) => {
      const name = row.dimensionValues?.[0]?.value;
      const count = parseInt(row.metricValues?.[0]?.value || "0", 10);
      if (name) eventCounts[name] = count;
    });

    // Query C: Daily & Monthly Trends
    const [trendsResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const trends = (trendsResponse.rows || []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value || "";
      const formattedDate =
        rawDate.length === 8 ? rawDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") : rawDate;
      return {
        date: formattedDate,
        activeUsers: parseInt(row.metricValues?.[0]?.value || "0", 10),
        pageViews: parseInt(row.metricValues?.[1]?.value || "0", 10),
      };
    });

    // Query D: Top Visited Pages
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const topPages = (pagesResponse.rows || []).map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value,
      views: parseInt(row.metricValues?.[0]?.value || "0", 10),
      users: parseInt(row.metricValues?.[1]?.value || "0", 10),
    }));

    // Query E: Most Viewed Jobs (URLs with /job/)
    const [jobsResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "CONTAINS",
            value: "/job/",
          },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const topJobs = (jobsResponse.rows || []).map((row) => ({
      jobPath: row.dimensionValues?.[0]?.value,
      views: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    // Derive feature engagement metrics accurately
    let jobDetailPageViews = eventCounts["view_job_detail"] || 0;
    if (!jobDetailPageViews) {
      topJobs.forEach((j) => {
        jobDetailPageViews += j.views;
      });
    }

    const applyButtonClicks = eventCounts["click_apply"] || eventCounts["click"] || 0;

    const resumeBuilderUsage =
      eventCounts["use_resume_builder"] ||
      topPages.find((p) => p.pagePath && (p.pagePath === "/resume" || p.pagePath.startsWith("/resume/")))?.views ||
      0;

    const atsCheckerUsage =
      eventCounts["use_ats_checker"] ||
      topPages.find((p) => p.pagePath && (p.pagePath === "/ats" || p.pagePath.startsWith("/ats/")))?.views ||
      0;

    const savedJobEngagement = eventCounts["save_job"] || eventCounts["bookmark_job"] || 0;

    return res.status(200).json({
      configured: true,
      propertyId: GA4_PROPERTY_ID,
      measurementId: "G-7LPCET02EM",
      dateRange: dateRangeParam,
      startDate,
      endDate,
      metrics: {
        totalUsers,
        newUsers,
        activeUsers,
        totalPageViews: screenPageViews,
        eventCount,
        jobDetailPageViews,
        applyButtonClicks,
        resumeBuilderUsage,
        atsCheckerUsage,
        savedJobEngagement,
      },
      events: eventCounts,
      trends,
      topPages,
      topJobs,
    });
  } catch (apiErr) {
    console.error("GA4 Data API query failed:", apiErr);
    return res.status(200).json({
      configured: false,
      propertyId: GA4_PROPERTY_ID,
      error: apiErr.message,
      message: "Failed to fetch live data from GA4 Data API. Verify service account permissions.",
    });
  }
});

/**
 * 3. Hiring Radar & Hiring Analytics Aggregation Engine (Cloud Function)
 * Analyzes the jobs collection in Firestore, builds idempotent company intelligence profiles,
 * and caches public aggregates into `hiring_radar_metadata/overview`.
 */
function normalizeCompanyNameFn(rawName) {
  if (!rawName || typeof rawName !== "string") return "Unknown Company";
  let clean = rawName.trim();
  if (!clean) return "Unknown Company";
  const cleaned = clean
    .replace(/\s+(?:Inc\.?|LLC\.?|Ltd\.?|Pvt\.?\s*Ltd\.?|Limited|Corporation|Corp\.?)$/i, "")
    .trim();
  return cleaned || clean;
}

function createCompanySlugFn(companyName) {
  const norm = normalizeCompanyNameFn(companyName);
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "unknown-company";
}

function getJobTimestampFn(job) {
  if (!job) return 0;
  const t = job.createdAt || job.date;
  if (!t) return 0;
  if (typeof t === "object" && t.seconds) return t.seconds * 1000;
  if (typeof t === "number") return t;
  const parsed = new Date(t).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

function extractSkillsFn(job) {
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

exports.rebuildHiringRadarAnalytics = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  // 1. Verify Admin Authentication via Firebase ID Token
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing Authorization header." });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmail = (decodedToken.email || "").toLowerCase();
    const isAdmin = ADMIN_EMAILS.some((e) => e.toLowerCase() === userEmail);
    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin privileges required." });
    }
  } catch (authErr) {
    return res.status(401).json({ error: "Invalid or expired authorization token." });
  }

  try {
    const db = admin.firestore();
    const snap = await db.collection("jobs").get();
    const jobs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const t7DaysAgo = now - 7 * ONE_DAY_MS;
    const t14DaysAgo = now - 14 * ONE_DAY_MS;
    const t30DaysAgo = now - 30 * ONE_DAY_MS;
    const t60DaysAgo = now - 60 * ONE_DAY_MS;
    const t90DaysAgo = now - 90 * ONE_DAY_MS;

    const companyMap = new Map();
    const skillFreq7d = new Map();
    const skillFreq30d = new Map();
    const skillFreq90d = new Map();
    const skillFreqAll = new Map();
    const skillPairingsMap = new Map();
    const locationMap = new Map();
    const domainMap = new Map();
    const dailyJobCounts = new Map();
    const workModeCounts = { remote: 0, hybrid: 0, onsite: 0 };

    const dataQuality = {
      totalChecked: jobs.length,
      missingCompany: 0,
      missingLocation: 0,
      missingSkills: 0,
      missingDates: 0,
      malformedSkills: 0,
      potentialDuplicates: 0,
    };
    const seenSignatures = new Set();
    let earliestObservationDate = now;

    jobs.forEach((job) => {
      const companyName = normalizeCompanyNameFn(job.company);
      const slug = createCompanySlugFn(companyName);
      const jobTime = getJobTimestampFn(job);
      const locStr = String(job.location || "").trim();
      const domainStr = String(job.domain || "Engineering").trim() || "Engineering";
      const skills = extractSkillsFn(job);
      const isRemote = Boolean(job.isRemote || String(job.jobType || "").toLowerCase().includes("remote") || locStr.toLowerCase().includes("remote"));

      if (jobTime > 0 && jobTime < earliestObservationDate) {
        earliestObservationDate = jobTime;
      }

      if (!job.company || String(job.company).trim() === "") dataQuality.missingCompany++;
      if (!locStr) dataQuality.missingLocation++;
      if (skills.length === 0) dataQuality.missingSkills++;
      if (jobTime === 0) dataQuality.missingDates++;

      const sig = `${companyName.toLowerCase()}|${String(job.title || "").toLowerCase().trim()}|${locStr.toLowerCase()}`;
      if (seenSignatures.has(sig)) {
        dataQuality.potentialDuplicates++;
      } else {
        seenSignatures.add(sig);
      }

      if (isRemote) workModeCounts.remote++;
      else if (locStr.toLowerCase().includes("hybrid")) workModeCounts.hybrid++;
      else workModeCounts.onsite++;

      domainMap.set(domainStr, (domainMap.get(domainStr) || 0) + 1);

      let cleanCity = locStr || "India";
      let cleanCountry = "India";
      if (cleanCity.includes(",")) {
        const parts = cleanCity.split(",").map((p) => p.trim());
        cleanCity = parts[0];
        cleanCountry = parts[parts.length - 1];
      }
      if (!locationMap.has(cleanCity)) {
        locationMap.set(cleanCity, { city: cleanCity, country: cleanCountry, count: 0, companies: new Set() });
      }
      const locEntry = locationMap.get(cleanCity);
      locEntry.count++;
      locEntry.companies.add(companyName);

      if (jobTime > 0) {
        const dayKey = new Date(jobTime).toISOString().split("T")[0];
        dailyJobCounts.set(dayKey, (dailyJobCounts.get(dayKey) || 0) + 1);
      }

      skills.forEach((s) => {
        skillFreqAll.set(s, (skillFreqAll.get(s) || 0) + 1);
        if (jobTime >= t90DaysAgo) skillFreq90d.set(s, (skillFreq90d.get(s) || 0) + 1);
        if (jobTime >= t30DaysAgo) skillFreq30d.set(s, (skillFreq30d.get(s) || 0) + 1);
        if (jobTime >= t7DaysAgo) skillFreq7d.set(s, (skillFreq7d.get(s) || 0) + 1);
      });

      if (skills.length > 1) {
        const sorted = [...new Set(skills)].sort();
        for (let i = 0; i < sorted.length; i++) {
          for (let j = i + 1; j < sorted.length; j++) {
            const pair = `${sorted[i]} + ${sorted[j]}`;
            skillPairingsMap.set(pair, (skillPairingsMap.get(pair) || 0) + 1);
          }
        }
      }

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
      if (locStr) c.locations.add(locStr);
      if (domainStr) c.domains.add(domainStr);
      if (job.title) c.titles.add(job.title.trim());

      if (jobTime > 0) {
        if (jobTime < c.firstObservedAt) c.firstObservedAt = jobTime;
        if (jobTime > c.lastJobAddedAt) c.lastJobAddedAt = jobTime;
        if (jobTime >= t7DaysAgo) c.jobsLast7d++;
        else if (jobTime >= t14DaysAgo && jobTime < t7DaysAgo) c.jobsPrev7d++;
        if (jobTime >= t30DaysAgo) c.jobsLast30d++;
        else if (jobTime >= t60DaysAgo && jobTime < t30DaysAgo) c.jobsPrev30d++;
      }

      skills.forEach((s) => c.skills.set(s, (c.skills.get(s) || 0) + 1));
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

    const companiesList = Array.from(companyMap.values()).map((c) => {
      const topSkills = Array.from(c.skills.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([s]) => s);

      let trend = "Steady";
      if (c.firstObservedAt >= t7DaysAgo) trend = "New This Week";
      else if (c.jobsLast7d >= 3 && c.jobsLast7d > c.jobsPrev7d * 1.5) trend = "Surging";
      else if (c.jobsLast7d > c.jobsPrev7d && c.jobsLast7d >= 2) trend = "Increasing";
      else if (c.jobsLast30d > c.jobsPrev30d && c.jobsLast30d >= 3) trend = "Active";

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
        topSkills,
        domains: Array.from(c.domains),
        trend,
        recentJobs: c.recentJobs.sort((a, b) => b.createdAt - a.createdAt),
      };
    });

    const totalAnalyzed = jobs.length || 1;
    function formatSkillsFn(freqMap) {
      return Array.from(freqMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalAnalyzed) * 100) || 1,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    }

    const payload = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAtMs: now,
      earliestObservationDate,
      totalActiveJobs: jobs.length,
      overview: {
        totalCompanies: companiesList.length,
        companiesHiring: companiesList.filter((c) => c.activeJobs > 0).length,
        newCompaniesThisWeek: companiesList.filter((c) => c.firstObservedAt >= t7DaysAgo).length,
        newCompaniesPrevWeek: companiesList.filter((c) => c.firstObservedAt >= t14DaysAgo && c.firstObservedAt < t7DaysAgo).length,
        newJobsThisWeek: jobs.filter((j) => getJobTimestampFn(j) >= t7DaysAgo).length,
        newJobsPrevWeek: jobs.filter((j) => getJobTimestampFn(j) >= t14DaysAgo && getJobTimestampFn(j) < t7DaysAgo).length,
        multiRoleCompanies: companiesList.filter((c) => c.isMultiRole).length,
      },
      risingCompanies: [...companiesList].sort((a, b) => b.jobsLast7d - a.jobsLast7d || b.activeJobs - a.activeJobs).slice(0, 24),
      newlyDiscoveredCompanies: [...companiesList].sort((a, b) => b.firstObservedAt - a.firstObservedAt).slice(0, 16),
      skills: {
        "7d": formatSkillsFn(skillFreq7d),
        "30d": formatSkillsFn(skillFreq30d),
        "90d": formatSkillsFn(skillFreq90d),
        all: formatSkillsFn(skillFreqAll),
        pairings: Array.from(skillPairingsMap.entries()).map(([pair, count]) => ({ pair, count })).sort((a, b) => b.count - a.count).slice(0, 10),
      },
      locations: Array.from(locationMap.values()).map((l) => ({ city: l.city, country: l.country, count: l.count, topCompanies: Array.from(l.companies).slice(0, 4) })).sort((a, b) => b.count - a.count).slice(0, 15),
      domains: Array.from(domainMap.entries()).map(([domain, count]) => ({ domain, count, percentage: Math.round((count / totalAnalyzed) * 100) })).sort((a, b) => b.count - a.count),
      workModes: workModeCounts,
      dailyTrends: Array.from(dailyJobCounts.keys()).sort().slice(-30).map((d) => ({ date: d, count: dailyJobCounts.get(d) })),
      dataQuality,
    };

    // 2. Persist to Firestore: hiring_radar_metadata/overview
    await db.collection("hiring_radar_metadata").doc("overview").set(payload, { merge: true });

    // 3. Batch commit top company profiles into company_analytics collection for fast O(1) detail lookups
    const BATCH_LIMIT = 400;
    const batches = [];
    let currentBatch = db.batch();
    let opCount = 0;

    for (const comp of companiesList) {
      const compRef = db.collection("company_analytics").doc(comp.slug);
      currentBatch.set(compRef, {
        ...comp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      opCount++;

      if (opCount >= BATCH_LIMIT) {
        batches.push(currentBatch.commit());
        currentBatch = db.batch();
        opCount = 0;
      }
    }
    if (opCount > 0) {
      batches.push(currentBatch.commit());
    }
    await Promise.all(batches);

    return res.status(200).json({
      success: true,
      message: `Hiring Radar analytics aggregated successfully for ${jobs.length} jobs across ${companiesList.length} companies.`,
      stats: payload.overview,
    });
  } catch (err) {
    console.error("Error in rebuildHiringRadarAnalytics:", err);
    return res.status(500).json({ error: err.message || "Internal aggregation error" });
  }
});

/**
 * 4. Public Cached Hiring Radar Overview API
 */
exports.getHiringRadarOverview = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Cache-Control", "public, max-age=300, s-maxage=600"); // 5m browser / 10m CDN cache

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    const db = admin.firestore();
    const docSnap = await db.collection("hiring_radar_metadata").doc("overview").get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Hiring Radar metadata not yet generated." });
    }
    return res.status(200).json(docSnap.data());
  } catch (err) {
    console.error("Error in getHiringRadarOverview:", err);
    return res.status(500).json({ error: "Failed to load Hiring Radar overview" });
  }
});
