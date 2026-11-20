import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Bookmark,
  Link2,
  Check,
} from "lucide-react";
import {
  isRemoteJob,
  timeAgo,
  getCompanyInitials,
  getCompanyColor,
  getApplyUrl,
} from "../utils/jobClassification";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const { isJobSaved, toggleSaveJob } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const isRemote = isRemoteJob(job);
  const colorScheme = getCompanyColor(job.company);
  const initials = getCompanyInitials(job.company);
  const applyUrl = getApplyUrl(job);
  const saved = isJobSaved(job.id);

  const handleCardClick = () => {
    navigate(`/job/${job.id}`);
  };

  const handleDirectApply = (e) => {
    e.stopPropagation();
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    try {
      const isNowSaved = await toggleSaveJob(job);
      showToast(isNowSaved ? "Job saved to your bookmarks!" : "Job removed from bookmarks.");
    } catch (err) {
      showToast(err.message || "Please log in to save jobs.", "info");
    }
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/job/${job.id}`;
    const textToCopy = e.shiftKey
      ? `🔥 Hiring: ${job.title} at ${job.company}\n📍 Location: ${job.location || "India"}\n💼 Experience: ${displayExperience()}\n🔗 Apply & View Details: ${url}`
      : url;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      showToast(e.shiftKey ? "Full job details copied for sharing!" : "Job link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      showToast("Failed to copy link", "error");
    }
  };

  const isValidBadge = (val) => {
    if (!val) return false;
    const str = String(val).trim().toLowerCase();
    return str !== "" && str !== "null" && str !== "undefined" && str !== "not disclosed" && str !== "competitive" && str !== "n/a";
  };

  // Format experience string for compact display
  const displayExperience = () => {
    const rawExp = job.experience;
    if (!rawExp || String(rawExp).trim().toLowerCase() === "null" || String(rawExp).trim().toLowerCase() === "undefined") {
      return "0+ yrs";
    }
    const exp = String(rawExp).trim();
    if (exp.toLowerCase().includes("fresher")) return "Fresher";
    if (exp.toLowerCase().includes("more than 0")) return "0-1 yr";
    if (exp.toLowerCase().includes("more than 1")) return "1+ yrs";
    if (exp.toLowerCase().includes("more than 2")) return "2+ yrs";
    if (exp.toLowerCase().includes("more than 3")) return "3+ yrs";
    if (exp.toLowerCase().includes("more than 4")) return "4+ yrs";
    return exp.length > 14 ? exp.slice(0, 12) + "…" : exp;
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="group relative bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md rounded-xl p-3 sm:p-3.5 transition-all duration-150 flex items-center justify-between cursor-pointer w-full min-h-[82px] select-none"
    >
      {/* Left: Company Avatar & Job Info */}
      <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
        {/* Company Avatar / Logo */}
        <div
          className={`w-11 h-11 rounded-xl ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border} border flex items-center justify-center font-black text-xs shrink-0 shadow-xs tracking-tight`}
        >
          {initials}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          {/* Row 1: Title + Remote Tag */}
          <div className="flex items-center space-x-2">
            <Link
              to={`/job/${job.id}`}
              onClick={(e) => e.stopPropagation()}
              title={job.title}
              className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors leading-snug tracking-tight hover:underline"
            >
              {job.title}
            </Link>

            {isRemote && (
              <span className="shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                Remote
              </span>
            )}
          </div>

          {/* Row 2: Company • Location */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5 truncate">
            <span className="font-semibold text-slate-700 truncate max-w-[130px] sm:max-w-[160px]">
              {job.company || "Company"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1 text-slate-500 text-[11px] truncate max-w-[120px] sm:max-w-[180px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{job.location || "India"}</span>
            </span>
          </div>

          {/* Row 3: Metadata Badges (Type, Experience, Salary, ATS) */}
          <div className="flex items-center space-x-1.5 mt-1 text-[10px]">
            {isValidBadge(job.jobType) && (
              <span className="bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                {String(job.jobType).trim()}
              </span>
            )}
            <span className="bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
              {displayExperience()}
            </span>
            {isValidBadge(job.salary) && (
              <span className="bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded hidden sm:inline-block truncate max-w-[90px]">
                {String(job.salary).trim()}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/job/${job.id}#ats-section`);
              }}
              title="View role-specific ATS keywords & resume screening tips"
              className="inline-flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 font-bold px-1.5 py-0.5 rounded transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              <span>ATS Tips</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Posted Date & Direct Apply Action */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-1">
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium whitespace-nowrap flex items-center space-x-1">
          <Clock className="w-3 h-3 text-slate-300 hidden sm:inline" />
          <span>{timeAgo(job.createdAt || job.date)}</span>
        </span>

        <div className="flex items-center space-x-1 mt-auto">
          <button
            onClick={handleCopyLink}
            title={copied ? "Copied!" : "Copy link (Shift+Click to copy full post text)"}
            className={`p-1.5 rounded-lg transition-colors ${
              copied
                ? "text-emerald-600 bg-emerald-50"
                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            }`}
            aria-label="Copy link to job details"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Link2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={handleToggleBookmark}
            title={saved ? "Remove from saved jobs" : "Save job"}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? "text-blue-600 bg-blue-50"
                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            }`}
            aria-label={saved ? "Unsave Job" : "Save Job"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-blue-600 text-blue-600" : ""}`} />
          </button>
          <button
            onClick={handleDirectApply}
            title="Apply directly on employer site"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Direct Apply"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
