import { normalizeSkills } from "./skills";

const SITE_URL = "https://getjoblink.in";

/**
 * Deep link to a single job listing on the live site.
 */
export function jobUrl(job) {
  const id = job?.id ? encodeURIComponent(job.id) : "";
  return id ? `${SITE_URL}/job/${id}` : SITE_URL;
}

/**
 * Build a compact, platform-safe share text block for a job listing.
 * Platforms like WhatsApp/LinkedIn/X/Facebook encode this via
 * encodeURIComponent, while clipboard operations use the raw string.
 *
 * Pass `includeLink: false` for platforms that take the link as their own
 * parameter (X, Facebook) — otherwise the link shows up twice.
 */
export function SPREAD_TEXT(job, { includeLink = true } = {}) {
  const company = job?.company || "Unknown Company";
  const title = job?.title || "Job Opening";
  const skills = normalizeSkills(job?.skills);

  const meta = [job?.jobType, job?.experience, job?.salary].filter(Boolean).join(" | ");
  const workMode = job?.isRemote ? "Remote" : (job?.domain || "On-site");

  const lines = [
    `${company} is hiring: ${title}`,
    meta ? `${meta} | ${workMode}` : workMode,
    skills.length > 0 ? `Skills: ${skills.join(", ")}` : "",
    includeLink ? `Apply: ${jobUrl(job)}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

/* Shared text as a single line — used where newlines are dropped by the platform. */
export function SPREAD_TEXT_INLINE(job, options) {
  return SPREAD_TEXT(job, options).replace(/\n/g, " · ");
}

export function shareToWhatsapp(job) {
  window.open(`https://wa.me/?text=${encodeURIComponent(SPREAD_TEXT(job))}`, "_blank", "noopener,noreferrer");
}

export function shareToLinkedin(job) {
  window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(SPREAD_TEXT(job))}`, "_blank", "noopener,noreferrer");
}

export function shareToTwitter(job) {
  const text = encodeURIComponent(SPREAD_TEXT_INLINE(job, { includeLink: false }));
  const url = encodeURIComponent(jobUrl(job));
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
}

export function shareToFacebook(job) {
  const u = encodeURIComponent(jobUrl(job));
  const quote = encodeURIComponent(SPREAD_TEXT_INLINE(job, { includeLink: false }));
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${quote}`, "_blank", "noopener,noreferrer");
}

/**
 * Copy the full share text to the clipboard.
 * Falls back to a hidden textarea when the clipboard API is unavailable
 * (older browsers, or non-secure http origins).
 */
export function copyJobText(job, onDone) {
  const text = SPREAD_TEXT(job);
  const notify = (message, ok = true) => {
    if (typeof onDone === "function") onDone(message, ok);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => notify("Job details copied to clipboard!"))
      .catch(() => notify("Could not copy. Please copy manually.", false));
    return;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    notify("Job details copied to clipboard!");
  } catch {
    notify("Could not copy. Please copy manually.", false);
  }
}
