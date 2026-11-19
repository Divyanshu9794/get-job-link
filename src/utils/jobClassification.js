// Indian cities, states, and regional keywords
const INDIAN_KEYWORDS = [
  "india", "bengaluru", "bangalore", "hyderabad", "pune", "mumbai", "delhi", "new delhi",
  "noida", "gurgaon", "gurugram", "chennai", "kolkata", "ahmedabad", "jaipur", "kochi",
  "cochin", "thiruvananthapuram", "trivandrum", "indore", "chandigarh", "mohali", "nagpur",
  "bhubaneswar", "coimbatore", "mysuru", "mysore", "karnataka", "maharashtra", "telangana",
  "tamil nadu", "uttar pradesh", "haryana", "in - ", "lucknow", "bhopal",
  "pan india", "secunderabad", "vijayawada", "madurai", "hosur", "telengana",
  "gandhi nagar", "gautam buddha nagar", "ind-hyderabad", "mufg global service",
  ", ind", ", in,", "bengaluru, in", "bengaluru, kn", "in - bengaluru"
];

// International / world locations
const WORLD_KEYWORDS = [
  // North America
  "usa", "united states", "canada", "new york", "san francisco", "boston",
  "california", "chicago", "seattle", "austin", "toronto", "vancouver",
  "pittsburgh", "dallas", "houston", "atlanta", "denver", "phoenix", "latam",
  "mexico", "brazil", "argentina",
  // Europe
  "uk", "united kingdom", "germany", "deutschland", "duitsland", "europe",
  "berlin", "munich", "münchen", "hamburg", "frankfurt", "cologne", "düsseldorf",
  "dortmund", "rostock", "koblenz", "aachen", "parsdorf", "barleben", "magdeburg",
  "bonn", "homeoffice", "hub - berlin",
  "london", "dublin", "ireland", "france", "paris", "netherlands", "amsterdam",
  "switzerland", "zurich", "spain", "madrid", "barcelona", "sweden", "stockholm",
  "denmark", "portugal", "italy", "poland", "greece",
  // Asia-Pacific / Middle East / Africa
  "singapore", "tokyo", "japan", "china", "vietnam", "australia", "sydney",
  "melbourne", "johannesburg", "south africa", "dubai", "uae", "israel",
  // Generic international
  "apac", "worldwide", "anywhere", "global", "international", "remote, united",
  "remote - usa", "remote, canada", "remote, uk",
];

/**
 * Checks whether a job is considered remote.
 */
export function isRemoteJob(job) {
  if (!job) return false;
  if (job.isRemote === true) return true;
  const loc = (job.location || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const type = (job.jobType || "").toLowerCase();
  const jd = (job.jd || job.description || "").slice(0, 300).toLowerCase();

  return (
    loc.includes("remote") ||
    loc.includes("anywhere") ||
    loc.includes("worldwide") ||
    loc.includes("wfh") ||
    loc.includes("work from home") ||
    type.includes("remote") ||
    title.includes("(remote)") ||
    title.includes(" - remote") ||
    jd.includes("100% remote") ||
    jd.includes("fully remote")
  );
}

/**
 * Checks whether a job is an Indian job.
 */
export function isIndiaJob(job) {
  if (!job) return false;
  const loc = (job.location || "").toLowerCase().trim();

  // If explicit world keyword and no mention of India, it is outside India
  const hasWorldKeyword = WORLD_KEYWORDS.some((kw) => loc.includes(kw));
  const hasIndiaKeyword = INDIAN_KEYWORDS.some((kw) => loc.includes(kw));

  if (hasWorldKeyword && !hasIndiaKeyword) {
    return false;
  }

  if (hasIndiaKeyword) {
    return true;
  }

  // If location is blank/undefined or generic remote/hybrid without world keyword,
  // GetJobLink by default lists Indian tech opportunities
  if (!loc || loc === "undefined" || loc === "hybrid" || loc === "remote") {
    return !hasWorldKeyword;
  }

  return false;
}

/**
 * Checks whether a job is an International / World job (outside India).
 */
export function isWorldJob(job) {
  if (!job) return false;
  const loc = (job.location || "").toLowerCase().trim();

  const hasIndiaKeyword = INDIAN_KEYWORDS.some((kw) => loc.includes(kw));
  const hasWorldKeyword = WORLD_KEYWORDS.some((kw) => loc.includes(kw));

  if (hasIndiaKeyword && !hasWorldKeyword) {
    return false;
  }

  if (hasWorldKeyword) {
    return true;
  }

  if (loc.includes("anywhere") || loc.includes("worldwide")) {
    return true;
  }

  return false;
}

/**
 * Helper to get clean initials from company name (e.g. "Google" -> "GO", "JP Morgan" -> "JM").
 */
export function getCompanyInitials(name) {
  if (!name || typeof name !== "string") return "GL";
  const clean = name.trim().replace(/[^a-zA-Z0-9 ]/g, "");
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Helper for consistent pastel/soft avatar background and text color based on company name.
 */
const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
  { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
];

export function getCompanyColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Formats a timestamp (number, date string, or Firestore Timestamp) into human-readable relative time.
 */
export function timeAgo(timestamp) {
  if (!timestamp) return "Recently";
  let date;

  if (typeof timestamp === "object" && timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "number") {
    date = new Date(timestamp);
  } else if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else {
    return "Recently";
  }

  if (isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes === 1) return "1m ago";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours === 1) return "1h ago";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Sanitizes URLs (removes dangerous tracking/malformed bits while preserving path).
 */
export function sanitizeJobUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "#";
  try {
    const trimmed = rawUrl.trim();
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return parsed.href;
  } catch {
    return rawUrl;
  }
}

/**
 * Retrieves the primary application URL for any job record.
 */
export function getApplyUrl(job) {
  if (!job) return "#";
  return sanitizeJobUrl(job.url || job.applyUrl || job.applicationUrl || "#");
}

/**
 * Retrieves the job description text.
 */
export function getJobDescription(job) {
  if (!job) return "";
  return job.jd || job.description || "No job description provided.";
}

/**
 * Extracts skills array from job.
 */
export function getJobSkills(job) {
  if (!job) return [];
  if (Array.isArray(job.skills) && job.skills.length > 0) return job.skills;
  if (Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0) return job.requiredSkills;
  if (typeof job.skills === "string") {
    return job.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
