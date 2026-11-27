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

/**
 * Normalizes and extracts timestamp in milliseconds from any job object format.
 */
export function getJobTimestamp(job) {
  if (!job) return null;
  const raw = job.createdAt || job.date || job.fetchedAt;
  if (!raw) return null;
  if (typeof raw === "object") {
    if (typeof raw.toMillis === "function") return raw.toMillis();
    if (typeof raw.toDate === "function") return raw.toDate().getTime();
    if (typeof raw.seconds === "number") {
      return raw.seconds * 1000 + (raw.nanoseconds ? Math.floor(raw.nanoseconds / 1000000) : 0);
    }
  }
  if (typeof raw === "number") {
    return raw;
  }
  if (typeof raw === "string") {
    if (/^\d{10,13}$/.test(raw.trim())) {
      const num = parseInt(raw.trim(), 10);
      return num < 10000000000 ? num * 1000 : num;
    }
    const parsed = new Date(raw).getTime();
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Checks whether an experience string denotes a fresher / entry-level / intern position.
 */
export function isFresherExperience(rawExp) {
  if (!rawExp) return false;
  const exp = String(rawExp).toLowerCase().trim();
  return (
    exp.includes("fresher") ||
    exp.includes("intern") ||
    exp.includes("0 - 1") ||
    exp.includes("0-1") ||
    exp.includes("0 to 1") ||
    exp.includes("0 year") ||
    exp.includes("0 yr") ||
    exp.includes("more than 0") ||
    exp === "0+ yrs" ||
    exp === "0 yrs"
  );
}

/**
 * Checks whether a job's experience level matches an experience filter value.
 * Valid filter values: "fresher", "1-3", "3-5", "5+".
 */
export function matchesExperienceFilter(rawExp, filterValue) {
  if (!filterValue) return true;
  if (!rawExp) return false;

  const exp = String(rawExp).toLowerCase().trim();
  const fresher = isFresherExperience(exp);

  if (filterValue === "fresher") {
    return fresher || exp.includes("entry") || exp.includes("trainee") || exp.includes("apprentice");
  }

  // Fresher jobs must NOT leak into experienced brackets (1-3, 3-5, 5+)
  if (fresher) {
    return false;
  }

  if (filterValue === "1-3") {
    if (exp.includes("more than 4") || exp.includes("more than 3") || exp.includes("5+") || exp.includes("senior")) {
      return false;
    }
    return (
      exp.includes("1 - 2") ||
      exp.includes("1-2") ||
      exp.includes("1 to 2") ||
      exp.includes("1 - 3") ||
      exp.includes("1-3") ||
      exp.includes("1 to 3") ||
      exp.includes("2 - 3") ||
      exp.includes("2-3") ||
      exp.includes("2 to 3") ||
      exp.includes("2 - 4") ||
      exp.includes("2-4") ||
      exp.includes("more than 1") ||
      exp.includes("more than 2") ||
      exp.includes("1+ yr") ||
      exp.includes("2+ yr") ||
      exp.includes("1+ year") ||
      exp.includes("2+ year") ||
      exp.includes("junior") ||
      exp.includes("associate") ||
      /\b[12]\s*(\+|-|to)?\s*(yrs?|years?)\b/i.test(exp)
    );
  }

  if (filterValue === "3-5") {
    if (exp.includes("more than 5") || exp.includes("6+") || exp.includes("7+")) {
      return false;
    }
    return (
      exp.includes("3 - 4") ||
      exp.includes("3-4") ||
      exp.includes("3 to 4") ||
      exp.includes("3 - 5") ||
      exp.includes("3-5") ||
      exp.includes("3 to 5") ||
      exp.includes("2 - 4") ||
      exp.includes("2-4") ||
      exp.includes("4 - 5") ||
      exp.includes("4-5") ||
      exp.includes("more than 3") ||
      exp.includes("3+ yr") ||
      exp.includes("4+ yr") ||
      exp.includes("3+ year") ||
      exp.includes("4+ year") ||
      exp.includes("mid") ||
      /\b[34]\s*(\+|-|to)?\s*(yrs?|years?)\b/i.test(exp)
    );
  }

  if (filterValue === "5+") {
    return (
      exp.includes("more than 4") ||
      exp.includes("more than 5") ||
      exp.includes("5+") ||
      exp.includes("6+") ||
      exp.includes("7+") ||
      exp.includes("8+") ||
      exp.includes("5 -") ||
      exp.includes("5-") ||
      exp.includes("senior") ||
      exp.includes("lead") ||
      exp.includes("staff") ||
      exp.includes("principal") ||
      exp.includes("architect") ||
      /\b([5-9]|1[0-9])\s*(\+|-|to)?\s*(yrs?|years?)\b/i.test(exp)
    );
  }

  return true;
}

/**
 * Cleans and formats salary text for display, stripping raw schema.org JSON strings.
 */
export function formatDisplaySalary(rawSalary) {
  if (!rawSalary) return "";
  if (typeof rawSalary === "object") {
    try {
      const qVal = rawSalary.value || {};
      const min = qVal.minValue || rawSalary.minValue || qVal.value || rawSalary.value;
      const max = qVal.maxValue || rawSalary.maxValue;
      const unit = qVal.unitText || rawSalary.unitText || "";

      let curSymbol = rawSalary.currency || "";
      if (curSymbol === "INR") curSymbol = "₹";
      else if (curSymbol === "USD") curSymbol = "$";
      else if (curSymbol === "EUR") curSymbol = "€";
      else if (curSymbol === "GBP") curSymbol = "£";
      else if (curSymbol === "PHP") curSymbol = "₱";

      const formatNum = (n) => {
        const num = Number(n);
        if (isNaN(num)) return n;
        if (curSymbol === "₹" && num >= 100000) {
          const lpa = num / 100000;
          return `${Number(lpa.toFixed(1))} LPA`;
        }
        if (num >= 1000000) {
          return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
          return `${(num / 1000).toFixed(0)}k`;
        }
        return num.toLocaleString();
      };

      if (min && max && min !== max) {
        if (curSymbol === "₹" && Number(min) >= 100000) {
          return `₹${formatNum(min)} - ₹${formatNum(max)}`;
        }
        const suffix = unit.toLowerCase().includes("year")
          ? " /yr"
          : unit.toLowerCase().includes("month")
          ? " /mo"
          : unit.toLowerCase().includes("hour")
          ? " /hr"
          : "";
        return `${curSymbol}${formatNum(min)} - ${curSymbol}${formatNum(max)}${suffix}`;
      } else if (min) {
        const suffix = unit.toLowerCase().includes("year")
          ? " /yr"
          : unit.toLowerCase().includes("month")
          ? " /mo"
          : unit.toLowerCase().includes("hour")
          ? " /hr"
          : "";
        return `${curSymbol}${formatNum(min)}${suffix}`;
      }
    } catch {
      return "";
    }
  }

  const str = String(rawSalary).trim();
  if (str.startsWith("{") || str.startsWith("[") || str.includes("@type")) {
    try {
      const parsed = JSON.parse(str);
      return formatDisplaySalary(parsed);
    } catch {
      return "";
    }
  }

  const lower = str.toLowerCase();
  if (
    lower.includes("undefined") ||
    lower.includes("null") ||
    lower.includes("nan") ||
    lower === "not disclosed" ||
    lower === "competitive" ||
    lower === "n/a"
  ) {
    return "";
  }
  return str;
}

