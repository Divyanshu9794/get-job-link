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
