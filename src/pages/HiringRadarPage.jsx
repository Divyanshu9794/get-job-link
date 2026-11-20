import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  TrendingUp,
  Building2,
  Sparkles,
  MapPin,
  Layers,
  Search,
  ChevronRight,
  Info,
  Clock,
  Zap,
  Radio,
} from "lucide-react";
import { db } from "../firebase";
import { processHiringRadarData } from "../utils/hiringRadarAnalytics.js";
import { getCompanyColor, getCompanyInitials } from "../utils/jobClassification";
import SEO from "../components/SEO";

export default function HiringRadarPage() {
  const [loading, setLoading] = useState(true);
  const [radarData, setRadarData] = useState(null);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("all"); // "all" | "remote" | "hybrid" | "onsite"
  const [sortBy, setSortBy] = useState("velocity"); // "velocity" | "active" | "recent"
  const [skillsRange, setSkillsRange] = useState("30d"); // "7d" | "30d" | "90d" | "all"

  // Load Hiring Radar Data (Check Firestore cached overview first, fallback to processing jobs)
  useEffect(() => {
    let isMounted = true;

    async function loadRadarData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Try to read pre-aggregated overview document
        let overviewSnap = null;
        try {
          overviewSnap = await getDoc(doc(db, "hiring_radar_metadata", "overview"));
        } catch (e) {
          console.warn("Could not read hiring_radar_metadata/overview:", e);
        }

        if (overviewSnap && overviewSnap.exists() && overviewSnap.data()?.overview) {
          if (isMounted) {
            setRadarData(overviewSnap.data());
            setLoading(false);
            return;
          }
        }

        // 2. Fallback: Query jobs collection and process live
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(800));
        const jobsSnap = await getDocs(q);

        if (!isMounted) return;

        const jobsList = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const processed = processHiringRadarData(jobsList);

        if (isMounted) {
          setRadarData(processed);
        }
      } catch (err) {
        console.error("Error loading Hiring Radar data:", err);
        if (isMounted) {
          setError("Unable to load Hiring Radar insights at the moment. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRadarData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered & Sorted Companies for "Rising Hiring Activity" Section
  const filteredCompanies = useMemo(() => {
    if (!radarData || !radarData.risingCompanies) return [];
    let list = [...(radarData.companies || radarData.risingCompanies)];

    // Search filter (company name or skills)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.topSkills?.some((s) => s.toLowerCase().includes(q)) ||
          c.locations?.some((l) => l.toLowerCase().includes(q))
      );
    }

    // Work Mode Filter
    if (workModeFilter !== "all") {
      list = list.filter((c) => {
        if (workModeFilter === "remote") {
          return c.recentJobs?.some((j) => j.isRemote) || c.locations?.some((l) => l.toLowerCase().includes("remote"));
        }
        if (workModeFilter === "hybrid") {
          return c.locations?.some((l) => l.toLowerCase().includes("hybrid"));
        }
        return true;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "velocity") {
        if (b.jobsLast7d !== a.jobsLast7d) return b.jobsLast7d - a.jobsLast7d;
        return b.jobsLast30d - a.jobsLast30d;
      }
      if (sortBy === "active") {
        return b.activeJobs - a.activeJobs;
      }
      if (sortBy === "recent") {
        return b.lastJobAddedAt - a.lastJobAddedAt;
      }
      return 0;
    });

    return list;
  }, [radarData, searchTerm, workModeFilter, sortBy]);

  // Selected Skills List based on time toggle
  const currentSkills = useMemo(() => {
    if (!radarData?.skills) return [];
    return radarData.skills[skillsRange] || radarData.skills["30d"] || [];
  }, [radarData, skillsRange]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-20">
      <SEO
        title="Hiring Radar — Tech Companies Actively Hiring & In-Demand Skills | GetJobLink"
        description="Discover which tech companies are actively posting jobs, popular engineering skills in demand, and newly verified tech employers on GetJobLink."
        canonicalUrl="https://getjoblink.in/hiring-radar"
      />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Radio className="w-3.5 h-3.5" />
              <span>Real-Time Hiring Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              GetJobLink Hiring Radar
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Track companies with increasing job postings, discover multi-role engineering employers,
              and benchmark in-demand tech skills—derived strictly from authenticated direct ATS listings.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse p-5" />
              ))}
            </div>
            <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse p-6" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-center justify-between">
            <p className="text-xs sm:text-sm font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3.5 py-1.5 bg-white text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && radarData && (
          <>
            {/* ========================================================================= */}
            {/* SECTION A: OVERVIEW CARDS WITH HISTORICAL COMPARISONS                     */}
            {/* ========================================================================= */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Platform Hiring Snapshot
                </h2>
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Calculated from {radarData.totalActiveJobs?.toLocaleString()} verified listings</span>
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Companies Currently Hiring */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold text-slate-600">Companies Hiring</span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {radarData.overview?.companiesHiring?.toLocaleString() || radarData.overview?.totalCompanies}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Across {radarData.overview?.totalCompanies} indexed tech employers
                  </div>
                </div>

                {/* Metric 2: New Companies Discovered This Week */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold text-slate-600">New Companies (7d)</span>
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                    +{radarData.overview?.newCompaniesThisWeek?.toLocaleString() || 0}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium flex items-center space-x-1">
                    <span>First observed on GetJobLink in past 7 days</span>
                  </div>
                </div>

                {/* Metric 3: New Jobs Added This Week */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold text-slate-600">New Listings (7d)</span>
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
                    +{radarData.overview?.newJobsThisWeek?.toLocaleString() || 0}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {radarData.overview?.newJobsPrevWeek > 0
                      ? `${radarData.overview.newJobsPrevWeek} listings added in previous 7d`
                      : "Fresh verified openings"}
                  </div>
                </div>

                {/* Metric 4: Companies Hiring Across Multiple Roles */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold text-slate-600">Multi-Role Employers</span>
                    <Layers className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
                    {radarData.overview?.multiRoleCompanies?.toLocaleString() || 0}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Hiring for 2+ distinct engineering roles
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION B: RISING HIRING ACTIVITY (Companies Ranked by Velocity)          */}
            {/* ========================================================================= */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider mb-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Hiring Velocity</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Rising Hiring Activity
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                    Companies with highest job-posting velocity on GetJobLink. Click any company for full hiring history, skill demands, and active listings.
                  </p>
                </div>

                {/* Filter and Sort Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search company or skill..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
                    />
                  </div>

                  {/* Work Mode */}
                  <select
                    value={workModeFilter}
                    onChange={(e) => setWorkModeFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Modes</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="velocity">Fastest Growing (7d)</option>
                    <option value="active">Most Active Jobs</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              </div>

              {/* Company Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.slice(0, 15).map((comp) => {
                  const color = getCompanyColor(comp.companyName);
                  const initials = getCompanyInitials(comp.companyName);

                  return (
                    <div
                      key={comp.slug}
                      className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        {/* Company Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-11 h-11 rounded-xl ${color.bg} ${color.text} ${color.border} border flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}
                            >
                              {initials}
                            </div>
                            <div>
                              <Link
                                to={`/hiring-radar/company/${comp.slug}`}
                                className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 hover:underline"
                              >
                                {comp.companyName}
                              </Link>
                              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                                <span className="font-bold text-slate-700">
                                  {comp.activeJobs} active {comp.activeJobs === 1 ? "job" : "jobs"}
                                </span>
                                {comp.isMultiRole && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-600 font-semibold text-[11px]">
                                      {comp.distinctRolesCount} roles
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Trend Pill */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              comp.trend === "Surging"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : comp.trend === "Increasing"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : comp.trend === "New This Week"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {comp.trend}
                          </span>
                        </div>

                        {/* Recent Activity Indicators */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">
                              Last 7 Days
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {comp.jobsLast7d > 0 ? `+${comp.jobsLast7d} jobs` : "0 new"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">
                              Last 30 Days
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {comp.jobsLast30d > 0 ? `+${comp.jobsLast30d} jobs` : "0 new"}
                            </span>
                          </div>
                        </div>

                        {/* Top Skills Tags */}
                        {comp.topSkills && comp.topSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-[11px]">
                            {comp.topSkills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Location Preview */}
                        {comp.topLocations && comp.topLocations.length > 0 && (
                          <div className="flex items-center space-x-1 text-slate-500 text-[11px] truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{comp.topLocations.join(", ")}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer CTA */}
                      <Link
                        to={`/hiring-radar/company/${comp.slug}`}
                        className="w-full inline-flex items-center justify-center space-x-1 text-xs font-bold py-2 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl transition-all"
                      >
                        <span>View Company Intelligence</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Factual Disclaimer Banner */}
              <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-500">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Methodology Note:</strong> Hiring trends reflect actual verified job postings discovered and validated on GetJobLink. Increased posting activity establishes active hiring initiatives on the platform, not necessarily company-wide headcount expansion.
                </p>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION C & D: TWO-COLUMN SKILLS INTELLIGENCE + NEWLY DISCOVERED          */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: In-Demand Skills */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Most In-Demand Technologies &amp; Skills
                    </h2>
                    <p className="text-xs text-slate-500">
                      Frequency of technical requirements extracted across active job listings
                    </p>
                  </div>

                  {/* Skills Time Filter */}
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
                    {["7d", "30d", "90d", "all"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setSkillsRange(r)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          skillsRange === r
                            ? "bg-white text-blue-600 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "All Time"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Progress List */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5">
                  {currentSkills.slice(0, 12).map((skill, index) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-slate-400 text-[11px] w-4">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-slate-900">{skill.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                          <span>{skill.count} jobs</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-blue-600">{skill.percentage}% of roles</span>
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(8, skill.percentage * 2))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 1 Col: Newly Discovered Companies */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Newly Discovered
                  </h2>
                  <p className="text-xs text-slate-500">
                    Companies indexed on GetJobLink for the first time
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs divide-y divide-slate-100">
                  {radarData.newlyDiscoveredCompanies?.slice(0, 7).map((comp) => {
                    const initials = getCompanyInitials(comp.companyName);
                    const color = getCompanyColor(comp.companyName);

                    return (
                      <Link
                        key={comp.slug}
                        to={`/hiring-radar/company/${comp.slug}`}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between group hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl ${color.bg} ${color.text} ${color.border} border flex items-center justify-center font-bold text-xs shrink-0`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors block truncate">
                              {comp.companyName}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {comp.activeJobs} open {comp.activeJobs === 1 ? "position" : "positions"}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION E: HIRING BY LOCATION                                             */}
            {/* ========================================================================= */}
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Hiring Hotspots by Location
                </h2>
                <p className="text-xs text-slate-500">
                  Top engineering hubs with direct authenticated job listings
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {radarData.locations?.slice(0, 8).map((loc) => (
                  <div
                    key={loc.city}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{loc.city}</span>
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {loc.count} jobs
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {loc.topCompanies?.length > 0 && (
                        <span>Hiring: {loc.topCompanies.join(", ")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* BEHIND THE RADAR — CREATOR & TRANSPARENCY CALLOUT                         */}
            {/* ========================================================================= */}
            <section className="pt-4 border-t border-slate-200">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start space-x-3.5">
                  <img
                    src="https://github.com/Divyanshu9794.png"
                    alt="Divyanshu Singh"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        Behind the Radar
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.2 rounded-full border border-slate-200">
                        Built by Divyanshu Singh
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                      Hiring Radar is part of GetJobLink, an independently built platform by Divyanshu Singh. It transforms job listing data into useful hiring activity insights to help candidates discover companies, roles and in-demand technologies.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto text-xs font-bold pt-1 sm:pt-0">
                  <Link
                    to="/about#meet-the-builder"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    About GetJobLink
                  </Link>
                  <span className="text-slate-300">•</span>
                  <a
                    href="https://github.com/Divyanshu9794/Get_job_Link_Android-App"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
