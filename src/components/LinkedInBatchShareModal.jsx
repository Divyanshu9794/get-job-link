import { useState, useMemo, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  X,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { formatDisplaySalary } from "../utils/jobClassification";

export default function LinkedInBatchShareModal({
  isOpen,
  onClose,
  jobs = [],
  category = "india",
  initialSelectedIds = null,
}) {
  // State for which jobs are included by ID
  const [selectedIds, setSelectedIds] = useState(() => {
    if (initialSelectedIds && initialSelectedIds.size > 0) {
      return new Set(initialSelectedIds);
    }
    // Default to top 10 jobs
    return new Set(jobs.slice(0, 10).map((j) => j.id));
  });

  const [customCount, setCustomCount] = useState("10");
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeIntro, setIncludeIntro] = useState(true);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // When modal opens or initialSelectedIds changes, sync selection
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedIds && initialSelectedIds.size > 0) {
        setSelectedIds(new Set(initialSelectedIds));
        setCustomCount(String(initialSelectedIds.size));
      } else {
        const top10 = new Set(jobs.slice(0, 10).map((j) => j.id));
        setSelectedIds(top10);
        setCustomCount(String(Math.min(10, jobs.length)));
      }
      setIsEditing(false);
    }
  }, [isOpen, initialSelectedIds, jobs]);

  // Normalize experience label
  const formatExperience = (rawExp) => {
    if (!rawExp || String(rawExp).trim().toLowerCase() === "null") return "0+ yrs";
    const exp = String(rawExp).trim();
    if (exp.toLowerCase().includes("fresher")) return "Fresher (0-1 yr)";
    if (exp.toLowerCase().includes("more than 0")) return "0-1 yr";
    if (exp.toLowerCase().includes("more than 1")) return "1+ yrs";
    if (exp.toLowerCase().includes("more than 2")) return "2+ yrs";
    if (exp.toLowerCase().includes("more than 3")) return "3+ yrs";
    if (exp.toLowerCase().includes("more than 4")) return "4+ yrs";
    return exp;
  };

  // Quick preset selection helper
  const handleSelectCount = (count) => {
    let targetJobs;
    if (count === "all") {
      targetJobs = jobs;
      setCustomCount(String(jobs.length));
    } else {
      const num = Math.max(1, Math.min(Number(count) || 1, jobs.length));
      targetJobs = jobs.slice(0, num);
      setCustomCount(String(num));
    }
    setSelectedIds(new Set(targetJobs.map((j) => j.id)));
    setIsEditing(false);
  };

  // Custom number input apply
  const handleApplyCustomCount = (e) => {
    e.preventDefault();
    const num = parseInt(customCount, 10);
    if (!isNaN(num) && num > 0) {
      handleSelectCount(num);
    }
  };

  // Toggle single job
  const handleToggleJob = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
    setCustomCount(String(next.size));
    setIsEditing(false);
  };

  // Selected jobs in chronological order of appearance
  const selectedJobsList = useMemo(() => {
    return jobs.filter((j) => selectedIds.has(j.id));
  }, [jobs, selectedIds]);

  // Generate the formatted text
  const generatedText = useMemo(() => {
    if (!selectedJobsList || selectedJobsList.length === 0) {
      return "No jobs selected. Please select at least 1 job from the controls above.";
    }

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://getjoblink.in";

    const categoryTitle =
      category === "world"
        ? "Global International Tech Positions"
        : category === "remote"
        ? "100% Remote Engineering Roles"
        : "Curated Indian Tech Openings";

    const lines = [];

    if (includeIntro) {
      lines.push(`🚀 Latest Verified Daily Tech Jobs | GetJobLink.in`);
      lines.push(`🔥 ${categoryTitle} — 100% direct company ATS links with zero recruiter spam or fees.\n`);
    }

    selectedJobsList.forEach((job, index) => {
      const num = index + 1;
      const title = job.title || "Software Engineering Role";
      const company = job.company || "Leading Tech Firm";
      const location = job.location && String(job.location).toLowerCase() !== "null" ? job.location : "India";
      const exp = formatExperience(job.experience);
      const jobUrl = `${baseUrl}/job/${job.id}`;

      lines.push(`${num}️⃣ ${title} — ${company}`);
      lines.push(`   📍 Location: ${location}`);
      lines.push(`   💼 Experience: ${exp}`);
      const displaySal = formatDisplaySalary(job.salary);
      if (displaySal) {
        lines.push(`   💰 Salary: ${displaySal}`);
      }
      lines.push(`   🔗 View Details & Apply: ${jobUrl}\n`);
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`👉 Explore 700+ verified daily tech jobs and free ATS score evaluations at: ${baseUrl}\n`);

    if (includeHashtags) {
      lines.push(
        `#Hiring #TechJobs #SoftwareEngineer #Developer #Freshers #OffCampus #JobSearch #Careers #GetJobLink`
      );
    }

    return lines.join("\n");
  }, [selectedJobsList, includeHashtags, includeIntro, category]);

  // Sync customText with generatedText whenever generatedText changes and not manually editing
  useEffect(() => {
    if (!isEditing) {
      setCustomText(generatedText);
    }
  }, [generatedText, isEditing]);

  if (!isOpen) return null;

  const currentLength = customText.length;
  const LINKEDIN_LIMIT = 3000;
  const isOverLimit = currentLength > LINKEDIN_LIMIT;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(customText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = customText;
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
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleOpenLinkedIn = () => {
    window.open("https://www.linkedin.com/feed/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  Admin LinkedIn Batch Share
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  Admin Tool
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Choose exactly how many jobs to copy with direct links to their job detail pages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shrink-0 space-y-2.5 text-xs">
          {/* Quick Preset Buttons & Custom Count */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-700">Quick Select:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[5, 10, 15, 20, "all"].map((val) => {
                const label = val === "all" ? `All (${jobs.length})` : `Top ${val}`;
                const isSelected =
                  val === "all"
                    ? selectedIds.size === jobs.length
                    : selectedIds.size === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleSelectCount(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              {/* Custom Number Input */}
              <form onSubmit={handleApplyCustomCount} className="flex items-center space-x-1 pl-1">
                <input
                  type="number"
                  min="1"
                  max={jobs.length}
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  placeholder="Custom"
                  className="w-14 h-7 px-1.5 text-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title="Enter custom number of jobs to select"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>

              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  setCustomCount("0");
                  setIsEditing(false);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
                title="Clear all selections"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Toggle Checklist Dropdown */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <button
              onClick={() => setShowJobSelector(!showJobSelector)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>{showJobSelector ? "Hide Job Picker" : `Pick Specific Jobs (${selectedIds.size} of ${jobs.length} selected)`}</span>
              {showJobSelector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Character Count Indicator */}
            <div className="flex items-center space-x-1">
              {isOverLimit ? (
                <span className="inline-flex items-center space-x-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{currentLength} / {LINKEDIN_LIMIT} chars (Exceeds limit)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{currentLength} / {LINKEDIN_LIMIT} chars (LinkedIn Safe)</span>
                </span>
              )}
            </div>
          </div>

          {/* Collapsible Job Checklist */}
          {showJobSelector && (
            <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 bg-white rounded-xl border border-slate-200 text-xs">
              {jobs.map((job, idx) => {
                const isChecked = selectedIds.has(job.id);
                return (
                  <label
                    key={job.id}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? "bg-blue-50/70 text-blue-900 font-semibold" : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleJob(job.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 shrink-0"
                      />
                      <span className="text-slate-400 font-mono text-[11px]">#{idx + 1}</span>
                      <span className="truncate">{job.title}</span>
                      <span className="text-slate-400 truncate">• {job.company}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {job.location || "India"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Post Options */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={includeIntro}
                  onChange={(e) => {
                    setIncludeIntro(e.target.checked);
                    setIsEditing(false);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Include Intro Header</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => {
                    setIncludeHashtags(e.target.checked);
                    setIsEditing(false);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Include Hashtags</span>
              </label>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {selectedIds.size} job{selectedIds.size === 1 ? "" : "s"} included in post
            </div>
          </div>
        </div>

        {/* Textarea Preview */}
        <div className="flex-1 min-h-[200px] flex flex-col space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Live Post Preview (Editable):</span>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCustomText(generatedText);
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                Reset to Generated Text
              </button>
            )}
          </div>
          <textarea
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setIsEditing(true);
            }}
            rows={9}
            className="w-full flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none selection:bg-blue-100"
            placeholder="Formatted jobs will appear here..."
          />
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100 shrink-0">
          <div className="text-[11px] text-slate-400">
            Click copy, then paste directly into your LinkedIn post creator.
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleOpenLinkedIn}
              title="Open LinkedIn in new tab"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <span>Open LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={handleCopy}
              disabled={selectedIds.size === 0}
              className={`inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                copied
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
