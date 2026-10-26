// import React, { useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useJobs } from "../hooks/useJobs";
// import { useApp } from "../App";
// import JobCard from "../components/JobCard";
// import {
//   Briefcase, Search, ChevronDown, SlidersHorizontal, X, Check,
//   Building2, Clock3, MapPin, ExternalLink
// } from "lucide-react";

// const JOB_TYPES = ["Full Time", "Part Time", "Contract", "Internship"];
// const EXPERIENCES = ["0-1 years", "1-2 years", "2-4 years", "4+ years", "Freshers"];
// const SALARIES = ["Competitive", "2-4 LPA", "4-6 LPA", "6-10 LPA", "10-20 LPA", "20+ LPA", "$10-20/hr", "$20-30/hr", "$30+/hr"];
// const LOCATIONS = ["Remote", "Hybrid", "On-site", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Pune"];
// const SKILLS = ["React", "Node.js", "AWS", "SQL", "Python", "Data Analytics", "Product Management", "Marketing", "Finance", "HR"];

// export default function JobListPage() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const { jobs, loading } = useJobs();
//   const { companyPriorities } = useApp();
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

//   const q = searchParams.get("q") || "";
//   const type = searchParams.get("type") || "";
//   const exp = searchParams.get("exp") || "";
//   const location = searchParams.get("location") || "";
//   const salary = searchParams.get("salary") || "";
//   const domain = searchParams.get("domain") || "";
//   const sort = searchParams.get("sort") || "recent";

//   // Build a map of company name -> priority (lower number = higher priority)
//   const priorityMap = new Map();
//   companyPriorities.forEach((p) => {
//     if (p.enabled !== false) {
//       priorityMap.set((p.company || "").toLowerCase(), Number(p.priority) || 0);
//     }
//   });

//   const getPriority = (company) => priorityMap.get((company || "").toLowerCase()) ?? 999;

//   const toggleParam = (key, value) => {
//     const next = new URLSearchParams(searchParams);
//     if (next.get(key) === value) next.delete(key);
//     else next.set(key, value);
//     setSearchParams(next);
//   };

//   const filteredJobs = jobs
//     .filter((job) => {
//       const matchesSearch =
//         !q ||
//         [job.title, job.company, job.jd, job.domain, ...(job.skills || [])]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase()
//           .includes(q.toLowerCase());
//       const matchesType = !type || job.jobType === type;
//       const matchesExp = !exp || (job.experience || "More than 0 year").includes(exp);
//       const matchesLocation = !location || (job.isRemote ? "Remote" : job.domain) === location;
//       const matchesSalary = !salary || job.salary === salary;
//       const matchesDomain = !domain || (job.domain || "Engineering") === domain;
//       return matchesSearch && matchesType && matchesExp && matchesLocation && matchesSalary && matchesDomain;
//     })
//     .sort((a, b) => {
//       if (sort === "priority") {
//         const pa = getPriority(a.company);
//         const pb = getPriority(b.company);
//         if (pa !== pb) return pa - pb;
//         return (b.createdAt || 0) - (a.createdAt || 0);
//       }
//       if (sort === "salary") return Number(b.salary?.match(/\d+/)?.[0]) - Number(a.salary?.match(/\d+/)?.[0]);
//       if (sort === "company") return (a.company || "").localeCompare(b.company || "");
//       return (b.createdAt || 0) - (a.createdAt || 0);
//     });

//   const clearFilters = () => setSearchParams({});

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//       <div className="mb-8">
//         <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Job Discovery</h1>
//         <p className="text-slate-500 mt-2 text-sm sm:text-base">Browse curated opportunities and apply directly on the company website.</p>
//       </div>

//       <div className="flex items-center justify-between gap-4 mb-6">
//         <button
//           onClick={() => setMobileFiltersOpen(true)}
//           className="lg:hidden inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
//         >
//           <SlidersHorizontal className="w-4 h-4" />
//           Filters
//         </button>
//         <div className="flex items-center gap-3 flex-1 max-w-xl">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <input
//               value={q}
//               onChange={(e) => setSearchParams((prev) => ({ ...prev, q: e.target.value }))}
//               placeholder="Search by title, skill, company..."
//               className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//             />
//           </div>
//           <select
//             value={sort}
//             onChange={(e) => setSearchParams((prev) => ({ ...prev, sort: e.target.value }))}
//             className="border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//           >
//             <option value="recent">Most Recent</option>
//             <option value="relevance">Relevance</option>
//             <option value="priority">Company Priority</option>
//             <option value="salary">Salary</option>
//             <option value="company">Company</option>
//           </select>
//         </div>
//       </div>

