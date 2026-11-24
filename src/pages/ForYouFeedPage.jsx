import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import {
  Sparkles,
  SlidersHorizontal,
  Compass,
  Flame,
  Laptop,
  GraduationCap,
  Target,
  Search,
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { calculateJobMatch } from "../utils/jobMatchEngine";
import { extractSkillsFromText } from "../utils/jobFetchEngine";
import JobCard from "../components/JobCard";
import PreferencesModal from "../components/PreferencesModal";
import SEO from "../components/SEO";

export default function ForYouFeedPage() {
  const { userProfile } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recommended"); // "recommended" | "new" | "skills" | "fresher" | "remote"
  const [searchTerm, setSearchTerm] = useState("");

  // Last visit tracking
  const [lastVisitTimestamp] = useState(() => {
    try {
      const stored = localStorage.getItem("gjl_last_visit_time");
      return stored ? parseInt(stored, 10) : Date.now() - 7 * 86400000;
    } catch {
      return Date.now() - 7 * 86400000;
    }
  });

  // Load preferences from profile, local storage, or auto-extract from uploaded resume
  useEffect(() => {
    let prefs = userProfile?.preferences;
    if (!prefs) {
      try {
        const stored = localStorage.getItem("gjl_user_preferences");
        if (stored) prefs = JSON.parse(stored);
      } catch (e) {
        console.warn("Could not parse local preferences:", e);
      }
    }

    // If no manual preferences are set yet, but candidate has uploaded a resume to their profile:
    if ((!prefs || !prefs.skills?.length) && userProfile?.defaultResume?.extractedText) {
      const resumeSkills = extractSkillsFromText(userProfile.defaultResume.extractedText);
      if (resumeSkills.length > 0) {
        prefs = {
          preferredRoles: prefs?.preferredRoles || [],
          skills: resumeSkills,
          experienceLevel: prefs?.experienceLevel || "Fresher (0 - 1 Years)",
          workMode: prefs?.workMode || "Any",
          preferredLocations: prefs?.preferredLocations || [],
          fromResume: true,
        };
      }
    }

    setPreferences(prefs || null);

    const handlePrefBroadcast = (e) => {
      if (e.detail) {
        setPreferences(e.detail);
      }
    };
    window.addEventListener("gjl_preferences_updated", handlePrefBroadcast);

    // Update last visit timestamp in localStorage on leave
    return () => {
      window.removeEventListener("gjl_preferences_updated", handlePrefBroadcast);
      try {
        localStorage.setItem("gjl_last_visit_time", String(Date.now()));
      } catch (e) {
        console.warn("Could not save visit timestamp:", e);
      }
    };
  }, [userProfile]);

  // Fetch recent active jobs from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      setLoading(true);
      try {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(120));
        const snap = await getDocs(q);
        if (!isMounted) return;

        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobs(list);
      } catch (err) {
        console.error("Error fetching jobs for For-You feed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Match Intelligence for every job against active preferences
  const jobsWithMatches = useMemo(() => {
    return jobs.map((job) => {
      const match = calculateJobMatch(preferences, job);
      return { ...job, matchIntelligence: match };
    });
  }, [jobs, preferences]);

  // Filter & partition into tailored feeds
  const categorizedFeeds = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = jobsWithMatches.filter((job) => {
      if (!term) return true;
      const title = (job.title || "").toLowerCase();
      const comp = (job.company || "").toLowerCase();
      const loc = (job.location || "").toLowerCase();
      const skills = (job.skills || "").toLowerCase();
      return title.includes(term) || comp.includes(term) || loc.includes(term) || skills.includes(term);
    });

    // 1. Recommended: Sorted by highest match score
    const recommended = [...filtered].sort(
      (a, b) => b.matchIntelligence.score - a.matchIntelligence.score
    );

    // 2. New Since Last Visit
    const newSinceVisit = filtered.filter((job) => {
      const t = job.createdAt?.seconds ? job.createdAt.seconds * 1000 : new Date(job.createdAt || job.date).getTime();
      return t > lastVisitTimestamp;
    });

    // 3. Best Skill Matches: At least 2 matching skills
    const bestSkills = [...filtered]
      .filter((j) => j.matchIntelligence.matchedSkills.length > 0)
      .sort((a, b) => b.matchIntelligence.matchedSkills.length - a.matchIntelligence.matchedSkills.length);

    // 4. Fresher Opportunities
    const freshers = filtered.filter((job) => {
      const exp = (job.experience || "").toLowerCase();
      const title = (job.title || "").toLowerCase();
      return exp.includes("fresher") || exp.includes("0") || exp.includes("intern") || title.includes("intern");
    });

    // 5. Remote Opportunities
    const remotes = filtered.filter(
      (job) => job.isRemote === true || (job.location || "").toLowerCase().includes("remote")
    );

    return {
      recommended,
      newSinceVisit,
      bestSkills,
      freshers,
      remotes,
    };
  }, [jobsWithMatches, searchTerm, lastVisitTimestamp]);

  const currentDisplayList = useMemo(() => {
    switch (activeTab) {
      case "new":
        return categorizedFeeds.newSinceVisit;
      case "skills":
        return categorizedFeeds.bestSkills;
      case "fresher":
        return categorizedFeeds.freshers;
      case "remote":
        return categorizedFeeds.remotes;
      default:
        return categorizedFeeds.recommended;
    }
  }, [activeTab, categorizedFeeds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SEO
        title="For You: Personalized Tech Job Feed"
        description="Personalized tech job recommendations tailored to your skills, experience level, and preferred roles. 100% verified direct links with transparent match scores."
        canonicalUrl="/for-you"
      />

      {/* Hero Preferences Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold bg-white/10 border border-white/20 text-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Personalized Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              For You: Verified Career Matches
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Curated daily openings scored against your target tech roles, skills, and work preferences.
              Zero recruiter intermediaries, zero sponsored ads.
            </p>

            {/* Current Preferences Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {preferences?.fromResume ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-lg flex items-center space-x-1">
                    <span>📄 Extracted from Resume:</span>
                    <span className="font-normal text-white">{preferences.skills?.slice(0, 4).join(", ")}</span>
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">
                    Click &quot;Customize Preferences&quot; to fine-tune roles &amp; locations!
                  </span>
                </div>
              ) : preferences?.preferredRoles && preferences.preferredRoles.length > 0 ? (
                preferences.preferredRoles.map((r) => (
                  <span
                    key={r}
                    className="text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-lg"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-xs text-amber-300 font-semibold">
                  No roles selected yet. Click &quot;Customize Preferences&quot; to configure your stack!
                </span>
              )}
              {preferences?.experienceLevel && (
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-lg">
                  {preferences.experienceLevel}
                </span>
              )}
              {preferences?.workMode && preferences.workMode !== "Any" && (
                <span className="text-[11px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2.5 py-0.5 rounded-lg">
                  {preferences.workMode}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setPrefModalOpen(true)}
            className="self-start md:self-auto inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Customize Preferences</span>
          </button>
        </div>
      </div>

      {/* Feed Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        {/* Sub-section tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "recommended"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Recommended ({categorizedFeeds.recommended.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "new"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>New Since Visit ({categorizedFeeds.newSinceVisit.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "skills"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Best Skill Matches ({categorizedFeeds.bestSkills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("fresher")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "fresher"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Fresher ({categorizedFeeds.freshers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("remote")}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "remote"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-500" />
            <span>Remote ({categorizedFeeds.remotes.length})</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within your matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Main List Rendering */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : currentDisplayList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              No matching jobs in this tab
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {searchTerm
                ? `No roles matched your search &quot;${searchTerm}&quot;. Try broadening your keyword.`
                : "No listings currently match this specific filter. You can adjust your career preferences to widen your scope."}
            </p>
          </div>
          <button
            onClick={() => setPrefModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Adjust Career Preferences</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentDisplayList.map((job) => {
            const match = job.matchIntelligence;
            return (
              <div key={job.id} className="relative group">
                {/* Match intelligence banner tag */}
                {match && (
                  <div className="mb-1 flex flex-wrap items-center justify-between text-[11px] px-2 py-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-black px-2 py-0.5 rounded-md border ${
                          match.score >= 85
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : match.score >= 70
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        ⚡ {match.percentage} Match
                      </span>
                      {match.explanations?.[0] && (
                        <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                          • {match.explanations[0]}
                        </span>
                      )}
                    </div>

                    {match.matchedSkills?.length > 0 && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold hidden md:inline">
                        Matched: {match.matchedSkills.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>
                )}

                <JobCard job={job} />
              </div>
            );
          })}
        </div>
      )}

      {/* Preferences Customizer Modal */}
      <PreferencesModal
        isOpen={prefModalOpen}
        onClose={() => setPrefModalOpen(false)}
        onSaved={(newPrefs) => setPreferences(newPrefs)}
      />
    </div>
  );
}
