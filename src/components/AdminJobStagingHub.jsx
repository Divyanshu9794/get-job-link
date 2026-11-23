import { useState, useMemo, useEffect, useRef } from "react";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  X,
  Database,
} from "lucide-react";
import { collection, addDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import {
  JOB_SOURCES,
  fetchJobsFromSource,
  isJobDuplicate,
  isTechJob,
  saveStagedJobsPersistent,
  loadStagedJobsPersistent,
  clearStagedJobsPersistent,
} from "../utils/jobFetchEngine";
import { getCompanyInitials, getCompanyColor, formatDisplaySalary } from "../utils/jobClassification";
import { useToast } from "../context/ToastContext";

export default function AdminJobStagingHub({ existingJobs = [], onJobPublished }) {
  const { showToast } = useToast();

  const [selectedSources, setSelectedSources] = useState(() =>
    JOB_SOURCES.slice(0, 8).map((s) => s.id)
  );
  const [fetching, setFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState("");
  const [stagingJobs, setStagingJobs] = useState([]);
  const [loadingSavedStaging, setLoadingSavedStaging] = useState(true);
  const hasLoadedFromStorage = useRef(false);
  const [selectedStagingIds, setSelectedStagingIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dedupCompanies, setDedupCompanies] = useState(true);
  const [techOnly, setTechOnly] = useState(true);
  const PAGE_SIZE = 15;

  // Restore unapproved auto-fetched jobs from persistent storage (IndexedDB / localStorage)
  useEffect(() => {
    let isMounted = true;
    loadStagedJobsPersistent()
      .then((saved) => {
        if (isMounted) {
          if (Array.isArray(saved) && saved.length > 0) {
            setStagingJobs(saved);
          }
          hasLoadedFromStorage.current = true;
          setLoadingSavedStaging(false);
        }
      })
      .catch((err) => {
        console.warn("Could not load persisted staging jobs:", err);
        if (isMounted) {
          hasLoadedFromStorage.current = true;
          setLoadingSavedStaging(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist staging jobs across page refreshes and tab switches whenever the queue updates
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    saveStagedJobsPersistent(stagingJobs).catch((err) => {
      console.warn("Failed persisting staging jobs queue:", err);
    });
  }, [stagingJobs]);

  // Edit Modal State
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [publishing, setPublishing] = useState(false);

  const toggleSourceSelection = (id) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAllSources = () => {
    setSelectedSources(JOB_SOURCES.map((s) => s.id));
  };

  const deselectAllSources = () => {
    setSelectedSources([]);
  };

  // Run auto-fetch across selected sources
  const handleTriggerAutoFetch = async () => {
    if (selectedSources.length === 0) {
      showToast("Please select at least one company or API source.", "info");
      return;
    }

    setFetching(true);
    let totalFetched = 0;
    let totalDuplicatesSkipped = 0;
    const newFetchedList = [];

    const sourcesToRun = JOB_SOURCES.filter((s) => selectedSources.includes(s.id));

    for (let i = 0; i < sourcesToRun.length; i++) {
      const src = sourcesToRun[i];
      setFetchProgress(`Fetching from ${src.name} (${i + 1}/${sourcesToRun.length})...`);

      try {
        const fetched = await fetchJobsFromSource(src);
        fetched.forEach((cand) => {
          // Check against existing live jobs + already staged jobs
          const isDupLive = isJobDuplicate(cand, existingJobs);
          const isDupStaging = isJobDuplicate(cand, stagingJobs) || isJobDuplicate(cand, newFetchedList);

          if (isDupLive || isDupStaging) {
            totalDuplicatesSkipped++;
          } else {
            newFetchedList.push(cand);
            totalFetched++;
          }
        });
      } catch (err) {
        console.warn(`Failed fetching from ${src.name}:`, err.message);
      }
    }

    setStagingJobs((prev) => [...newFetchedList, ...prev]);
    setFetching(false);
    setFetchProgress("");

    showToast(
      `Fetched ${totalFetched} fresh listings! (Skipped ${totalDuplicatesSkipped} duplicates)`,
      totalFetched > 0 ? "success" : "info"
    );
  };

  // Approve a single job and publish to Firestore
  const handleApproveAndPublish = async (job) => {
    setPublishing(true);
    try {
      const newJobDoc = {
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        jobType: job.jobType || "Full Time",
        experience: job.experience || "More than 0 year",
        salary: job.salary || "Competitive",
        domain: job.domain || "Engineering",
        isRemote: job.isRemote || false,
        skills: job.skills || "",
        jd: job.jd || "",
        createdAt: serverTimestamp(),
        publishedVia: "admin_auto_fetch_approval",
      };

      const docRef = await addDoc(collection(db, "jobs"), newJobDoc);

      // Remove from staging queue
      setStagingJobs((prev) => prev.filter((j) => j.externalId !== job.externalId));
      setSelectedStagingIds((prev) => {
        const next = new Set(prev);
        next.delete(job.externalId);
        return next;
      });

      showToast(`Approved & published "${job.title}" to live database!`);
      if (onJobPublished) onJobPublished({ id: docRef.id, ...newJobDoc });
    } catch (err) {
      console.error("Error publishing job:", err);
      showToast("Error publishing job: " + err.message, "error");
    } finally {
      setPublishing(false);
    }
  };

  // Bulk Approve Selected Jobs
  const handleBulkApprove = async () => {
    if (selectedStagingIds.size === 0) return;
    setPublishing(true);

    const jobsToPublish = stagingJobs.filter((j) => selectedStagingIds.has(j.externalId));
    let publishedCount = 0;

    try {
      const batch = writeBatch(db);
      jobsToPublish.forEach((j) => {
        const newRef = doc(collection(db, "jobs"));
        batch.set(newRef, {
          title: j.title,
          company: j.company,
          location: j.location,
          url: j.url,
          jobType: j.jobType || "Full Time",
          experience: j.experience || "More than 0 year",
          salary: j.salary || "Competitive",
          domain: j.domain || "Engineering",
          isRemote: j.isRemote || false,
          skills: j.skills || "",
          jd: j.jd || "",
          createdAt: serverTimestamp(),
          publishedVia: "admin_bulk_approval",
        });
        publishedCount++;
      });

      await batch.commit();

      // Remove approved from staging
      setStagingJobs((prev) => prev.filter((j) => !selectedStagingIds.has(j.externalId)));
      setSelectedStagingIds(new Set());

      showToast(`Bulk approved and published ${publishedCount} jobs to live site!`);
      if (onJobPublished) onJobPublished();
    } catch (err) {
      console.error("Bulk approve error:", err);
      showToast("Error bulk publishing: " + err.message, "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = (externalId) => {
    setStagingJobs((prev) => prev.filter((j) => j.externalId !== externalId));
    setSelectedStagingIds((prev) => {
      const next = new Set(prev);
      next.delete(externalId);
      return next;
    });
    showToast("Listing discarded from staging.");
  };

  const handleClearStaging = () => {
    if (!window.confirm("Clear all jobs from the staging approval queue?")) return;
    setStagingJobs([]);
    setSelectedStagingIds(new Set());
    clearStagedJobsPersistent().catch(() => {});
    showToast("Staging queue cleared.");
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      url: job.url || "",
      experience: job.experience || "More than 0 year",
      salary: job.salary || "Competitive",
      skills: job.skills || "",
      jd: job.jd || "",
      isRemote: job.isRemote || false,
      jobType: job.jobType || "Full Time",
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingJob) return;

    setStagingJobs((prev) =>
      prev.map((j) => (j.externalId === editingJob.externalId ? { ...j, ...editFormData } : j))
    );

    showToast("Staging listing details updated.");
    setEditingJob(null);
  };

  // Filtered & Paginated Staging List
  const filteredStaging = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    // 1. Initial filter by search term, tech roles, and category
    let list = stagingJobs.filter((job) => {
      // Tech-only filter
      if (techOnly && !isTechJob(job.title)) {
        return false;
      }

      // Search across all unapproved jobs (title, company, skills, location, and description)
      const matchSearch =
        !term ||
        (job.title || "").toLowerCase().includes(term) ||
        (job.company || "").toLowerCase().includes(term) ||
        (job.skills || "").toLowerCase().includes(term) ||
        (job.location || "").toLowerCase().includes(term) ||
        (job.jd || "").toLowerCase().includes(term);

      if (!matchSearch) return false;

      // If search term is active, search across ALL unapproved jobs regardless of category tab
      if (term) return true;

      const matchCat =
        categoryFilter === "all" ||
        (categoryFilter === "india" && (job.location || "").toLowerCase().includes("india")) ||
        (categoryFilter === "remote" && (job.isRemote || (job.location || "").toLowerCase().includes("remote")));

      return matchCat;
    });

    // 2. Deduplicate by Company (limit to at most 2 jobs per company so the feed isn't flooded)
    if (dedupCompanies) {
      const companyCounts = {};
      list = list.filter((job) => {
        const compKey = (job.company || "").trim().toLowerCase();
        if (!compKey) return true;
        companyCounts[compKey] = (companyCounts[compKey] || 0) + 1;
        return companyCounts[compKey] <= 2;
      });
    }

    return list;
  }, [stagingJobs, searchTerm, categoryFilter, techOnly, dedupCompanies]);

  const totalPages = Math.max(1, Math.ceil(filteredStaging.length / PAGE_SIZE));
  const paginatedStaging = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStaging.slice(start, start + PAGE_SIZE);
  }, [filteredStaging, currentPage]);

  const handleToggleSelectAllOnPage = () => {
    const next = new Set(selectedStagingIds);
    const allPageSelected = paginatedStaging.every((j) => next.has(j.externalId));

    if (allPageSelected) {
      paginatedStaging.forEach((j) => next.delete(j.externalId));
    } else {
      paginatedStaging.forEach((j) => next.add(j.externalId));
    }
    setSelectedStagingIds(next);
  };

  const handleToggleSelectAllFiltered = () => {
    const next = new Set(selectedStagingIds);
    const allFilteredSelected = filteredStaging.length > 0 && filteredStaging.every((j) => next.has(j.externalId));

    if (allFilteredSelected) {
      filteredStaging.forEach((j) => next.delete(j.externalId));
    } else {
      filteredStaging.forEach((j) => next.add(j.externalId));
    }
    setSelectedStagingIds(next);
  };

  const handleToggleSelectOne = (id) => {
    const next = new Set(selectedStagingIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStagingIds(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Source Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Multi-Source Ingestion Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Job Auto-Fetch &amp; Admin Staging Approval Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scrapes open roles directly from Greenhouse, Ashby, Lever, and Remote APIs with automatic duplicate detection.
              No fetched job goes live until approved by an administrator.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTriggerAutoFetch}
              disabled={fetching || selectedSources.length === 0}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
            >
              <RotateCcw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
              <span>{fetching ? "Fetching Openings..." : `Fetch from ${selectedSources.length} Sources`}</span>
            </button>
          </div>
        </div>

        {/* Fetch Progress Banner */}
        {fetching && (
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 font-bold flex items-center space-x-2 animate-pulse">
            <RotateCcw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span>{fetchProgress}</span>
          </div>
        )}

        {/* Source Badges Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              Select Active Ingestion Channels ({selectedSources.length}/{JOB_SOURCES.length})
            </span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={selectAllSources}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={deselectAllSources}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {JOB_SOURCES.map((source) => {
              const isSelected = selectedSources.includes(source.id);
              return (
                <button
                  key={source.id}
                  onClick={() => toggleSourceSelection(source.id)}
                  className={`px-3 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {isSelected ? `✓ ${source.name}` : source.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Staging Queue Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staged jobs or skills..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white w-52 sm:w-64"
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setCategoryFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                categoryFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({stagingJobs.length})
            </button>
            <button
              onClick={() => {
                setCategoryFilter("india");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                categoryFilter === "india"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              India
            </button>
            <button
              onClick={() => {
                setCategoryFilter("remote");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                categoryFilter === "remote"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Remote
            </button>
          </div>

          {/* Deduplication & Tech Filter Toggles */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setDedupCompanies(!dedupCompanies);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                dedupCompanies
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800"
              }`}
              title="Limits to at most 2 jobs per company so the feed doesn't get flooded"
            >
              {dedupCompanies ? "✓ Max 2 / Company" : "All per Company"}
            </button>

            <button
              type="button"
              onClick={() => {
                setTechOnly(!techOnly);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                techOnly
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800"
              }`}
              title="Filters out HR, Marketing, Operations, Safety, Sales"
            >
              {techOnly ? "✓ Tech & Eng Only" : "All Job Domains"}
            </button>
          </div>

          {searchTerm && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold self-center">
              {filteredStaging.length} matches found
            </span>
          )}

          {stagingJobs.length > 0 && (
            <span
              className="hidden lg:inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-1 rounded-xl"
              title="Unapproved jobs stay in your browser across page refreshes and tab switches until approved or cleared."
            >
              <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Queue auto-saved</span>
            </span>
          )}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {filteredStaging.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAllFiltered}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              {filteredStaging.every((j) => selectedStagingIds.has(j.externalId))
                ? "Deselect All"
                : `Select All Matching (${filteredStaging.length})`}
            </button>
          )}

          {selectedStagingIds.size > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={publishing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Selected ({selectedStagingIds.size})</span>
            </button>
          )}

          {stagingJobs.length > 0 && (
            <button
              onClick={handleClearStaging}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Clear Queue
            </button>
          )}
        </div>
      </div>

      {/* 3. Staging Jobs Queue Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        {loadingSavedStaging ? (
          <div className="p-12 text-center space-y-3">
            <RotateCcw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Restoring Persistent Staging Queue...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loading unapproved jobs previously auto-fetched from storage.
            </p>
          </div>
        ) : filteredStaging.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Staging Approval Queue Is Empty
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Select desired company ATS boards above and click &quot;Fetch from Sources&quot; to ingest open engineering roles for review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={handleToggleSelectAllOnPage}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {paginatedStaging.length > 0 &&
                      paginatedStaging.every((j) => selectedStagingIds.has(j.externalId)) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Role &amp; Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Experience &amp; Salary</th>
                  <th className="py-3 px-4">Extracted Skills</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedStaging.map((job) => {
                  const isSelected = selectedStagingIds.has(job.externalId);
                  const color = getCompanyColor(job.company);
                  const initials = getCompanyInitials(job.company);

                  return (
                    <tr
                      key={job.externalId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleSelectOne(job.externalId)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg ${color.bg} ${color.text} ${color.border} border flex items-center justify-center font-bold text-[10px] shrink-0`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 dark:text-white block truncate max-w-xs">
                              {job.title}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                              {job.company}
                              {job.sourceName && job.sourceName.toLowerCase() !== job.company.toLowerCase() && (
                                <span className="text-slate-400 dark:text-slate-500 font-normal"> (via {job.sourceName})</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div>{job.location}</div>
                        {job.isRemote && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Distributed Remote
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{job.experience}</div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">{formatDisplaySalary(job.salary) || "Competitive"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                        {job.skills || "Engineering"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            title="Inspect external URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(job)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDiscard(job.externalId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Discard listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleApproveAndPublish(job)}
                            disabled={publishing}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                            title="Publish directly to live website"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredStaging.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {paginatedStaging.length} of {filteredStaging.length} staged listings
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Staging Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Edit Staged Listing Before Approval
              </h3>
              <button
                onClick={() => setEditingJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Salary / Pay Scale</label>
                  <input
                    type="text"
                    value={editFormData.salary}
                    onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Experience</label>
                  <input
                    type="text"
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Skills</label>
                  <input
                    type="text"
                    value={editFormData.skills}
                    onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  value={editFormData.jd}
                  onChange={(e) => setEditFormData({ ...editFormData, jd: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
