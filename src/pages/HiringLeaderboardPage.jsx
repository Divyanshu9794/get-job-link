import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
  Trophy,
  ChevronRight,
  ArrowRight,
  Search,
} from "lucide-react";
import { db } from "../firebase";
import SEO from "../components/SEO";
import { isRemoteJob, isFresherJob } from "../utils/jobClassification";
import { classifyJobDomain, TECH_DOMAINS } from "../utils/careerIntelligence";

export default function HiringLeaderboardPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [leaderboardTab, setLeaderboardTab] = useState("volume"); // "volume" | "freshers" | "remote" | "domains"

  useEffect(() => {
    let isMounted = true;
    async function loadLeaderboardJobs() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "jobs"),
          where("createdAt", ">=", 0),
          orderBy("createdAt", "desc"),
          limit(250)
        );
        const snap = await getDocs(q);
        const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) setJobs(records);
      } catch (err) {
        console.error("Failed to load leaderboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLeaderboardJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute leaderboard analytics
  const analytics = useMemo(() => {
    const companyStats = {};
    const domainStats = {};

    jobs.forEach((job) => {
      const company = job.company?.trim() || "Verified Tech Co";
      if (!companyStats[company]) {
        companyStats[company] = {
          company,
          totalJobs: 0,
          fresherCount: 0,
          remoteCount: 0,
          domains: new Set(),
          sampleRoles: [],
        };
      }

      companyStats[company].totalJobs++;
      if (isFresherJob(job)) companyStats[company].fresherCount++;
      if (isRemoteJob(job)) companyStats[company].remoteCount++;

      const domain = classifyJobDomain(job);
      companyStats[company].domains.add(domain);
      if (companyStats[company].sampleRoles.length < 3) {
        companyStats[company].sampleRoles.push(job.title);
      }

      // Domain analytics
      domainStats[domain] = (domainStats[domain] || 0) + 1;
    });

    const companyList = Object.values(companyStats);

    const byVolume = [...companyList].sort((a, b) => b.totalJobs - a.totalJobs);
    const byFreshers = [...companyList].filter((c) => c.fresherCount > 0).sort((a, b) => b.fresherCount - a.fresherCount);
    const byRemote = [...companyList].filter((c) => c.remoteCount > 0).sort((a, b) => b.remoteCount - a.remoteCount);

    const domainRankings = Object.entries(domainStats)
      .map(([domainId, count]) => {
        const info = TECH_DOMAINS[domainId] || { name: domainId, desc: "" };
        return { id: domainId, name: info.name, count, desc: info.desc };
      })
      .sort((a, b) => b.count - a.count);

    return {
      totalRecordsAnalyzed: jobs.length,
      totalCompanies: companyList.length,
      byVolume,
      byFreshers,
      byRemote,
      domainRankings,
    };
  }, [jobs]);

  const displayedCompanies = useMemo(() => {
    let list = [];
    if (leaderboardTab === "volume") list = analytics.byVolume;
    else if (leaderboardTab === "freshers") list = analytics.byFreshers;
    else if (leaderboardTab === "remote") list = analytics.byRemote;

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      return list.filter((c) => c.company.toLowerCase().includes(q));
    }
    return list;
  }, [leaderboardTab, analytics, filterQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Tech Hiring Wave Leaderboard - Top Verified Hiring Companies | GetJobLink"
        description="Live hiring leaderboard: discover which technology companies are publishing the most verified job openings, fresher roles, and remote software positions."
        canonicalUrl="https://getjoblink.in/hiring-leaderboard"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Hiring Leaderboard</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Market Velocity • Real-Time Firestore Index</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Tech Hiring Wave <span className="text-blue-600 dark:text-blue-400">Leaderboard</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Aggregated from {analytics.totalRecordsAnalyzed} verified active tech openings across {analytics.totalCompanies} companies. Rank employers by current posting velocity, fresher opportunities, and remote positions.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{analytics.totalCompanies}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Active Companies</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{analytics.totalRecordsAnalyzed}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Openings Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setLeaderboardTab("volume")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                leaderboardTab === "volume"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              🔥 Top Hiring Volume
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab("freshers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                leaderboardTab === "freshers"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              🎓 Fresher Friendly
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab("remote")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                leaderboardTab === "remote"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              🌍 Remote Leaders
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab("domains")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                leaderboardTab === "domains"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              ⚡ Domains Breakdown
            </button>
          </div>

          {leaderboardTab !== "domains" && (
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search company..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Content View: Domain Rankings */}
        {leaderboardTab === "domains" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.domainRankings.map((dom, index) => (
              <div
                key={dom.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">#{index + 1}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    {dom.count} Openings
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{dom.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{dom.desc}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Link
                    to={`/opportunity-map?domain=${dom.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>View Map Cluster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Content View: Companies Leaderboard Table */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Active Openings</th>
                    <th className="py-3 px-4">Fresher Friendly</th>
                    <th className="py-3 px-4">Remote Roles</th>
                    <th className="py-3 px-4">Sample Openings</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 animate-pulse">
                        Calculating live leaderboard metrics...
                      </td>
                    </tr>
                  ) : displayedCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500">
                        No companies found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    displayedCompanies.map((c, idx) => (
                      <tr
                        key={c.company}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <Link
                            to={`/companies/${encodeURIComponent(c.company.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {c.company}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                            {c.totalJobs}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          {c.fresherCount > 0 ? `${c.fresherCount} openings` : "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-purple-600 dark:text-purple-400">
                          {c.remoteCount > 0 ? `${c.remoteCount} remote` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {c.sampleRoles.join(", ")}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/jobs/india?q=${encodeURIComponent(c.company)}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          >
                            <span>View Jobs</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
