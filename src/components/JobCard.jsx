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
  Share2,
} from "lucide-react";
import {
  isRemoteJob,
  timeAgo,
  getCompanyInitials,
  getCompanyColor,
  getApplyUrl,
  formatDisplaySalary,
} from "../utils/jobClassification";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ShareJobModal from "./ShareJobModal";

export default function JobCard({
  job,
  isAdmin = false,
  isSelected = false,
  onToggleSelect = null,
}) {
  const navigate = useNavigate();
  const { isJobSaved, toggleSaveJob } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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
    if (!val || typeof val === "object") return false;
    const str = String(val).trim().toLowerCase();
    if (str.startsWith("{") || str.startsWith("[") || str.includes("@type")) return false;
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
      className={`group relative bg-white dark:bg-slate-900 border ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/10 dark:bg-blue-950/20 shadow-xs"
          : "border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md dark:hover:shadow-slate-950/50"
      } rounded-xl p-3 sm:p-3.5 transition-all duration-150 flex items-center justify-between cursor-pointer w-full min-h-[82px] select-none`}
    >
      {/* Left: Checkbox (Admin Only) + Company Avatar & Job Info */}
      <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
        {isAdmin && onToggleSelect && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(job.id);
            }}
            className="p-1 -ml-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
            title={isSelected ? "Deselect job" : "Select job for LinkedIn share"}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
            />
          </div>
        )}

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
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors leading-snug tracking-tight hover:underline"
            >
              {job.title}
            </Link>

            {isRemote && (
              <span className="shrink-0 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 text-[10px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                Remote
              </span>
            )}
          </div>

          {/* Row 2: Company • Location */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px] sm:max-w-[160px]">
              {job.company || "Company"}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[120px] sm:max-w-[180px]">
              <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{job.location || "India"}</span>
            </span>
          </div>

          {/* Row 3: Metadata Badges (Type, Experience, Salary, ATS) */}
          <div className="flex items-center space-x-1.5 mt-1 text-[10px]">
            {isValidBadge(job.jobType) && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-1.5 py-0.5 rounded">
                {String(job.jobType).trim()}
              </span>
            )}
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-1.5 py-0.5 rounded">
              {displayExperience()}
            </span>
            {formatDisplaySalary(job.salary) && (
              <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded hidden sm:inline-block truncate max-w-[90px]">
                {formatDisplaySalary(job.salary)}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/job/${job.id}#ats-section`);
              }}
              title="View role-specific ATS keywords & resume screening tips"
              className="inline-flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/90 dark:border-amber-800/80 font-bold px-1.5 py-0.5 rounded transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>ATS Tips</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Posted Date & Direct Apply Action */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-1">
        <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap flex items-center space-x-1">
          <Clock className="w-3 h-3 text-slate-300 dark:text-slate-600 hidden sm:inline" />
          <span>{timeAgo(job.createdAt || job.date)}</span>
        </span>

        <div className="flex items-center space-x-1 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShareOpen(true);
            }}
            title="Share opportunity"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            aria-label="Share Job"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyLink}
            title={copied ? "Copied!" : "Copy link (Shift+Click to copy full post text)"}
            className={`p-1.5 rounded-lg transition-colors ${
              copied
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                : "text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            }`}
            aria-label="Copy link to job details"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Link2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={handleToggleBookmark}
            title={saved ? "Remove from saved jobs" : "Save job"}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                : "text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            }`}
            aria-label={saved ? "Unsave Job" : "Save Job"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" : ""}`} />
          </button>
          <button
            onClick={handleDirectApply}
            title="Apply directly on employer site"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            aria-label="Direct Apply"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Share Job Modal */}
      <ShareJobModal
        job={job}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