//       <div className="lg:grid lg:grid-cols-12 gap-6 items-start">
//         <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
//           <div className="flex items-center justify-between">
//             <h2 className="font-bold text-slate-900">Filters</h2>
//             <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Clear all</button>
//           </div>
//           <FilterGroup title="Job Type">
//             <div className="space-y-2">
//               {JOB_TYPES.map((item) => (
//                 <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                   <input type="checkbox" checked={type === item} onChange={() => toggleParam("type", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                   {item}
//                 </label>
//               ))}
//             </div>
//           </FilterGroup>
//           <FilterGroup title="Experience">
//             <div className="space-y-2">
//               {EXPERIENCES.map((item) => (
//                 <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                   <input type="checkbox" checked={exp === item} onChange={() => toggleParam("exp", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                   {item}
//                 </label>
//               ))}
//             </div>
//           </FilterGroup>
//           <FilterGroup title="Location">
//             <div className="space-y-2">
//               {LOCATIONS.map((item) => (
//                 <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                   <input type="checkbox" checked={location === item} onChange={() => toggleParam("location", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                   {item}
//                 </label>
//               ))}
//             </div>
//           </FilterGroup>
//           <FilterGroup title="Salary">
//             <div className="space-y-2">
//               {SALARIES.map((item) => (
//                 <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                   <input type="checkbox" checked={salary === item} onChange={() => toggleParam("salary", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                   {item}
//                 </label>
//               ))}
//             </div>
//           </FilterGroup>
//           <FilterGroup title="Technical / Non-technical">
//             <div className="space-y-2">
//               {["Engineering", "Data", "Product", "Design", "Marketing", "Operations"].map((item) => (
//                 <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                   <input type="checkbox" checked={domain === item} onChange={() => toggleParam("domain", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                   {item}
//                 </label>
//               ))}
//             </div>
//           </FilterGroup>
//         </aside>

//         <section className="lg:col-span-9">
//           <div className="flex items-center justify-between mb-4">
//             <p className="text-sm text-slate-500">{loading ? "Loading opportunities..." : `${filteredJobs.length} opportunities found`}</p>
//             <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden text-sm text-blue-600 font-semibold">Filters</button>
//           </div>
//           {filteredJobs.length === 0 ? (
//             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
//               <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
//                 <Briefcase className="w-6 h-6 text-slate-400" />
//               </div>
//               <p className="font-semibold text-slate-900">No matching jobs yet</p>
//               <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
//               <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">Clear filters</button>
//             </div>
//           ) : (
//             <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//               {filteredJobs.map((job) => (
//                 // <JobCard
//                 //   key={job.id}
//                 //   job={job}
//                 //   onApply={() => {
//                 //     window.open(job.url, "_blank", "noopener,noreferrer");
//                 //   }}
//                 // />

//                 <JobCard
//   key={job.id}
//   job={job}
//   onApply={() => {
//     // 1. Check if the property is named differently in your database (e.g., applyUrl, link)
//     let targetUrl = job.url || job.applyUrl || job.link;

//     if (!targetUrl) {
//       console.error("No apply link found for this job:", job);
//       alert("Application link is unavailable for this job.");
//       return;
//     }

//     // 2. Add 'https://' if the URL doesn't already start with http:// or https://
//     if (!/^https?:\/\//i.test(targetUrl)) {
//       targetUrl = `https://${targetUrl}`;
//     }

//     // 3. Open the formatted URL
//     window.open(targetUrl, "_blank", "noopener,noreferrer");
//   }}
// />
//               ))}
//             </div>
//           )}
//         </section>
//       </div>

