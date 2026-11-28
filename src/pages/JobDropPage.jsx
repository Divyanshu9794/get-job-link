import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
  Zap,
  Clock,
  Share2,
  Check,
  Building2,
  Globe,
  GraduationCap,
  ChevronRight,
  Flame,
} from "lucide-react";
import { db } from "../firebase";
import JobCard from "../components/JobCard";
import SEO from "../components/SEO";
import { computeDailyJobDrop } from "../utils/careerIntelligence";
import { useToast } from "../context/ToastContext";

export default function JobDropPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all"); // "all" | "freshers" | "remote" | "companies"
  const [copied, setCopied] = useState(false);
  const [timeUntilNextDrop, setTimeUntilNextDrop] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { showToast } = useToast();

  // Next drop countdown calculation (Daily drop updates at 00:00 UTC / 05:30 AM IST)
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const nextDrop = new Date(now);
      nextDrop.setUTCHours(24, 0, 0, 0); // Next 00:00 UTC
      const diffMs = Math.max(0, nextDrop.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilNextDrop({ hours, minutes, seconds });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch verified opportunities from Firestore
  useEffect(() => {
    let isMounted = true;
    async function fetchDropData() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "jobs"),
          where("createdAt", ">=", 0),
          orderBy("createdAt", "desc"),
          limit(160)
        );
        const snap = await getDocs(q);
        const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) {
          setJobs(records);
        }
      } catch (err) {
        console.error("Failed to load daily drop jobs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDropData();
    return () => {
      isMounted = false;
    };
  }, []);

  const dropAnalytics = useMemo(() => {
    return computeDailyJobDrop(jobs);
  }, [jobs]);

  const displayedJobs = useMemo(() => {
    if (selectedTab === "freshers") return dropAnalytics.fresherJobs;
    if (selectedTab === "remote") return dropAnalytics.remoteJobs;
    return dropAnalytics.jobs;
  }, [selectedTab, dropAnalytics]);

  const handleShareDrop = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `GetJobLink Daily Tech Drop - ${dropAnalytics.totalDropCount} Verified Openings`,
          text: `Check out today's curated technology job drop with verified ATS applications!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        showToast("Drop link copied to clipboard!", "success");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // User cancelled or clipboard denied
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Daily Tech Job Drop - Curated Verified Openings | GetJobLink"
        description="Explore today's curated tech job drop. Handpicked engineering, AI, backend, and fresher opportunities verified from direct company ATS portals."
        canonicalUrl="https://getjoblink.in/job-drops"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Daily Job Drop</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span>Curated Opportunity Drop • {dropAnalytics.dropDate}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Today&apos;s Tech <span className="text-blue-600 dark:text-blue-400">Job Drop</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Fresh direct ATS technology roles verified and curated within the current 24-hour cycle. Zero recruiter spam, direct application URLs, and guaranteed authentic career portal links.
              </p>
            </div>

            {/* Next Drop Countdown Box */}
            <div className="bg-slate-900 text-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between min-w-[280px]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center space-x-1.5 font-semibold text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Next Drop Refresh</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">00:00 UTC</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2">
                <div className="bg-slate-800/80 rounded-xl py-2 px-1 border border-slate-700/50">
                  <div className="text-2xl font-black font-mono text-white tracking-tight">
                    {String(timeUntilNextDrop.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Hours</div>
                </div>
                <div className="bg-slate-800/80 rounded-xl py-2 px-1 border border-slate-700/50">
                  <div className="text-2xl font-black font-mono text-white tracking-tight">
                    {String(timeUntilNextDrop.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Minutes</div>
                </div>
                <div className="bg-slate-800/80 rounded-xl py-2 px-1 border border-slate-700/50">
                  <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
                    {String(timeUntilNextDrop.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Seconds</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center mt-2">
                Curated drop refresh timer (applications stay open on company portals)
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
                <Zap className="w-3.5 h-3.5" />
                <span>{dropAnalytics.totalDropCount} Handpicked In Drop</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{dropAnalytics.fresherJobs.length} Fresher-Friendly</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60">
                <Globe className="w-3.5 h-3.5" />
                <span>{dropAnalytics.remoteJobs.length} Remote Openings</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleShareDrop}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Share Drop"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedTab === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Drop Openings ({dropAnalytics.totalDropCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("freshers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedTab === "freshers"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            🎓 Fresher & Intern ({dropAnalytics.fresherJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("remote")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedTab === "remote"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            🌍 100% Remote ({dropAnalytics.remoteJobs.length})
          </button>
        </div>

        {/* Top Hiring Companies Strip */}
        {dropAnalytics.topHiringCompanies.length > 0 && (
          <div className="mb-8 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Companies In Today&apos;s Drop</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Multiple openings active</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dropAnalytics.topHiringCompanies.map((c) => (
                <div
                  key={c.name}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded-full">
                    {c.count} {c.count === 1 ? "role" : "roles"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Listings Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6"
              />
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Zap className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No jobs found in this category</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Switch tabs or check back during the next drop refresh.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
