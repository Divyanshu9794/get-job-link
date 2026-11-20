import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { doc, setDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import {
  Search,
  Download,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { db } from "../firebase";
import { processHiringRadarData } from "../utils/hiringRadarAnalytics.js";
import { getCompanyColor, getCompanyInitials } from "../utils/jobClassification";

export default function AdminHiringAnalytics({ jobs = [], isAdmin = false, showToast = () => {} }) {
  // Aggregate live analytics from jobs
  const analytics = useMemo(() => {
    return processHiringRadarData(jobs);
  }, [jobs]);

  // Table Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [trendFilter, setTrendFilter] = useState("all"); // "all" | "surging" | "increasing" | "new"
  const [sortBy, setSortBy] = useState("activeJobs"); // "activeJobs" | "jobsLast7d" | "jobsLast30d" | "companyName" | "lastJobAddedAt"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Rebuilding / Cloud Sync State
  const [rebuilding, setRebuilding] = useState(false);

  // Filter & Sort Companies
  const filteredCompanies = useMemo(() => {
    let list = [...analytics.companies];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.topSkills?.some((s) => s.toLowerCase().includes(q)) ||
          c.locations?.some((l) => l.toLowerCase().includes(q))
      );
    }

    if (trendFilter !== "all") {
      if (trendFilter === "surging") list = list.filter((c) => c.trend === "Surging");
      if (trendFilter === "increasing") list = list.filter((c) => c.trend === "Increasing" || c.trend === "Surging");
      if (trendFilter === "new") list = list.filter((c) => c.isNewThisWeek);
    }

    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [analytics.companies, searchTerm, trendFilter, sortBy, sortOrder]);

  // Paginated Rows
  const totalPages = Math.ceil(filteredCompanies.length / pageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  // Export Companies Table to CSV
  const exportToCsv = () => {
    try {
      const headers = [
        "Company Name",
        "Active Jobs",
        "Jobs (7 Days)",
        "Jobs (30 Days)",
        "Trend",
        "Multi-Role",
        "Top Locations",
        "Top Skills",
        "First Observed",
        "Last Job Added",
      ];

      const rows = filteredCompanies.map((c) => [
        `"${c.companyName.replace(/"/g, '""')}"`,
        c.activeJobs,
        c.jobsLast7d,
        c.jobsLast30d,
        `"${c.trend}"`,
        c.isMultiRole ? "Yes" : "No",
        `"${(c.topLocations || []).join(", ").replace(/"/g, '""')}"`,
        `"${(c.topSkills || []).join(", ").replace(/"/g, '""')}"`,
        c.firstObservedAt ? new Date(c.firstObservedAt).toISOString().split("T")[0] : "",
        c.lastJobAddedAt ? new Date(c.lastJobAddedAt).toISOString().split("T")[0] : "",
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `getjoblink-hiring-analytics-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Hiring analytics exported to CSV successfully!");
    } catch (err) {
      showToast("CSV export failed: " + err.message, "error");
    }
  };

  // Rebuild & Commit to Firestore
  const handleRebuildAndCommit = async () => {
    if (!isAdmin) return;
    setRebuilding(true);
    try {
      // 1. Write hiring_radar_metadata/overview
      const overviewRef = doc(db, "hiring_radar_metadata", "overview");
      await setDoc(overviewRef, {
        ...analytics,
        updatedAt: serverTimestamp(),
        companies: undefined, // keep overview lean
        companyDict: undefined,
      }, { merge: true });

      // 2. Batch commit company_analytics documents
      const BATCH_SIZE = 400;
      let batch = writeBatch(db);
      let count = 0;

      for (const comp of analytics.companies) {
        const compRef = doc(db, "company_analytics", comp.slug);
        batch.set(compRef, {
          ...comp,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        count++;

        if (count >= BATCH_SIZE) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        await batch.commit();
      }

      showToast(`Hiring Radar successfully synced across ${analytics.companies.length} companies!`);
    } catch (err) {
      console.error("Firestore sync error:", err);
      showToast("Failed to sync Hiring Radar: " + err.message, "error");
    } finally {
      setRebuilding(false);
    }
  };

  const handleSortToggle = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry &amp; Market Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hiring Analytics &amp; Company Velocity Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated intelligence across {jobs.length.toLocaleString()} active jobs and {analytics.overview.totalCompanies} tech employers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportToCsv}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleRebuildAndCommit}
            disabled={rebuilding}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${rebuilding ? "animate-spin" : ""}`} />
            <span>{rebuilding ? "Syncing to Firestore..." : "Rebuild & Commit to Firestore"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADMIN OVERVIEW METRICS                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Total Companies</span>
          <span className="text-2xl font-black text-slate-900 block">{analytics.overview.totalCompanies}</span>
          <span className="text-[11px] text-slate-500 font-medium">All indexed employers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Active Employers</span>
          <span className="text-2xl font-black text-emerald-700 block">{analytics.overview.companiesHiring}</span>
          <span className="text-[11px] text-emerald-800 font-medium">With &ge;1 active job</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">New Employers (7d)</span>
          <span className="text-2xl font-black text-blue-700 block">+{analytics.overview.newCompaniesThisWeek}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            vs {analytics.overview.newCompaniesPrevWeek} prev 7d
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">New Listings (7d)</span>
          <span className="text-2xl font-black text-indigo-700 block">+{analytics.overview.newJobsThisWeek}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            vs {analytics.overview.newJobsPrevWeek} prev 7d
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TRENDS & VISUALIZATIONS (Interactive SVG Data Visuals)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual 1: Daily Job Ingestion Trend (Last 30 Days) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Daily Job Posting Activity (Recent 30 Days)
              </h3>
              <p className="text-xs text-slate-400">Ingested postings timeline from Firestore date records</p>
            </div>
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {analytics.dailyTrends.length} Recorded Days
            </span>
          </div>

          {/* Sparkline / Bar Histogram */}
          <div className="pt-2">
            <div className="h-44 flex items-end space-x-1.5 border-b border-slate-200 pb-2">
              {analytics.dailyTrends.map((d) => {
                const maxCount = Math.max(...analytics.dailyTrends.map((t) => t.count), 1);
                const heightPct = Math.min(100, Math.max(12, (d.count / maxCount) * 100));

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono pointer-events-none whitespace-nowrap z-10">
                      {d.date}: {d.count} jobs
                    </div>
                    <div
                      className="w-full bg-blue-600 hover:bg-blue-500 rounded-t-sm transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-2 font-mono">
              <span>{analytics.dailyTrends[0]?.date || "Earliest"}</span>
              <span>{analytics.dailyTrends[analytics.dailyTrends.length - 1]?.date || "Today"}</span>
            </div>
          </div>
        </div>

        {/* Visual 2: Work Mode & Domain Distribution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Work Mode Breakdown</h3>
            <p className="text-xs text-slate-400">Remote vs Hybrid vs On-site distribution</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Remote Positions</span>
                <span className="font-bold text-emerald-700">{analytics.workModes.remote} jobs</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(analytics.workModes.remote / (jobs.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Hybrid Roles</span>
                <span className="font-bold text-blue-700">{analytics.workModes.hybrid} jobs</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(analytics.workModes.hybrid / (jobs.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">On-Site Positions</span>
                <span className="font-bold text-slate-700">{analytics.workModes.onsite} jobs</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-500 h-2 rounded-full"
                  style={{ width: `${(analytics.workModes.onsite / (jobs.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Top Engineering Domains</h4>
            <div className="flex flex-wrap gap-1.5">
              {analytics.domains.slice(0, 6).map((d) => (
                <span key={d.domain} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  {d.domain} ({d.count})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. COMPANY HIRING ANALYTICS TABLE                                         */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search company or skill..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 sm:w-64"
              />
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => {
                  setTrendFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  trendFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({analytics.companies.length})
              </button>
              <button
                onClick={() => {
                  setTrendFilter("surging");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  trendFilter === "surging" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Surging
              </button>
              <button
                onClick={() => {
                  setTrendFilter("increasing");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  trendFilter === "increasing" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Increasing
              </button>
              <button
                onClick={() => {
                  setTrendFilter("new");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  trendFilter === "new" ? "bg-white text-amber-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                New (7d)
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Showing {paginatedCompanies.length} of {filteredCompanies.length} companies
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th
                  onClick={() => handleSortToggle("companyName")}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  Company Name {sortBy === "companyName" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSortToggle("activeJobs")}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 text-center"
                >
                  Active Jobs {sortBy === "activeJobs" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSortToggle("jobsLast7d")}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 text-center"
                >
                  7 Days {sortBy === "jobsLast7d" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSortToggle("jobsLast30d")}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 text-center"
                >
                  30 Days {sortBy === "jobsLast30d" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4">Top Hiring Location</th>
                <th className="py-3 px-4">Top Skills</th>
                <th className="py-3 px-4">Trend Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCompanies.map((comp) => {
                const color = getCompanyColor(comp.companyName);
                const initials = getCompanyInitials(comp.companyName);

                return (
                  <tr key={comp.slug} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg ${color.bg} ${color.text} ${color.border} border flex items-center justify-center font-bold text-[10px] shrink-0`}
                        >
                          {initials}
                        </div>
                        <span className="font-extrabold text-slate-900">{comp.companyName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-900">{comp.activeJobs}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      {comp.jobsLast7d > 0 ? `+${comp.jobsLast7d}` : "0"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-700">
                      {comp.jobsLast30d > 0 ? `+${comp.jobsLast30d}` : "0"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[140px]">
                      {comp.topLocations?.[0] || "Disclosed in listing"}
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-[160px]">
                      <span className="text-slate-600 font-medium">
                        {comp.topSkills?.slice(0, 3).join(", ") || "Engineering"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
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
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/hiring-radar/company/${comp.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        <span>Intel</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs"
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SKILLS PAIRINGS & LEADERBOARD                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skill Combinations */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Top Co-Occurring Skill Pairs
            </h3>
            <p className="text-xs text-slate-400">Technologies most frequently demanded together in job listings</p>
          </div>

          <div className="space-y-2.5">
            {analytics.skills.pairings.slice(0, 7).map((pair, idx) => (
              <div
                key={pair.pair}
                className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-slate-400 text-[11px]">#{idx + 1}</span>
                  <span className="font-bold text-slate-900">{pair.pair}</span>
                </div>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                  {pair.count} roles
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Location & Multi-Domain Leaders */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Multi-Domain Engineering Teams
            </h3>
            <p className="text-xs text-slate-400">Companies hiring across distinct engineering specializations</p>
          </div>

          <div className="space-y-2.5">
            {analytics.companies
              .filter((c) => c.isMultiRole)
              .sort((a, b) => b.distinctRolesCount - a.distinctRolesCount || b.activeJobs - a.activeJobs)
              .slice(0, 7)
              .map((c, idx) => (
                <div
                  key={c.slug}
                  className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="font-mono text-slate-400 text-[11px]">#{idx + 1}</span>
                    <span className="font-bold text-slate-900 truncate">{c.companyName}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {c.distinctRolesCount} specializations
                    </span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                      {c.activeJobs} jobs
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DATA QUALITY & AUDIT PANEL                                             */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 uppercase tracking-wider mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Data Hygiene &amp; Quality Audit</span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Job Inventory Quality Controls
            </h3>
            <p className="text-xs text-slate-400">
              Diagnostic metrics to ensure 100% clean data before generating public intelligence
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Audit sample: {analytics.dataQuality.totalChecked} records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Missing Company</span>
            <span className="text-xl font-black text-white mt-1 block">
              {analytics.dataQuality.missingCompany}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Missing Location</span>
            <span className="text-xl font-black text-white mt-1 block">
              {analytics.dataQuality.missingLocation}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Missing Skills</span>
            <span className="text-xl font-black text-white mt-1 block">
              {analytics.dataQuality.missingSkills}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Missing Dates</span>
            <span className="text-xl font-black text-white mt-1 block">
              {analytics.dataQuality.missingDates}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Potential Duplicates</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {analytics.dataQuality.potentialDuplicates}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
