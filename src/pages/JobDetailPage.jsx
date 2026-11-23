import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  ArrowLeft,
  Share2,
  Award,
  ShieldCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Target,
  Cpu,
  Layers,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Flag,
  Send,
  X,
} from "lucide-react";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  isRemoteJob,
  timeAgo,
  getCompanyInitials,
  getCompanyColor,
  getApplyUrl,
  getJobDescription,
  getJobSkills,
} from "../utils/jobClassification";
import {
  getRoleSpecificAtsTips,
  extractJdKeywords,
  calculateAtsMatch,
} from "../utils/atsAdvisor";
import { useAuth } from "../context/AuthContext";
import { extractPdfText } from "../utils/pdfExtractor";
import { useToast } from "../context/ToastContext";
import SEO from "../components/SEO";
import ShareJobModal from "../components/ShareJobModal";
import { calculateJobMatch } from "../utils/jobMatchEngine";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    currentUser,
    userProfile,
    isJobSaved,
    toggleSaveJob,
    saveAtsEvaluation,
  } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resume & ATS Matcher State
  const [resumeText, setResumeText] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [usingDefaultResume, setUsingDefaultResume] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Reporting modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("expired");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchJob() {
      if (!jobId) return;
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, "jobs", jobId);
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;

        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Job listing not found or no longer active.");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        if (isMounted) {
          setError("Unable to load job details. Please check your connection.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchJob();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // Automatically pre-populate user's saved default resume
  useEffect(() => {
    if (userProfile?.defaultResume?.extractedText && !resumeText) {
      setResumeText(userProfile.defaultResume.extractedText);
      setUsingDefaultResume(true);
    }
  }, [userProfile, resumeText]);

  // Handle hash scrolling (e.g. #ats-section from JobCard)
  useEffect(() => {
    if (job && window.location.hash === "#ats-section") {
      setTimeout(() => {
        const el = document.getElementById("ats-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 250);
    }
  }, [job]);

  const saved = isJobSaved(jobId);

  // Compute Job Match Intelligence against user preferences
  const jobMatch = useMemo(() => {
    if (!job) return null;
    let prefs = userProfile?.preferences;
    if (!prefs) {
      try {
        const stored = localStorage.getItem("gjl_user_preferences");
        if (stored) prefs = JSON.parse(stored);
      } catch (e) {
        console.warn("Could not read local preferences:", e);
      }
    }
    return calculateJobMatch(prefs, job);
  }, [job, userProfile]);

  const handleShare = () => {
    setShareOpen(true);
  };

  const handleToggleBookmark = async () => {
    if (!job) return;
    try {
      const isNowSaved = await toggleSaveJob(job);
      showToast(isNowSaved ? "Job saved to your bookmarks!" : "Job removed from bookmarks.");
    } catch (err) {
      showToast(err.message || "Please log in to save jobs.", "info");
    }
  };

  const scrollToAts = () => {
    const el = document.getElementById("ats-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // PDF text extraction for on-page ATS matcher
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingPdf(true);
    try {
      const text = await extractPdfText(file);
      setResumeText(text);
      setUsingDefaultResume(false);

      if (job) {
        const res = calculateAtsMatch(text, job);
        setMatchResult(res);
      }
      showToast("Resume parsed successfully!");
    } catch (err) {
      console.error("PDF extraction error:", err);
      showToast("Could not parse PDF. You can paste the text below.", "info");
    } finally {
      setExtractingPdf(false);
    }
  };

  const handleRunMatch = async () => {
    if (!resumeText.trim()) {
      showToast("Please paste your resume text or upload a PDF first.", "info");
      return;
    }
    const res = calculateAtsMatch(resumeText, job);
    setMatchResult(res);

    // Save evaluation to user profile history if authenticated
    if (currentUser && job) {
      try {
        await saveAtsEvaluation({
          jobId: job.id,
          jobTitle: job.title || "Job",
          company: job.company || "Company",
          score: res.score,
          roleName: res.roleName || "Engineering",
          matchedKeywords: res.matchedKeywords,
          missingKeywords: res.missingKeywords,
          skillsGaps: res.skillsGaps || [],
          improvements: res.improvements || [],
        });
      } catch (err) {
        console.warn("Could not save ATS evaluation history:", err);
      }
    }

    showToast(`ATS Match Calculated: ${res.score}%`);
  };

  const handleOpenFullChecker = () => {
    navigate("/ats-checker", {
      state: {
        jobTitle: job?.title || "",
        jobDescription: getJobDescription(job),
        resumeText: resumeText || "",
      },
    });
  };

  // Submit Expired / Broken Link Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!job) return;
    setSubmittingReport(true);
    try {
      await addDoc(collection(db, "reports"), {
        jobId: job.id,
        jobTitle: job.title || "",
        company: job.company || "",
        reason: reportReason,
        details: reportDetails.trim(),
        reporterEmail: currentUser?.email || "anonymous",
        createdAt: serverTimestamp(),
      });
      showToast("Report submitted. Our curation team will review it within 24 hours.");
      setReportModalOpen(false);
      setReportDetails("");
    } catch (err) {
      showToast("Error submitting report: " + err.message, "error");
    } finally {
      setSubmittingReport(false);
    }
  };

  // 4 Role-Specific ATS Tips
  const roleSpecificTips = useMemo(() => {
    if (!job) return [];
    return getRoleSpecificAtsTips(job);
  }, [job]);

  const extractedKeywords = useMemo(() => {
    if (!job) return [];
    return extractJdKeywords(job);
  }, [job]);

  const isRemote = job ? isRemoteJob(job) : false;
  const description = job ? getJobDescription(job) : "";

  // Schema.org JobPosting Structured Data
  const jobPostingJsonLd = useMemo(() => {
    if (!job) return null;
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title || "Software Engineering Role",
      description: description.replace(/<[^>]*>/g, ""),
      datePosted:
        job.date ||
        (job.createdAt
          ? new Date(
              typeof job.createdAt === "object" && job.createdAt.seconds
                ? job.createdAt.seconds * 1000
                : job.createdAt
            ).toISOString().split("T")[0]
          : "2026-01-01"),
      employmentType:
        job.jobType?.toUpperCase() === "INTERNSHIP"
          ? "INTERN"
          : job.jobType?.toUpperCase() === "CONTRACT"
          ? "CONTRACTOR"
          : "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: job.company || "Direct Employer",
        sameAs: "https://getjoblink.in",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location || "Bengaluru",
          addressCountry: "IN",
        },
      },
      jobLocationType: isRemote ? "TELECOMMUTE" : undefined,
      applicantLocationRequirements: isRemote
        ? {
            "@type": "Country",
            name: "India",
          }
        : undefined,
      directApply: true,
    };
  }, [job, description, isRemote]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-6">
        <div className="h-5 w-32 bg-slate-200 rounded-md mb-6" />
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-200 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
          <div className="h-10 bg-slate-100 rounded-xl mt-6" />
          <div className="h-64 bg-slate-50 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <SEO
          title="Job Expired or Not Found"
          description="This job listing is no longer active or has been filled by the employer."
          noIndex={true}
        />
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Job Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {error || "This job posting might have expired or been filled by the employer."}
          </p>
          <div className="pt-2">
            <Link
              to="/jobs/india"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Active Tech Jobs</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const colorScheme = getCompanyColor(job.company);
  const initials = getCompanyInitials(job.company);
  const applyUrl = getApplyUrl(job);
  const skills = getJobSkills(job);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Dynamic SEO Meta & JobPosting JSON-LD */}
      <SEO
        title={`${job.title} at ${job.company}`}
        description={`Apply directly for ${job.title} at ${job.company} (${job.location || "India"}). Direct application link, verified ATS keywords, and required skills.`}
        canonicalUrl={`/job/${job.id}`}
        ogType="article"
        jsonLd={jobPostingJsonLd}
      />

      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </button>

        {/* Quick jump to ATS Section */}
        <button
          onClick={scrollToAts}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/80 px-3.5 py-2 rounded-xl shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Check ATS Score &amp; Tips</span>
        </button>
      </div>

      {/* Main Job Card Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 mb-6 transition-colors duration-150">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start space-x-4">
            {/* Company Avatar */}
            <div
              className={`w-14 h-14 rounded-2xl ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border} border flex items-center justify-center font-black text-lg shrink-0 shadow-xs tracking-tight`}
            >
              {initials}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {job.title}
                </h1>
                {isRemote && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Remote
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{job.company}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{job.location || "India"}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Posted {timeAgo(job.createdAt || job.date)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Top Actions: Bookmark, Share, Report, ATS Score, Apply */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-xl border transition-colors shadow-2xs ${
                saved
                  ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              title={saved ? "Remove from bookmarks" : "Save this job"}
              aria-label="Bookmark Job"
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Share job link"
              aria-label="Share Job"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors shadow-2xs"
              title="Report expired or incorrect listing"
              aria-label="Report Listing"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                scrollToAts();
                if (resumeText.trim()) {
                  handleRunMatch();
                }
              }}
              className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-102"
              title="Check role-specific ATS score with your resume"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Check ATS Score</span>
            </button>
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Career Match Intelligence Banner */}
        {jobMatch && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/80 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                    jobMatch.score >= 85
                      ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                      : jobMatch.score >= 70
                      ? "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                  }`}
                >
                  ⚡ {jobMatch.percentage} Career Match
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {jobMatch.level}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {jobMatch.explanations?.[0] || "Calculated based on your target skills, role preferences, and experience level."}
              </p>
              {jobMatch.missingSkills?.length > 0 && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Skills to highlight: </span>
                  {jobMatch.missingSkills.join(", ")}
                </div>
              )}
            </div>

            <Link
              to="/for-you"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-colors shrink-0 self-start sm:self-auto"
            >
              <span>Explore My Feed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Highlights / Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs">
          <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 rounded-xl p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
              Job Type
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              {job.jobType || "Full Time"}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 rounded-xl p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
              Experience
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              {job.experience || "More than 0 year"}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 rounded-xl p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
              Compensation
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
              {job.salary || "Competitive"}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 rounded-xl p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
              Domain
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              {job.domain || "Engineering"}
            </span>
          </div>
        </div>
      </div>

      {/* Skills Section (if present) */}
      {skills.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm mb-6 transition-colors duration-150">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center space-x-2">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Required &amp; Preferred Skills</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-blue-50/70 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 font-semibold text-xs px-3 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ROLE-SPECIFIC ATS & RESUME TIPS SECTION */}
      <section
        id="ats-section"
        className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-6 space-y-6 border border-slate-800"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Role-Specific ATS Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            What this JD is Actually Filtering For
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Generic advice like &ldquo;use action verbs&rdquo; won&apos;t beat modern ATS algorithms.
            Here is the exact technical taxonomy, screening metrics, and gatekeeper rules that
            hiring parsers use for this <span className="text-amber-300 font-semibold">{job.title}</span> position at {job.company}.
          </p>
        </div>

        {/* 4 Role-Specific Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleSpecificTips.map((tip) => {
            const getIcon = () => {
              if (tip.id === 1) return <Cpu className="w-4 h-4 text-blue-400" />;
              if (tip.id === 2) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
              if (tip.id === 3) return <Target className="w-4 h-4 text-amber-400" />;
              return <Layers className="w-4 h-4 text-purple-400" />;
            };

            return (
              <div
                key={tip.id}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-2.5 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getIcon()}
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Rule #{tip.id}: {tip.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {tip.badge}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white leading-snug">
                  {tip.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {tip.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Primary JD Keywords Extracted */}
        {extractedKeywords.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Extracted ATS Keywords for this Posting ({extractedKeywords.length})</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Must appear in resume bullets</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extractedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-slate-700/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-600/70"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* On-Page Quick ATS Resume Evaluator with User Default Resume Integration */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Check Your ATS Score for this Role</span>
              </h3>
              <p className="text-xs text-slate-400">
                {userProfile?.defaultResume
                  ? "Automatically using your saved default resume. Click 'Calculate Match' to evaluate."
                  : "Upload your PDF or paste text to see your match score and missing keywords."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>{extractingPdf ? "Parsing..." : "Upload Other File"}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  disabled={extractingPdf}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleRunMatch}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                <span>Calculate Match</span>
              </button>
            </div>
          </div>

          {/* User Saved Resume Active Banner */}
          {usingDefaultResume && userProfile?.defaultResume && (
            <div className="bg-blue-950/70 border border-blue-500/40 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Using your default saved resume: <strong>{userProfile.defaultResume.fileName}</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  setResumeText("");
                  setUsingDefaultResume(false);
                }}
                className="text-[11px] text-blue-300 hover:text-white underline font-semibold"
              >
                Clear / Paste Custom
              </button>
            </div>
          )}

          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setUsingDefaultResume(false);
            }}
            placeholder="Paste your resume text here (or click Upload PDF above) to evaluate against this specific JD..."
            rows={4}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-y"
          />

          {/* Real-time Role-Wise Match Result Feedback */}
          {matchResult && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs ${
                      matchResult.score >= 75
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : matchResult.score >= 55
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    }`}
                  >
                    {matchResult.score}%
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">
                        {matchResult.score >= 75
                          ? "Strong ATS Match for this Role"
                          : matchResult.score >= 55
                          ? "Moderate Match — Action Items Below"
                          : "Needs Role Alignment & Missing Keywords"}
                      </h4>
                      <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {matchResult.roleName || "Engineering"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pt-0.5">
                      Evaluated on 4 core criteria against &ldquo;{job.title}&rdquo; at {job.company}.
                      {currentUser && " Saved to your ATS history."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenFullChecker}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 self-start sm:self-auto"
                >
                  <span>Open Full ATS Checker</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Core Evaluation Criteria Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Keyword Matching */}
                <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-300 flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      <span>1. Keyword Matching</span>
                    </span>
                    <span className="font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                      {matchResult.keywordMatch?.score ?? 70}%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {matchResult.keywordMatch?.feedback || "Matches technical skills and checks contextual usage in experience bullets."}
                  </p>
                </div>

                {/* 2. Performance & Impact */}
                <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. Performance & Impact</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      {matchResult.performanceImpact?.score ?? 65}%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {matchResult.performanceImpact?.feedback || "Detects measurable achievements (latency, throughput, scale). Never invent metrics."}
                  </p>
                </div>

                {/* 3. Technical Depth */}
                <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. Technical Depth</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                      {matchResult.technicalDepth?.score ?? 60}%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {matchResult.technicalDepth?.feedback || "Evaluates architectural concepts specific to this role category."}
                  </p>
                </div>

                {/* 4. Role Alignment */}
                <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>4. Role Alignment</span>
                    </span>
                    <span className="font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                      {matchResult.roleAlignment?.score ?? 75}%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {matchResult.roleAlignment?.feedback || "Verifies headline and experience alignment with target title."}
                  </p>
                </div>
              </div>

              {/* Matched Keywords vs Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="font-bold text-emerald-400 flex items-center space-x-1 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matched Keywords ({matchResult.matchedKeywords.length})</span>
                  </span>
                  {matchResult.matchedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {matchResult.matchedKeywords.map((k, i) => (
                        <span
                          key={i}
                          className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">No exact keywords matched yet.</span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-amber-400 flex items-center space-x-1 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing Keywords to Add ({matchResult.missingKeywords.length})</span>
                  </span>
                  {matchResult.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {matchResult.missingKeywords.slice(0, 10).map((k, i) => (
                        <span
                          key={i}
                          className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px]"
                        >
                          +{k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-emerald-400 text-[11px]">All core keywords present!</span>
                  )}
                </div>
              </div>

              {/* Skills Gaps (if any) */}
              {matchResult.skillsGaps && matchResult.skillsGaps.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-3 text-xs">
                  <span className="font-bold text-amber-300 flex items-center space-x-1 mb-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Identified Role Skills Gaps ({matchResult.skillsGaps.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.skillsGaps.map((gap, i) => (
                      <span
                        key={i}
                        className="bg-amber-500/10 text-amber-200 border border-amber-500/20 px-2.5 py-0.5 rounded text-[11px]"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Improvement Suggestions */}
              {matchResult.improvements.length > 0 && (
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Concise Improvement Suggestions:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {matchResult.improvements.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Bottom Shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <button
              onClick={handleOpenFullChecker}
              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
            >
              <span>Launch Full Gemini AI ATS Evaluator with this JD</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <Link
              to="/resume"
              className="text-slate-400 hover:text-white font-semibold inline-flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Use Free ATS Resume Builder</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Job Description Body */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 mb-6 transition-colors duration-150">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            About the Role &amp; Requirements
          </h2>
          <div className="pt-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            {description}
          </div>
        </div>

        {/* Direct Apply Guarantee Box */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <h4 className="font-bold text-emerald-950 dark:text-emerald-100">Direct Application Guarantee</h4>
            <p className="leading-relaxed">
              GetJobLink never acts as a middleman or charges application fees. The &ldquo;Apply Now&rdquo;
              button takes you directly to the verified employer&apos;s application tracking system
              (Greenhouse, Lever, Workday, or direct career portal).
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Banner */}
      <div className="bg-slate-900 dark:bg-slate-850 text-white rounded-2xl p-6 shadow-md border border-transparent dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base tracking-tight">Ready to apply at {job.company}?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your resume is optimized for this JD. Redirecting directly to the official employer portal.
          </p>
        </div>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center"
        >
          <span>Apply Now on Official Site</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* REPORT ISSUE MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Report Job Listing</h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Help us keep GetJobLink 100% clean and active. If this job is expired, filled, or broken, let our curation team know:
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Type</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="expired">Job Expired / Requisition Closed</option>
                  <option value="broken_link">Broken Apply Link (404 / Error)</option>
                  <option value="inaccurate">Inaccurate Details / Company Info</option>
                  <option value="fee_charged">Third-Party Charging Fees (Fraud Alert)</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Additional Details (Optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide any specific note or error message seen..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReport ? "Submitting..." : "Send Report"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Share Job Modal */}
      <ShareJobModal
        job={job}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
