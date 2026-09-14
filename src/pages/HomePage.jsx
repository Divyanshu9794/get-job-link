import { useState } from "react";
import { useJobs } from "../hooks/useJobs";
import { Link } from "react-router-dom";
import { Briefcase, Globe, BookOpen, PlusCircle, Settings } from "lucide-react";
import logoImg from "../assets/logo.jpeg";
import { useEffect } from "react";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const { jobs, loading } = useJobs();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jd?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain ? job.domain === selectedDomain : true;
    return matchesSearch && matchesDomain;
  }).slice(0, 6); // Show 6 featured jobs

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col justify-between">
      {/* Instamodal and learning banner would be handled by App shell */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Find Your Next Opportunity
              </h1>
              <p className="text-lg text-slate-600">
                Discover verified tech and non-tech jobs from top companies, all in one place.
              </p>

              {/* Search Bar */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div>
                  <input
                    type="text"
                    placeholder="Job title, skill, or keyword"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Location (optional)</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (searchTerm) params.set("q", searchTerm);
                      if (selectedDomain) params.set("location", selectedDomain);
                      window.location.href = `/jobs?${params.toString()}`;
                    }}
                    className="w-full bg-blue-600 text-white px-6 py-3 font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search Jobs
                  </button>
                </div>
              </div>

              {/* Quick Filter Chips */}
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="text-sm text-slate-500">Quick filters:</span>
                {[
                  "Software Engineering",
                  "Data & AI",
                  "Product",
                  "Design",
                  "Cybersecurity",
                  "Cloud",
                  "DevOps",
                  "Business",
                  "Finance",
                  "HR",
                  "Marketing",
                  "Operations",
                  "Freshers"
                ].map((filter, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // For simplicity, just navigate to jobs page with filter
                      const params = new URLSearchParams();
                      if (filter) params.set("domain", filter.toLowerCase().replace(/[ &]/g, "-"));
                      window.location.href = `/jobs?${params.toString()}`;
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border border-slate-200 hover:bg-slate-100 transition-colors`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Featured Jobs Preview */}
              {!loading && filteredJobs.length > 0 && (
                <>
                  <h2 className="mt-8 text-lg font-semibold text-slate-900">
                    Featured Opportunities
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
                      <Link
                        key={job.id}
                        to={`/job/${job.id}`}
                        className="group"
                      >
                        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group-hover:shadow-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-slate-900">{job.title}</h3>
                              <p className="text-sm text-blue-600">{job.company}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              job.isRemote ? "bg-emerald-100 text-emerald-800" :
                              job.domain === "Hybrid" ? "bg-blue-100 text-blue-800" :
                              "bg-slate-100 text-slate-700"
                            }`}>
                              {job.isRemote ? "Remote" : job.domain === "Hybrid" ? "Hybrid" : "On-site"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                            {job.jd?.substring(0, 100)}...
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[
                              job.jobType || "Full Time",
                              job.experience || "More than 0 year",
                              job.salary || "Competitive"
                            ].map((badge, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded"
                              >
                                {badge}
                              }
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar Stats & CTAs */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <Briefcase className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-sm text-slate-500">
                    {jobs.length}+ Active Opportunities
                  </p>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/jobs"
                    className="w-full bg-blue-600 text-white px-5 py-3 font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    Explore All Jobs
                  </Link>

                  <Link
                    to="/resume"
                    className="w-full border-2 border-dashed border-blue-500 text-blue-600 px-5 py-3 font-medium rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Build Your Resume
                  </Link>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-slate-400 mr-2" />
                    <span>Global opportunities with direct apply links</span>
                  </div>
                  <div className="flex items-center">
                    <PlusCircle className="w-4 h-4 text-slate-400 mr-2" />
                    <span>Updated daily with verified listings</span>
                  </div>
                  <div class="flex items-center">
                    <Settings className="w-4 h-4 text-slate-400 mr-2" />
                    <span>Admin dashboard for job management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}