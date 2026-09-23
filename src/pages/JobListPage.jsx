import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";
import { useApp } from "../App";
import JobCard from "../components/JobCard";
import {
  Briefcase, Search, ChevronDown, SlidersHorizontal, X, Check,
  Building2, Clock3, MapPin, ExternalLink
} from "lucide-react";

const JOB_TYPES = ["Full Time", "Part Time", "Contract", "Internship"];
const EXPERIENCES = ["0-1 years", "1-2 years", "2-4 years", "4+ years", "Freshers"];
const SALARIES = ["Competitive", "2-4 LPA", "4-6 LPA", "6-10 LPA", "10-20 LPA", "20+ LPA", "$10-20/hr", "$20-30/hr", "$30+/hr"];
const LOCATIONS = ["Remote", "Hybrid", "On-site", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Pune"];
const SKILLS = ["React", "Node.js", "AWS", "SQL", "Python", "Data Analytics", "Product Management", "Marketing", "Finance", "HR"];

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, loading } = useJobs();
  const { companyPriorities } = useApp();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const exp = searchParams.get("exp") || "";
  const location = searchParams.get("location") || "";
  const salary = searchParams.get("salary") || "";
  const domain = searchParams.get("domain") || "";
  const sort = searchParams.get("sort") || "recent";

  // Build a map of company name -> priority (lower number = higher priority)
  const priorityMap = new Map();
  companyPriorities.forEach((p) => {
    if (p.enabled !== false) {
      priorityMap.set((p.company || "").toLowerCase(), Number(p.priority) || 0);
    }
  });

  const getPriority = (company) => priorityMap.get((company || "").toLowerCase()) ?? 999;

  const toggleParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (next.get(key) === value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        !q ||
        [job.title, job.company, job.jd, job.domain, ...(job.skills || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      const matchesType = !type || job.jobType === type;
      const matchesExp = !exp || (job.experience || "More than 0 year").includes(exp);
      const matchesLocation = !location || (job.isRemote ? "Remote" : job.domain) === location;
      const matchesSalary = !salary || job.salary === salary;
      const matchesDomain = !domain || (job.domain || "Engineering") === domain;
      return matchesSearch && matchesType && matchesExp && matchesLocation && matchesSalary && matchesDomain;
    })
    .sort((a, b) => {
      if (sort === "priority") {
        const pa = getPriority(a.company);
        const pb = getPriority(b.company);
        if (pa !== pb) return pa - pb;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sort === "salary") return Number(b.salary?.match(/\d+/)?.[0]) - Number(a.salary?.match(/\d+/)?.[0]);
      if (sort === "company") return (a.company || "").localeCompare(b.company || "");
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Job Discovery</h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">Browse curated opportunities and apply directly on the company website.</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Search by title, skill, company..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, sort: e.target.value }))}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="recent">Most Recent</option>
            <option value="relevance">Relevance</option>
            <option value="priority">Company Priority</option>
            <option value="salary">Salary</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Filters</h2>
            <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Clear all</button>
          </div>
          <FilterGroup title="Job Type">
            <div className="space-y-2">
              {JOB_TYPES.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={type === item} onChange={() => toggleParam("type", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  {item}
                </label>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Experience">
            <div className="space-y-2">
              {EXPERIENCES.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={exp === item} onChange={() => toggleParam("exp", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  {item}
                </label>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Location">
            <div className="space-y-2">
              {LOCATIONS.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={location === item} onChange={() => toggleParam("location", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  {item}
                </label>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Salary">
            <div className="space-y-2">
              {SALARIES.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={salary === item} onChange={() => toggleParam("salary", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  {item}
                </label>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Technical / Non-technical">
            <div className="space-y-2">
              {["Engineering", "Data", "Product", "Design", "Marketing", "Operations"].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={domain === item} onChange={() => toggleParam("domain", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  {item}
                </label>
              ))}
            </div>
          </FilterGroup>
        </aside>

        <section className="lg:col-span-9">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">{loading ? "Loading opportunities..." : `${filteredJobs.length} opportunities found`}</p>
            <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden text-sm text-blue-600 font-semibold">Filters</button>
          </div>
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900">No matching jobs yet</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                // <JobCard
                //   key={job.id}
                //   job={job}
                //   onApply={() => {
                //     window.open(job.url, "_blank", "noopener,noreferrer");
                //   }}
                // />

                <JobCard
  key={job.id}
  job={job}
  onApply={() => {
    // 1. Check if the property is named differently in your database (e.g., applyUrl, link)
    let targetUrl = job.url || job.applyUrl || job.link;

    if (!targetUrl) {
      console.error("No apply link found for this job:", job);
      alert("Application link is unavailable for this job.");
      return;
    }

    // 2. Add 'https://' if the URL doesn't already start with http:// or https://
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // 3. Open the formatted URL
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }}
/>
              ))}
            </div>
          )}
        </section>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-slate-500 hover:text-slate-900" aria-label="Close filters">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterGroup title="Job Type">
              <div className="space-y-2">
                {JOB_TYPES.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={type === item} onChange={() => toggleParam("type", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {item}
                  </label>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Experience">
              <div className="space-y-2">
                {EXPERIENCES.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={exp === item} onChange={() => toggleParam("exp", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {item}
                  </label>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Location">
              <div className="space-y-2">
                {LOCATIONS.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={location === item} onChange={() => toggleParam("location", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {item}
                  </label>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Salary">
              <div className="space-y-2">
                {SALARIES.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={salary === item} onChange={() => toggleParam("salary", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {item}
                  </label>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Technical / Non-technical">
              <div className="space-y-2">
                {["Engineering", "Data", "Product", "Design", "Marketing", "Operations"].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={domain === item} onChange={() => toggleParam("domain", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {item}
                  </label>
                ))}
              </div>
            </FilterGroup>
            <button onClick={() => { setMobileFiltersOpen(false); clearFilters(); }} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
              Apply filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}