//       {mobileFiltersOpen && (
//         <div className="fixed inset-0 z-50">
//           <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileFiltersOpen(false)} />
//           <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="font-bold text-slate-900">Filters</h2>
//               <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-slate-500 hover:text-slate-900" aria-label="Close filters">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <FilterGroup title="Job Type">
//               <div className="space-y-2">
//                 {JOB_TYPES.map((item) => (
//                   <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                     <input type="checkbox" checked={type === item} onChange={() => toggleParam("type", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                     {item}
//                   </label>
//                 ))}
//               </div>
//             </FilterGroup>
//             <FilterGroup title="Experience">
//               <div className="space-y-2">
//                 {EXPERIENCES.map((item) => (
//                   <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                     <input type="checkbox" checked={exp === item} onChange={() => toggleParam("exp", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                     {item}
//                   </label>
//                 ))}
//               </div>
//             </FilterGroup>
//             <FilterGroup title="Location">
//               <div className="space-y-2">
//                 {LOCATIONS.map((item) => (
//                   <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                     <input type="checkbox" checked={location === item} onChange={() => toggleParam("location", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                     {item}
//                   </label>
//                 ))}
//               </div>
//             </FilterGroup>
//             <FilterGroup title="Salary">
//               <div className="space-y-2">
//                 {SALARIES.map((item) => (
//                   <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                     <input type="checkbox" checked={salary === item} onChange={() => toggleParam("salary", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                     {item}
//                   </label>
//                 ))}
//               </div>
//             </FilterGroup>
//             <FilterGroup title="Technical / Non-technical">
//               <div className="space-y-2">
//                 {["Engineering", "Data", "Product", "Design", "Marketing", "Operations"].map((item) => (
//                   <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
//                     <input type="checkbox" checked={domain === item} onChange={() => toggleParam("domain", item)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
//                     {item}
//                   </label>
//                 ))}
//               </div>
//             </FilterGroup>
//             <button onClick={() => { setMobileFiltersOpen(false); clearFilters(); }} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
//               Apply filters
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function FilterGroup({ title, children }) {
//   return (
//     <div>
//       <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{title}</h3>
//       <div className="space-y-2">{children}</div>
//     </div>
//   );
// }













import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";
import { useApp } from "../App";
import JobCard from "../components/JobCard";
import { normalizeSkills } from "../utils/skills";
import { withSource } from "../utils/applyLink";
import {
  Briefcase, Search, ChevronDown, SlidersHorizontal, X, Check,
  Building2, Clock3, MapPin, ExternalLink, CalendarDays
} from "lucide-react";

const JOB_TYPES = ["Full Time", "Part Time", "Contract", "Internship"];
const EXPERIENCES = ["0-1 years", "1-2 years", "2-4 years", "4+ years", "Freshers"];
const SALARIES = ["Competitive", "2-4 LPA", "4-6 LPA", "6-10 LPA", "10-20 LPA", "20+ LPA", "$10-20/hr", "$20-30/hr", "$30+/hr"];
const LOCATIONS = ["Remote", "Hybrid", "On-site", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Pune"];
const SKILLS = ["React", "Node.js", "AWS", "SQL", "Python", "Data Analytics", "Product Management", "Marketing", "Finance", "HR"];

// Fixture for the new date-added filter.
const DATE_ADDED_OPTIONS = [
  { value: "all", label: "Anytime" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
];

export default function JobListPage({ defaultLocation = "", pageTitle = "Job Discovery", showHero = false } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, loading } = useJobs();
  const { companyPriorities } = useApp();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const exp = searchParams.get("exp") || "";
  const location = searchParams.get("location") || defaultLocation;
  const salary = searchParams.get("salary") || "";
  const domain = searchParams.get("domain") || "";
  const sort = searchParams.get("sort") || "recent";
  const [dateAdded, setDateAdded] = useState(() => searchParams.get("dateAdded") ?? "all");
  const [customDate, setCustomDate] = useState("");

  // Build a map of company name -> priority (lower number = higher priority)
  const priorityMap = new Map();
  if (companyPriorities) {
    companyPriorities.forEach((p) => {
      if (p.enabled !== false) {
        priorityMap.set((p.company || "").toLowerCase(), Number(p.priority) || 0);
      }
    });
  }

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
        [job.title, job.company, job.jd, job.domain, ...normalizeSkills(job.skills)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      const matchesType = !type || job.jobType === type;
      const matchesExp = !exp || (job.experience || "More than 0 year").includes(exp);
      const matchesLocation = !location || (job.isRemote ? "Remote" : job.domain) === location;
      const matchesSalary = !salary || job.salary === salary;
      const matchesDomain = !domain || (job.domain || "Engineering") === domain;
      if (!matchesSearch || !matchesType || !matchesExp || !matchesLocation || !matchesSalary || !matchesDomain) return false;
      // --- Filter by date added ------------------------------------------------
      const createdAtMs = Number(job.createdAt ?? 0);
      if (!Number.isFinite(createdAtMs)) return true; // unknown dates pass through
      const dayKey = new Date(createdAtMs).toISOString().slice(0, 10); // YYYY-MM-DD UTC
      if (dateAdded === "all" || dateAdded === "") return true;
      if (dateAdded === "today") return dayKey === new Date().toISOString().slice(0, 10);
      if (dateAdded === "yesterday") {
        const nowDay = new Date().toISOString().slice(0, 10);
        const yesterdayDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        return dayKey === yesterdayDay;
      }
      // "custom": compare against user-typed date "YYYY-MM-DD".
      return dayKey === customDate;
    })
    .sort((a, b) => {
      if (sort === "priority") {
        const pa = getPriority(a.company);
        const pb = getPriority(b.company);
        if (pa !== pb) return pa - pb;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sort === "salary") return Number(b.salary?.match(/\d+/)?.[0] || 0) - Number(a.salary?.match(/\d+/)?.[0] || 0);
      if (sort === "company") return (a.company || "").localeCompare(b.company || "");
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  const clearFilters = () => {
    if (customDate) {
      const next = new URLSearchParams(searchParams);
      next.delete("dateAdded");
      setSearchParams(next, { replace: true });
      setCustomDate("");
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">Browse curated opportunities and apply directly on the company website.</p>
      </div>

      {showHero && (
        <div className="mb-10 rounded-2xl border border-slate-200 bg-[#F7F6F3] px-6 sm:px-10 py-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              5000+ jobs available · Updated today
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Find Jobs Across the Internet
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
              Remote job listings pulled from company career pages and job boards into one search, so you can spend less time searching and more time applying.
            </p>

            <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center p-2 mb-10">
              <div className="flex items-center gap-2 flex-1 pl-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input placeholder="Job title, skill, or company..." className="w-full py-2 text-sm text-slate-700 focus:outline-none" />
              </div>
              <div className="w-px h-8 bg-slate-200 mx-1" />
              <div className="flex items-center gap-2 flex-1 pl-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <input placeholder="India" className="w-full py-2 text-sm text-slate-700 focus:outline-none" />
              </div>
              <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Search
              </button>
            </div>

            <div className="w-full max-w-3xl">
              <div className="relative">
                <div className="absolute top-4 left-0 right-0 h-px border-t-2 border-dashed border-slate-300" />
                <div className="grid grid-cols-3 gap-4 relative">
                  {[
                    { n: 1, title: "Search", text: "Fresh roles aggregated from across the web" },
                    { n: 2, title: "Go to the source", text: "We redirect you to the original job posting" },
                    { n: 3, title: "Apply direct", text: "Apply straight to the employer — no middleman" },
                  ].map((step) => (
                    <div key={step.n} className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-3 relative">
                        {step.n === 1 && <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
                        {step.n === 2 && <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>}
                        {step.n === 3 && <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">{step.n}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-slate-500 max-w-[160px]">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-8 text-xs text-slate-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6z"></path></svg>
              AI-ranked matches & ad-free browsing — <span className="font-semibold">Coming soon</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative w-[7.5rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Search..."
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
          <label className="relative cursor-pointer border-b border-transparent bg-transparent px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 transition-colors select-none">
            Date added
            <span className="absolute inset-y-0 right-0 w-6 px-2 text-[10px] font-bold leading-5 bg-slate-200 text-slate-700 transform rotate-180 rounded-full shadow-xs" aria-hidden>▾</span>
          </label>
          <select
            value={dateAdded}
            onChange={(e) => {
              const next = e.target.value;
              const newParams = new URLSearchParams(searchParams);
              if (next === "all") newParams.delete("dateAdded");
              else newParams.set("dateAdded", next);
              setSearchParams(newParams);
            }}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {DATE_ADDED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            max={new Date().toISOString().slice(0, 10)}
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            aria-label="Custom date"
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-auto min-w-[6.25rem]"
          />
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
          {customDate && <p className="mt-2 mb-6 text-xs text-slate-500">Showing jobs added on {customDate} only</p>}
          {dateAdded !== "all" && dateAdded !== "" && !customDate && (
            <p className="mb-6 text-xs text-slate-500">Showing jobs added {DATE_ADDED_OPTIONS.find((o) => o.value === dateAdded)?.label}</p>
          )}
          
          {/* --- LOADING AND EMPTY STATE LOGIC UPDATE --- */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-semibold text-slate-900">Fetching latest opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
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
              {filteredJobs.map((job) => {
                // Formatting the URL for the external application link
                let targetUrl = job.url || job.applyUrl || job.link || "";
                if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
                  targetUrl = `https://${targetUrl}`;
                }

                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={() => {
                      if (!targetUrl) {
                        alert("Application link is unavailable for this job.");
                        return;
                      }
                      window.open(withSource(targetUrl), "_blank", "noopener,noreferrer");
                    }}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <aside className="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close filters">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
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
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={clearFilters} className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors">
                Clear all
              </button>
              <button onClick={() => { setMobileFiltersOpen(false); clearFilters(); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
                Apply filters
              </button>
            </div>
          </aside>
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