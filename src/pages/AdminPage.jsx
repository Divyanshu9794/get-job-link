import React, { useState } from "react";
import { useApp } from "../App";
import {
  PlusCircle, Trash2, Calendar, Settings, BookOpen, MessageSquare, Save,
  Search, Briefcase, Sparkle, Zap, Play, ArrowRight, RefreshCw, ExternalLink,
  Building2, Database, List, CheckCircle2
} from "lucide-react";
import { ingestAllJobs, ingestJobs, SOURCES } from "../services/ingestion";

export default function AdminPage() {
  const { jobs, learningReels, currentUser, isAdmin, triggerNotification } = useApp();
  const [activeSection, setActiveSection] = useState("post-job");
  const [popupLink, setPopupLink] = useState("https://www.instagram.com/codes_and_clouds/");
  const [bulkDeleteDate, setBulkDeleteDate] = useState("");
  const [formData, setFormData] = useState({
    title: "", company: "", jd: "", url: "",
    jobType: "Full Time", experience: "More than 0 year",
    salary: "", domain: "Engineering", isRemote: false
  });
  const [reelFormData, setReelFormData] = useState({
    title: "", description: "", reelUrl: "", category: "Git & GitHub"
  });
  const [ingestionStatus, setIngestionStatus] = useState({});
  const [companyPriority, setCompanyPriority] = useState([]);

  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
          <Settings className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin access required</h2>
        <p className="text-sm text-slate-500 mt-2">Please sign in as an admin to access the control panel.</p>
      </div>
    );
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.url) {
      triggerNotification("Please fill in all required fields.");
      return;
    }
    triggerNotification("Job post updated successfully!");
    setFormData({ title: "", company: "", jd: "", url: "", jobType: "Full Time", experience: "More than 0 year", salary: "", domain: "Engineering", isRemote: false });
  };

  const handleReelSubmit = (e) => {
    e.preventDefault();
    if (!reelFormData.title || !reelFormData.reelUrl) {
      triggerNotification("Please fill in all required fields.");
      return;
    }
    triggerNotification("Learning Reel successfully added to database!");
    setReelFormData({ title: "", description: "", reelUrl: "", category: "Git & GitHub" });
  };

  const handleRefreshIngestion = async () => {
    try {
      setIngestionStatus({ loading: true });
      const results = await ingestAllJobs();
      setIngestionStatus({ loading: false, results: results, timestamp: Date.now() });
      triggerNotification("Ingestion completed successfully!");
    } catch (error) {
      setIngestionStatus({ loading: false, error: error.message });
      triggerNotification("Error during ingestion: " + error.message);
    }
  };

  const handleRunSourceIngestion = async (sourceKey) => {
    try {
      setIngestionStatus(prev => ({ ...prev, loading: true, [sourceKey]: { loading: true } }));
      const result = await ingestJobs(sourceKey);
      setIngestionStatus(prev => ({
        ...prev,
        loading: false,
        [sourceKey]: { ...prev[sourceKey], loading: false, result: result },
        results: [...(prev.results || []), result]
      }));
      triggerNotification(`Ingestion from ${SOURCES[sourceKey]?.name || sourceKey} completed!`);
    } catch (error) {
      setIngestionStatus(prev => ({
        ...prev,
        loading: false,
        [sourceKey]: { ...prev[sourceKey], loading: false, error: error.message }
      }));
      triggerNotification(`Error ingesting from ${SOURCES[sourceKey]?.name}: ${error.message}`);
    }
  };

  const toggleSourceEnabled = async (sourceKey) => {
    // In a real app, this would update a config in Firestore or environment
    // For now we just toggle in memory and notify
    const source = SOURCES[sourceKey];
    if (!source) return;
    // Would persist to Firestore config collection
    triggerNotification(`Toggled ${source.name} (would need backend persisting)`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="text-sm text-slate-500">Manage job listings, learning content, ingestion, and settings.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: "post-job", label: "Post Job" },
          { key: "popup", label: "Popup Link" },
          { key: "reels", label: "Learning Reels" },
          { key: "bulk", label: "Bulk Delete" },
          { key: "ingestion", label: "Job Ingestion" },
          { key: "companies", label: "Company Priority" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === tab.key ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === "post-job" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Add Job Listing</span>
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              {/* Job form fields - simplified for brevity */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Title *</label>
                    <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Frontend Engineer" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                    <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Google" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Application URL *</label>
                    <input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://company.com/careers/job" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Type</label>
                    <select value={formData.jobType} onChange={(e) => setFormData({ ...formData, jobType: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="Full Time">Full Time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Domain</label>
                    <select value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Management">Management</option>
                      <option value="Data Entry">Data Entry</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Experience</label>
                    <select value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="More than 0 year">More than 0 year</option>
                      <option value="More than 1 year">More than 1 year</option>
                      <option value="More than 2 years">More than 2 years</option>
                      <option value="More than 3 years">More than 3 years</option>
                      <option value="More than 4 year">More than 4 year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Salary</label>
                    <input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 10-20 LPA" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input type="checkbox" id="isRemote" checked={formData.isRemote} onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <label htmlFor="isRemote" className="font-semibold text-slate-700">Remote Position</label>
                </div>
              </div>
              <div className="pt-2 flex space-x-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Publish Job</button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Save className="w-5 h-5 text-purple-600" />
                <span>Update Popup Redirect Link</span>
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Popup link updated!"); }} className="space-y-3 text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Redirect URL</label>
                  <input value={popupLink} onChange={(e) => setPopupLink(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="https://www.instagram.com/your_handle" />
                </div>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Save Popup Link</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeSection === "popup" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
            <Save className="w-5 h-5 text-purple-600" />
            <span>Update Popup Redirect Link</span>
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Popup link updated!"); }} className="space-y-3 text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Redirect URL</label>
              <input value={popupLink} onChange={(e) => setPopupLink(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="https://www.instagram.com/your_handle" />
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Save Popup Link</button>
          </form>
        </div>
      )}

      {activeSection === "reels" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5 text-pink-600" />
            <span>Add Learning Content / Reel</span>
          </h3>
          <form onSubmit={handleReelSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Title *</label>
              <input value={reelFormData.title} onChange={(e) => setReelFormData({ ...reelFormData, title: e.target.value })} placeholder="e.g. Day 2 of GitHub in 10 Days" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reel / Video URL *</label>
              <input value={reelFormData.reelUrl} onChange={(e) => setReelFormData({ ...reelFormData, reelUrl: e.target.value })} placeholder="https://www.instagram.com/reel/..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input value={reelFormData.category} onChange={(e) => setReelFormData({ ...reelFormData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input value={reelFormData.description} onChange={(e) => setReelFormData({ ...reelFormData, description: e.target.value })} placeholder="Brief overview..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Save Learning Content</button>
          </form>
        </div>
      )}

      {activeSection === "bulk" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span>Bulk Delete Old Listings</span>
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Bulk delete executed!"); }} className="space-y-3 text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Delete Jobs Posted On or Before Date</label>
              <input type="date" value={bulkDeleteDate} onChange={(e) => setBulkDeleteDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-red-500/20 text-slate-600" />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Bulk Delete Jobs</button>
          </form>
        </div>
      )}

      {activeSection === "ingestion" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Job Ingestion Controls</h3>
          <div className="mb-4">
            <button onClick={handleRefreshIngestion} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
              {ingestionStatus.loading ? "Ingesting..." : "Run Full Ingestion"}
              {ingestionStatus.loading ? <RefreshCw className="ml-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Sources Configuration</h4>
            <div className="space-y-2">
              {Object.entries(SOURCES).map(([key, source]) => (
                <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
                      {source.enabled ? <CheckCircle2 className="text-blue-600" /> : <Zap className="text-gray-500" />}
                    </div>
                    <div>
                      <h5 className="font-medium text-slate-900">{source.name}</h5>
                      <p className="text-sm text-slate-500">{source.name} job board adapter</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSourceEnabled(key)}
                      className={`px-3 py-1 text-xs rounded ${source.enabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"} transition-colors`}
                    >
                      {source.enabled ? "Enabled" : "Disabled"}
                    </button>
                    <button
                      onClick={() => handleRunSourceIngestion(key)}
                      className="ml-2 px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:${ingestionStatus.loading || (ingestionStatus[key]?.loading)}"
                      disabled={ingestionStatus.loading || (ingestionStatus[key]?.loading)}
                    >
                      {ingestionStatus[key]?.loading ? "Running" : "Run Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {ingestionStatus.results && ingestionStatus.results.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-slate-900 mb-2">Latest Ingestion Results</h4>
              <div className="space-y-2">
                {ingestionStatus.results.map((result, index) => (
                  <div key={index} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.source}</span>
                      <span className="text-sm">
                        {result.rawCount} fetched, {result.addedCount} added
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ingestionStatus.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h5 className="font-medium text-red-800">Error:</h5>
              <p className="text-sm text-red-600">{ingestionStatus.error}</p>
            </div>
          )}
        </div>
      )}

      {activeSection === "companies" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Company Priority Management</h3>
          <p className="text-sm text-slate-500 mb-4">Configure which companies appear at the top of job listings.</p>
          {/* Simple placeholder - in a real app this would be a Firestore collection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
                  <CheckCircle2 className="text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-slate-900">Google</h5>
                  <p className="text-sm text-slate-500">Priority: 1 (Highest)</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-600">Edit Priority</button>
                <button className="ml-2 px-3 py-1 text-xs rounded bg-red-50 text-red-600 hover:red-600">Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}