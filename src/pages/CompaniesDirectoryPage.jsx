import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
  Building2,
  Search,
  ChevronRight,
  ArrowRight,
  Heart,
} from "lucide-react";
import { db } from "../firebase";
import SEO from "../components/SEO";
import { getCompanyColor, getCompanyInitials, isRemoteJob } from "../utils/jobClassification";
import { createCompanySlug } from "../utils/hiringRadarAnalytics";
import { classifyJobDomain, TECH_DOMAINS } from "../utils/careerIntelligence";
import { useToast } from "../context/ToastContext";

export default function CompaniesDirectoryPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [followedCompanies, setFollowedCompanies] = useState(() => {
    try {
      const stored = localStorage.getItem("gjl_followed_companies");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    async function loadDirectory() {
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
        console.error("Failed to load companies directory:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDirectory();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFollow = (companyName) => {
    setFollowedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyName)) {
        next.delete(companyName);
        showToast(`Unfollowed ${companyName}`, "info");
      } else {
        next.add(companyName);
        showToast(`Following ${companyName}! You'll receive alert priority.`, "success");
      }
      try {
        localStorage.setItem("gjl_followed_companies", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const companies = useMemo(() => {
    const map = {};
    jobs.forEach((job) => {
      const raw = job.company?.trim();
      if (!raw) return;
      if (!map[raw]) {
        map[raw] = {
          name: raw,
          slug: createCompanySlug(raw),
          locations: new Set(),
          domains: new Set(),
          jobCount: 0,
          hasRemote: false,
        };
      }
      map[raw].jobCount++;
      if (job.location) map[raw].locations.add(job.location);
      if (isRemoteJob(job)) map[raw].hasRemote = true;
      const dom = classifyJobDomain(job);
      map[raw].domains.add(dom);
    });

    return Object.values(map).sort((a, b) => b.jobCount - a.jobCount);
  }, [jobs]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        !searchTerm.trim() ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchDomain =
        selectedDomain === "all" || c.domains.has(selectedDomain);
      return matchSearch && matchDomain;
    });
  }, [companies, searchTerm, selectedDomain]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Company DNA Directory - Top Technology Employers | GetJobLink"
        description="Explore technology companies hiring actively across India and globally. Direct ATS job listings, tech stacks, locations, and hiring insights."
        canonicalUrl="https://getjoblink.in/companies"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Company DNA</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Verified Employer Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Company DNA <span className="text-blue-600 dark:text-blue-400">Directory</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Discover companies actively hiring on GetJobLink. Explore technical domains represented in their listings, office locations, remote flexibility, and authenticated career portal links.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-6 shrink-0">
              <div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{companies.length}</div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Hiring Companies</div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{followedCompanies.size}</div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Followed</div>
              </div>
            </div>
          </div>

          {/* Search & Domain Filter Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search company by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedDomain("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDomain === "all"
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All Tech
              </button>
              {Object.entries(TECH_DOMAINS).slice(0, 5).map(([id, info]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedDomain(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedDomain === id
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {info.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6"
              />
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No companies found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or domain filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((c) => {
              const isFollowed = followedCompanies.has(c.name);
              return (
                <div
                  key={c.name}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${getCompanyColor(
                            c.name
                          )}`}
                        >
                          {getCompanyInitials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {c.name}
                          </h3>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                            {c.jobCount} active {c.jobCount === 1 ? "opening" : "openings"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFollow(c.name)}
                        title={isFollowed ? "Unfollow company" : "Follow company"}
                        className={`p-2 rounded-xl transition-colors shrink-0 ${
                          isFollowed
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFollowed ? "fill-rose-500" : ""}`} />
                      </button>
                    </div>

                    {/* Domains badges */}
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {Array.from(c.domains).slice(0, 3).map((domId) => (
                        <span
                          key={domId}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded-md"
                        >
                          {TECH_DOMAINS[domId]?.name || domId}
                        </span>
                      ))}
                      {c.hasRemote && (
                        <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-md">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      {Array.from(c.locations).slice(0, 2).join(", ") || "Global"}
                    </span>

                    <Link
                      to={`/companies/${c.slug}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Explore DNA</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
