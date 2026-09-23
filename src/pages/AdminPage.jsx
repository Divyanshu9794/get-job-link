// import React, { useState, useEffect } from "react";
// import { useApp } from "../App";
// import { collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "../firebase";
// import {
//   PlusCircle, Trash2, Calendar, Settings, BookOpen, MessageSquare, Save,
//   Search, Briefcase, Sparkle, Zap, Play, ArrowRight, RefreshCw, ExternalLink,
//   Building2, Database, List, CheckCircle2, Bell, BellOff, ArrowUpCircle
// } from "lucide-react";
// import { ingestAllJobs, ingestJobs, SOURCES } from "../services/ingestion";

// export default function AdminPage() {
//   const { jobs, learningReels, currentUser, isAdmin, triggerNotification, toggleSourceConfig, companyPriorities, addCompanyPriority, updateCompanyPriority, removeCompanyPriority, sourceConfigs } = useApp();
//   const [activeSection, setActiveSection] = useState("post-job");
//   const [popupLink, setPopupLink] = useState("https://www.instagram.com/codes_and_clouds/");
//   const [bulkDeleteDate, setBulkDeleteDate] = useState("");
//   const [formData, setFormData] = useState({
//     title: "", company: "", jd: "", url: "",
//     jobType: "Full Time", experience: "More than 0 year",
//     salary: "", domain: "Engineering", isRemote: false
//   });
//   const [reelFormData, setReelFormData] = useState({
//     title: "", description: "", reelUrl: "", category: "Git & GitHub"
//   });
//   const [ingestionStatus, setIngestionStatus] = useState({});
//   const [newCompany, setNewCompany] = useState("");
//   const [newPriority, setNewPriority] = useState("");
//   const [newJobsCount, setNewJobsCount] = useState(0);
//   const [newJobsList, setNewJobsList] = useState([]);
//   const [checkingNewJobs, setCheckingNewJobs] = useState(false);
//   const [lastVisitTime, setLastVisitTime] = useState(null);

//   if (!currentUser || !isAdmin) {
//     return (
//       <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
//         <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
//           <Settings className="w-8 h-8 text-red-600" />
//         </div>
//         <h2 className="text-xl font-bold text-slate-900">Admin access required</h2>
//         <p className="text-sm text-slate-500 mt-2">Please sign in as an admin to access the control panel.</p>
//       </div>
//     );
//   }

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.company || !formData.url) {
//       triggerNotification("Please fill in all required fields.");
//       return;
//     }
//     try {
//       await addDoc(collection(db, "jobs"), {
//         ...formData,
//         date: new Date().toISOString().split("T")[0],
//         createdAt: Date.now()
//       });
//       triggerNotification("Job post added successfully!");
//       setFormData({ title: "", company: "", jd: "", url: "", jobType: "Full Time", experience: "More than 0 year", salary: "", domain: "Engineering", isRemote: false });
//     } catch (error) {
//       triggerNotification("Error publishing job post: " + error.message);
//     }
//   };

//   const handleReelSubmit = (e) => {
//     e.preventDefault();
//     if (!reelFormData.title || !reelFormData.reelUrl) {
//       triggerNotification("Please fill in all required fields.");
//       return;
//     }
//     triggerNotification("Learning Reel successfully added to database!");
//     setReelFormData({ title: "", description: "", reelUrl: "", category: "Git & GitHub" });
//   };

//   const handleRefreshIngestion = async () => {
//     try {
//       setIngestionStatus({ loading: true });
//       const results = await ingestAllJobs();
//       setIngestionStatus({ loading: false, results: results, timestamp: Date.now() });
//       triggerNotification("Ingestion completed successfully!");
//     } catch (error) {
//       setIngestionStatus({ loading: false, error: error.message });
//       triggerNotification("Error during ingestion: " + error.message);
//     }
//   };

//   const handleRunSourceIngestion = async (sourceKey) => {
//     try {
//       setIngestionStatus(prev => ({ ...prev, loading: true, [sourceKey]: { loading: true } }));
//       const result = await ingestJobs(sourceKey);
//       setIngestionStatus(prev => ({
//         ...prev,
//         loading: false,
//         [sourceKey]: { ...prev[sourceKey], loading: false, result: result },
//         results: [...(prev.results || []), result]
//       }));
//       triggerNotification(`Ingestion from ${SOURCES[sourceKey]?.name || sourceKey} completed!`);
//     } catch (error) {
//       setIngestionStatus(prev => ({
//         ...prev,
//         loading: false,
//         [sourceKey]: { ...prev[sourceKey], loading: false, error: error.message }
//       }));
//       triggerNotification(`Error ingesting from ${SOURCES[sourceKey]?.name}: ${error.message}`);
//     }
//   };

//   const toggleSourceEnabled = async (sourceKey) => {
//     await toggleSourceConfig(sourceKey);
//   };

//   // Track last visit and count new jobs since that visit
//   const refreshLastVisit = async () => {
//     if (!currentUser) return;
//     const userRef = doc(db, "userActivity", currentUser.uid);
//     await setDoc(userRef, { lastVisit: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
//     setLastVisitTime(Date.now());
//   };

//   const checkNewJobs = async () => {
//     if (!currentUser) return;
//     setCheckingNewJobs(true);
//     try {
//       const userRef = doc(db, "userActivity", currentUser.uid);
//       const userSnap = await getDoc(userRef);
//       const lastVisit = userSnap.exists() ? (userSnap.data().lastVisit?.toMillis?.() || 0) : 0;
//       setLastVisitTime(lastVisit);

//       const jobsRef = collection(db, "jobs");
//       const q = query(jobsRef, where("createdAt", ">", lastVisit));
//       const snap = await getDocs(q);
//       const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//       setNewJobsList(jobs);
//       setNewJobsCount(jobs.length);

//       if (jobs.length > 0) {
//         triggerNotification(`You have ${jobs.length} new job${jobs.length > 1 ? "s" : ""} since your last visit.`);
//       }
//     } catch (e) {
//       console.error("checkNewJobs error:", e);
//       triggerNotification("Failed to check new jobs: " + e.message);
//     } finally {
//       setCheckingNewJobs(false);
//     }
//   };

//   const dismissNewJobs = async () => {
//     await refreshLastVisit();
//     setNewJobsCount(0);
//     setNewJobsList([]);
//     triggerNotification("New jobs dismissed — last visit updated.");
//   };

//   useEffect(() => {
//     const loadLastVisit = async () => {
//       if (!currentUser) return;
//       try {
//         const userRef = doc(db, "userActivity", currentUser.uid);
//         const snap = await getDoc(userRef);
//         if (snap.exists()) {
//           const data = snap.data();
//           setLastVisitTime(data.lastVisit?.toMillis?.() || null);
//         }
//       } catch (e) {
//         console.error("loadLastVisit error:", e);
//       }
//     };
//     loadLastVisit();
//     checkNewJobs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentUser]);

//   // Update last visit after ingestion completes so subsequent visits show only fresh jobs
//   useEffect(() => {
//     if (ingestionStatus.results && ingestionStatus.results.length > 0 && !ingestionStatus.loading) {
//       refreshLastVisit();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ingestionStatus.results]);


// import React, { useState, useEffect } from "react";
// import { useApp } from "../App";
// import { collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "../firebase";
// import {
//   PlusCircle, Trash2, Calendar, Settings, BookOpen, MessageSquare, Save,
//   Search, Briefcase, Sparkle, Zap, Play, ArrowRight, RefreshCw, ExternalLink,
//   Building2, Database, List, CheckCircle2, Bell, BellOff, ArrowUpCircle
// } from "lucide-react";
// import { ingestAllJobs, ingestJobs, SOURCES } from "../services/ingestion";

// export default function AdminPage() {
//   const { jobs, learningReels, currentUser, isAdmin, triggerNotification, toggleSourceConfig, companyPriorities, addCompanyPriority, updateCompanyPriority, removeCompanyPriority, sourceConfigs } = useApp();
//   const [activeSection, setActiveSection] = useState("post-job");
//   const [popupLink, setPopupLink] = useState("https://www.instagram.com/codes_and_clouds/");
//   const [bulkDeleteDate, setBulkDeleteDate] = useState("");
//   const [formData, setFormData] = useState({
//     title: "", company: "", jd: "", url: "",
//     jobType: "Full Time", experience: "More than 0 year",
//     salary: "", domain: "Engineering", isRemote: false
//   });
//   const [reelFormData, setReelFormData] = useState({
//     title: "", description: "", reelUrl: "", category: "Git & GitHub"
//   });
//   const [ingestionStatus, setIngestionStatus] = useState({});
//   const [newCompany, setNewCompany] = useState("");
//   const [newPriority, setNewPriority] = useState("");
//   const [newJobsCount, setNewJobsCount] = useState(0);
//   const [newJobsList, setNewJobsList] = useState([]);
//   const [checkingNewJobs, setCheckingNewJobs] = useState(false);
//   const [lastVisitTime, setLastVisitTime] = useState(null);

//   // Define all functions first
//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.company || !formData.url) {
//       triggerNotification("Please fill in all required fields.");
//       return;
//     }
//     try {
//       await addDoc(collection(db, "jobs"), {
//         ...formData,
//         date: new Date().toISOString().split("T")[0],
//         createdAt: Date.now()
//       });
//       triggerNotification("Job post added successfully!");
//       setFormData({ title: "", company: "", jd: "", url: "", jobType: "Full Time", experience: "More than 0 year", salary: "", domain: "Engineering", isRemote: false });
//     } catch (error) {
//       triggerNotification("Error publishing job post: " + error.message);
//     }
//   };

//   const handleReelSubmit = (e) => {
//     e.preventDefault();
//     if (!reelFormData.title || !reelFormData.reelUrl) {
//       triggerNotification("Please fill in all required fields.");
//       return;
//     }
//     triggerNotification("Learning Reel successfully added to database!");
//     setReelFormData({ title: "", description: "", reelUrl: "", category: "Git & GitHub" });
//   };

//   const handleRefreshIngestion = async () => {
//     try {
//       setIngestionStatus({ loading: true });
//       const results = await ingestAllJobs();
//       setIngestionStatus({ loading: false, results: results, timestamp: Date.now() });
//       triggerNotification("Ingestion completed successfully!");
//     } catch (error) {
//       setIngestionStatus({ loading: false, error: error.message });
//       triggerNotification("Error during ingestion: " + error.message);
//     }
//   };

//   const handleRunSourceIngestion = async (sourceKey) => {
//     try {
//       setIngestionStatus(prev => ({ ...prev, loading: true, [sourceKey]: { loading: true } }));
//       const result = await ingestJobs(sourceKey);
//       setIngestionStatus(prev => ({
//         ...prev,
//         loading: false,
//         [sourceKey]: { ...prev[sourceKey], loading: false, result: result },
//         results: [...(prev.results || []), result]
//       }));
//       triggerNotification(`Ingestion from ${SOURCES[sourceKey]?.name || sourceKey} completed!`);
//     } catch (error) {
//       setIngestionStatus(prev => ({
//         ...prev,
//         loading: false,
//         [sourceKey]: { ...prev[sourceKey], loading: false, error: error.message }
//       }));
//       triggerNotification(`Error ingesting from ${SOURCES[sourceKey]?.name}: ${error.message}`);
//     }
//   };

//   const toggleSourceEnabled = async (sourceKey) => {
//     await toggleSourceConfig(sourceKey);
//   };

//   const refreshLastVisit = async () => {
//     if (!currentUser) return;
//     const userRef = doc(db, "userActivity", currentUser.uid);
//     await setDoc(userRef, { lastVisit: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
//     setLastVisitTime(Date.now());
//   };

//   const checkNewJobs = async () => {
//     if (!currentUser) return;
//     setCheckingNewJobs(true);
//     try {
//       const userRef = doc(db, "userActivity", currentUser.uid);
//       const userSnap = await getDoc(userRef);
//       const lastVisit = userSnap.exists() ? (userSnap.data().lastVisit?.toMillis?.() || 0) : 0;
//       setLastVisitTime(lastVisit);

//       const jobsRef = collection(db, "jobs");
//       const q = query(jobsRef, where("createdAt", ">", lastVisit));
//       const snap = await getDocs(q);
//       const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//       setNewJobsList(jobs);
//       setNewJobsCount(jobs.length);

//       if (jobs.length > 0) {
//         triggerNotification(`You have ${jobs.length} new job${jobs.length > 1 ? "s" : ""} since your last visit.`);
//       }
//     } catch (e) {
//       console.error("checkNewJobs error:", e);
//       triggerNotification("Failed to check new jobs: " + e.message);
//     } finally {
//       setCheckingNewJobs(false);
//     }
//   };

//   const dismissNewJobs = async () => {
//     await refreshLastVisit();
//     setNewJobsCount(0);
//     setNewJobsList([]);
//     triggerNotification("New jobs dismissed — last visit updated.");
//   };

//   // Declare all useEffects BEFORE any early returns
//   useEffect(() => {
//     const loadLastVisit = async () => {
//       if (!currentUser) return;
//       try {
//         const userRef = doc(db, "userActivity", currentUser.uid);
//         const snap = await getDoc(userRef);
//         if (snap.exists()) {
//           const data = snap.data();
//           setLastVisitTime(data.lastVisit?.toMillis?.() || null);
//         }
//       } catch (e) {
//         console.error("loadLastVisit error:", e);
//       }
//     };
//     loadLastVisit();
//     checkNewJobs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentUser]);

//   useEffect(() => {
//     if (ingestionStatus.results && ingestionStatus.results.length > 0 && !ingestionStatus.loading) {
//       refreshLastVisit();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ingestionStatus.results]);

//   // MOVED HERE: Early return AFTER all hooks have safely initialized
//   if (!currentUser || !isAdmin) {
//     return (
//       <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
//         <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
//           <Settings className="w-8 h-8 text-red-600" />
//         </div>
//         <h2 className="text-xl font-bold text-slate-900">Admin access required</h2>
//         <p className="text-sm text-slate-500 mt-2">Please sign in as an admin to access the control panel.</p>
//       </div>
//     );
//   }



//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
//           <p className="text-sm text-slate-500">Manage job listings, learning content, ingestion, and settings.</p>
//         </div>
//       </div>

//       {/* Navigation Tabs */}
//       <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
//         {[
//           { key: "post-job", label: "Post Job" },
//           { key: "popup", label: "Popup Link" },
//           { key: "reels", label: "Learning Reels" },
//           { key: "bulk", label: "Bulk Delete" },
//           { key: "ingestion", label: "Job Ingestion" },
//           { key: "companies", label: "Company Priority" },
//           { key: "new-jobs", label: "New Jobs" }
//         ].map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveSection(tab.key)}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === tab.key ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100"}`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Content Sections */}
//       {activeSection === "post-job" && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
//             <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
//               <PlusCircle className="w-5 h-5 text-blue-600" />
//               <span>Add Job Listing</span>
//             </h3>
//             <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
//               {/* Job form fields - simplified for brevity */}
//               <div className="space-y-3">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block font-bold text-slate-700 mb-1">Job Title *</label>
//                     <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Frontend Engineer" />
//                   </div>
//                   <div>
//                     <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
//                     <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Google" />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block font-bold text-slate-700 mb-1">Application URL *</label>
//                     <input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://company.com/careers/job" />
//                   </div>
//                   <div>
//                     <label className="block font-bold text-slate-700 mb-1">Job Type</label>
//                     <select value={formData.jobType} onChange={(e) => setFormData({ ...formData, jobType: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
//                       <option value="Full Time">Full Time</option>
//                       <option value="Internship">Internship</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block font-bold text-slate-700 mb-1">Domain</label>
//                     <select value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
//                       <option value="Engineering">Engineering</option>
//                       <option value="Design">Design</option>
//                       <option value="Marketing">Marketing</option>
//                       <option value="Management">Management</option>
//                       <option value="Data Entry">Data Entry</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block font-bold text-slate-700 mb-1">Experience</label>
//                     <select value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
//                       <option value="More than 0 year">More than 0 year</option>
//                       <option value="More than 1 year">More than 1 year</option>
//                       <option value="More than 2 years">More than 2 years</option>
//                       <option value="More than 3 years">More than 3 years</option>
//                       <option value="More than 4 year">More than 4 year</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block font-bold text-slate-700 mb-1">Salary</label>
//                     <input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 10-20 LPA" />
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2 pt-1">
//                   <input type="checkbox" id="isRemote" checked={formData.isRemote} onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
//                   <label htmlFor="isRemote" className="font-semibold text-slate-700">Remote Position</label>
//                 </div>
//               </div>
//               <div className="pt-2 flex space-x-2">
//                 <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Publish Job</button>
//               </div>
//             </form>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
//               <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
//                 <Save className="w-5 h-5 text-purple-600" />
//                 <span>Update Popup Redirect Link</span>
//               </h3>
//               <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Popup link updated!"); }} className="space-y-3 text-sm">
//                 <div>
//                   <label className="block font-bold text-slate-700 mb-1">Target Redirect URL</label>
//                   <input value={popupLink} onChange={(e) => setPopupLink(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="https://www.instagram.com/your_handle" />
//                 </div>
//                 <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Save Popup Link</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeSection === "popup" && (
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg">
//           <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
//             <Save className="w-5 h-5 text-purple-600" />
//             <span>Update Popup Redirect Link</span>
//           </h3>
//           <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Popup link updated!"); }} className="space-y-3 text-sm">
//             <div>
//               <label className="block font-bold text-slate-700 mb-1">Target Redirect URL</label>
//               <input value={popupLink} onChange={(e) => setPopupLink(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="https://www.instagram.com/your_handle" />
//             </div>
//             <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Save Popup Link</button>
//           </form>
//         </div>
//       )}

//       {activeSection === "reels" && (
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg space-y-4">
//           <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
//             <BookOpen className="w-5 h-5 text-pink-600" />
//             <span>Add Learning Content / Reel</span>
//           </h3>
//           <form onSubmit={handleReelSubmit} className="space-y-3 text-sm">
//             <div>
//               <label className="block font-bold text-slate-700 mb-1">Title *</label>
//               <input value={reelFormData.title} onChange={(e) => setReelFormData({ ...reelFormData, title: e.target.value })} placeholder="e.g. Day 2 of GitHub in 10 Days" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
//             </div>
//             <div>
//               <label className="block font-bold text-slate-700 mb-1">Reel / Video URL *</label>
//               <input value={reelFormData.reelUrl} onChange={(e) => setReelFormData({ ...reelFormData, reelUrl: e.target.value })} placeholder="https://www.instagram.com/reel/..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <label className="block font-bold text-slate-700 mb-1">Category</label>
//                 <input value={reelFormData.category} onChange={(e) => setReelFormData({ ...reelFormData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
//               </div>
//               <div>
//                 <label className="block font-bold text-slate-700 mb-1">Description</label>
//                 <input value={reelFormData.description} onChange={(e) => setReelFormData({ ...reelFormData, description: e.target.value })} placeholder="Brief overview..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
//               </div>
//             </div>
//             <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Save Learning Content</button>
//           </form>
//         </div>
//       )}

//       {activeSection === "bulk" && (
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg space-y-4">
//           <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
//             <Trash2 className="w-5 h-5 text-red-600" />
//             <span>Bulk Delete Old Listings</span>
//           </h3>
//           <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Bulk delete executed!"); }} className="space-y-3 text-sm">
//             <div>
//               <label className="block font-bold text-slate-700 mb-1">Delete Jobs Posted On or Before Date</label>
//               <input type="date" value={bulkDeleteDate} onChange={(e) => setBulkDeleteDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-red-500/20 text-slate-600" />
//             </div>
//             <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs">Bulk Delete Jobs</button>
//           </form>
//         </div>
//       )}

//       {activeSection === "ingestion" && (
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <h3 className="text-base font-bold text-slate-900 mb-4">Job Ingestion Controls</h3>
//           <div className="mb-4">
//             <button onClick={handleRefreshIngestion} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
//               {ingestionStatus.loading ? "Ingesting..." : "Run Full Ingestion"}
//               {ingestionStatus.loading ? <RefreshCw className="ml-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
//             </button>
//           </div>

//           <div className="space-y-4">
//             <h4 className="text-lg font-bold text-slate-900 mb-2">Sources Configuration</h4>
//             <div className="space-y-2">
//               {Object.entries(SOURCES).map(([key, source]) => {
//                     const enabled = sourceConfigs?.[key]?.enabled ?? source.enabled;
//                     return (
//                       <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
//                             {enabled ? <CheckCircle2 className="text-blue-600" /> : <Zap className="text-gray-500" />}
//                           </div>
//                           <div>
//                             <h5 className="font-medium text-slate-900">{source.name}</h5>
//                             <p className="text-sm text-slate-500">{source.name} job board adapter</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <button
//                             onClick={() => toggleSourceEnabled(key)}
//                             className={`px-3 py-1 text-xs rounded ${enabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"} transition-colors`}
//                           >
//                             {enabled ? "Enabled" : "Disabled"}
//                           </button>
//                           <button
//                             onClick={() => handleRunSourceIngestion(key)}
//                             className="ml-2 px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
//                             disabled={!enabled || ingestionStatus.loading || ingestionStatus[key]?.loading}
//                           >
//                             {ingestionStatus[key]?.loading ? "Running" : "Run Now"}
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//             </div>
//           </div>

//           {ingestionStatus.results && ingestionStatus.results.length > 0 && (
//             <div className="mt-6">
//               <h4 className="text-lg font-bold text-slate-900 mb-2">Latest Ingestion Results</h4>
//               <div className="space-y-2">
//                 {ingestionStatus.results.map((result, index) => {
//                   const isError = result.errors && result.errors.length > 0;
//                   return (
//                     <div key={index} className={`p-3 border rounded-lg ${isError ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium">{result.source}</span>
//                         <span className="text-sm">
//                           {isError
//                             ? `Failed: ${result.errors.join(', ')}`
//                             : `Fetched: ${result.rawCount}, Validated: ${result.validCount}, Duplicates: ${result.duplicateCount}, Added: ${result.storedCount}`
//                           }
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {ingestionStatus.error && (
//             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//               <h5 className="font-medium text-red-800">Error:</h5>
//               <p className="text-sm text-red-600">{ingestionStatus.error}</p>
//             </div>
//           )}
//         </div>
//       )}

//       {activeSection === "companies" && (
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <h3 className="text-base font-bold text-slate-900 mb-4">Company Priority Management</h3>
//           <p className="text-sm text-slate-500 mb-4">Configure which companies appear at the top of job listings.</p>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
//             <div>
//               <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Company Name</label>
//               <input
//                 type="text"
//                 placeholder="e.g. Google"
//                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
//                 onChange={(e) => setNewCompany(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && newCompany.trim()) {
//                     addCompanyPriority(newCompany.trim());
//                     setNewCompany("");
//                   }
//                 }}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priority</label>
//               <input
//                 type="number"
//                 min="1"
//                 defaultValue={companyPriorities.length + 1}
//                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
//                 onChange={(e) => setNewPriority(e.target.value)}
//               />
//             </div>
//             <div className="flex items-end">
//               <button
//                 onClick={() => {
//                   if (!newCompany.trim()) {
//                     triggerNotification("Please enter a company name.");
//                     return;
//                   }
//                   addCompanyPriority(newCompany.trim(), Number(newPriority) || companyPriorities.length + 1);
//                   setNewCompany("");
//                   setNewPriority("");
//                 }}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
//               >
//                 <PlusCircle className="w-4 h-4" />
//                 Add Company
//               </button>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {companyPriorities.length === 0 ? (
//               <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
//                 No company priorities configured yet. Add your first company above.
//               </div>
//             ) : (
//               companyPriorities
//                 .slice()
//                 .sort((a, b) => Number(a.priority) - Number(b.priority))
//                 .map((priority) => (
//                   <div key={priority.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
//                         <CheckCircle2 className="text-blue-600" />
//                       </div>
//                       <div>
//                         <h5 className="font-medium text-slate-900">{priority.company}</h5>
//                         <p className="text-sm text-slate-500">Priority: {priority.priority}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => {
//                           const nextPriority = prompt("Enter new priority for " + priority.company, priority.priority);
//                           if (nextPriority && !Number.isNaN(Number(nextPriority))) {
//                             updateCompanyPriority(priority.id, { priority: Number(nextPriority) });
//                           }
//                         }}
//                         className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
//                       >
//                         Edit Priority
//                       </button>
//                       <button
//                         onClick={() => removeCompanyPriority(priority.id)}
//                         className="ml-2 px-3 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))
//             )}
//           </div>
//         </div>
//       )}

//       {activeSection === "new-jobs" && (
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
//               <Bell className="w-5 h-5 text-blue-600" />
//               New Job Notifications
//             </h3>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={checkNewJobs}
//                 disabled={checkingNewJobs}
//                 className="px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
//               >
//                 {checkingNewJobs ? "Checking..." : "Refresh"}
//               </button>
//               {newJobsCount > 0 && (
//                 <button
//                   onClick={dismissNewJobs}
//                   className="px-3 py-1.5 text-xs rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
//                 >
//                   <BellOff className="w-3 h-3" />
//                   Dismiss
//                 </button>
//               )}
//             </div>
//           </div>

//           <p className="text-sm text-slate-500 mb-4">
//             Shows jobs added to the database since your last visit. Clicking <strong>Dismiss</strong> updates your last-visit time.
//           </p>

//           {lastVisitTime && (
//             <p className="text-xs text-slate-400 mb-4">
//               Last visit: {new Date(lastVisitTime).toLocaleString()}
//             </p>
//           )}

//           {newJobsCount === 0 && !checkingNewJobs && (
//             <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
//               <BellOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
//               <p className="text-sm text-slate-500">No new jobs since your last visit.</p>
//             </div>
//           )}

//           {newJobsList.length > 0 && (
//             <div className="space-y-3">
//               <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
//                 <ArrowUpCircle className="w-4 h-4 text-green-600" />
//                 {newJobsCount} new job{newJobsCount > 1 ? "s" : ""} found
//               </div>
//               {newJobsList.map((job) => (
//                 <div key={job.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <h4 className="font-medium text-slate-900 truncate">{job.title || "Untitled"}</h4>
//                       <p className="text-sm text-slate-500">{job.company || "Unknown Company"}</p>
//                       {job.domain && <p className="text-xs text-slate-400 mt-1">{job.domain} · {job.jobType || "Full Time"}</p>}
//                     </div>
//                     {job.url && (
//                       <a
//                         href={job.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="shrink-0 px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
//                       >
//                         <ExternalLink className="w-3 h-3" />
//                         View
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }



















import React, { useState, useEffect } from "react";
import { useApp } from "../App";
import { collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import {
  PlusCircle, Trash2, Calendar, Settings, BookOpen, MessageSquare, Save,
  Search, Briefcase, Sparkle, Zap, Play, ArrowRight, RefreshCw, ExternalLink,
  Building2, Database, List, CheckCircle2, Bell, BellOff, ArrowUpCircle
} from "lucide-react";
import { ingestAllJobs, ingestJobs, SOURCES } from "../services/ingestion";

export default function AdminPage() {
  const { jobs, learningReels, currentUser, isAdmin, triggerNotification, toggleSourceConfig, companyPriorities, addCompanyPriority, updateCompanyPriority, removeCompanyPriority, sourceConfigs } = useApp();
  const [activeSection, setActiveSection] = useState("post-job");
  const [popupLink, setPopupLink] = useState("https://www.instagram.com/codes_and_clouds/");
  
  // Bulk Delete State
  const [bulkDeleteDate, setBulkDeleteDate] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "", company: "", jd: "", url: "",
    jobType: "Full Time", experience: "More than 0 year",
    salary: "", domain: "Engineering", isRemote: false
  });
  const [reelFormData, setReelFormData] = useState({
    title: "", description: "", reelUrl: "", category: "Git & GitHub"
  });
  const [ingestionStatus, setIngestionStatus] = useState({});
  const [newCompany, setNewCompany] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [newJobsList, setNewJobsList] = useState([]);
  const [checkingNewJobs, setCheckingNewJobs] = useState(false);
  const [lastVisitTime, setLastVisitTime] = useState(null);

  // --- Handlers ---

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.url) {
      triggerNotification("Please fill in all required fields.");
      return;
    }
    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        date: new Date().toISOString().split("T")[0],
        createdAt: Date.now()
      });
      triggerNotification("Job post added successfully!");
      setFormData({ title: "", company: "", jd: "", url: "", jobType: "Full Time", experience: "More than 0 year", salary: "", domain: "Engineering", isRemote: false });
    } catch (error) {
      triggerNotification("Error publishing job post: " + error.message);
    }
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

  const handleBulkDelete = async (e) => {
    e.preventDefault();
    if (!bulkDeleteDate) {
      triggerNotification("Please select a date first.");
      return;
    }

    const confirmDelete = window.confirm(`WARNING: Are you sure you want to delete all jobs posted on or before ${bulkDeleteDate}? This cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const cutoffDate = new Date(bulkDeleteDate);
      cutoffDate.setHours(23, 59, 59, 999);
      const cutoffTimestamp = cutoffDate.getTime();

      const jobsRef = collection(db, "jobs");
      const q = query(jobsRef, where("createdAt", "<=", cutoffTimestamp));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        triggerNotification("No jobs found on or before this date.");
        setIsDeleting(false);
        return;
      }

      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCounter = 0;

      snapshot.docs.forEach((jobDoc) => {
        currentBatch.delete(doc(db, "jobs", jobDoc.id));
        operationCounter++;

        if (operationCounter === 500) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          operationCounter = 0;
        }
      });

      if (operationCounter > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      triggerNotification(`Successfully deleted ${snapshot.size} old jobs!`);
      setBulkDeleteDate(""); 
      
    } catch (error) {
      console.error("Bulk delete error:", error);
      triggerNotification("Error deleting jobs: " + error.message);
    } finally {
      setIsDeleting(false);
    }
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
    await toggleSourceConfig(sourceKey);
  };

  const refreshLastVisit = async () => {
    if (!currentUser) return;
    const userRef = doc(db, "userActivity", currentUser.uid);
    await setDoc(userRef, { lastVisit: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    setLastVisitTime(Date.now());
  };

  const checkNewJobs = async () => {
    if (!currentUser) return;
    setCheckingNewJobs(true);
    try {
      const userRef = doc(db, "userActivity", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const lastVisit = userSnap.exists() ? (userSnap.data().lastVisit?.toMillis?.() || 0) : 0;
      setLastVisitTime(lastVisit);

      const jobsRef = collection(db, "jobs");
      const q = query(jobsRef, where("createdAt", ">", lastVisit));
      const snap = await getDocs(q);
      const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNewJobsList(jobs);
      setNewJobsCount(jobs.length);

      if (jobs.length > 0) {
        triggerNotification(`You have ${jobs.length} new job${jobs.length > 1 ? "s" : ""} since your last visit.`);
      }
    } catch (e) {
      console.error("checkNewJobs error:", e);
      triggerNotification("Failed to check new jobs: " + e.message);
    } finally {
      setCheckingNewJobs(false);
    }
  };

  const dismissNewJobs = async () => {
    await refreshLastVisit();
    setNewJobsCount(0);
    setNewJobsList([]);
    triggerNotification("New jobs dismissed — last visit updated.");
  };

  // --- Effects ---

  useEffect(() => {
    const loadLastVisit = async () => {
      if (!currentUser) return;
      try {
        const userRef = doc(db, "userActivity", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setLastVisitTime(data.lastVisit?.toMillis?.() || null);
        }
      } catch (e) {
        console.error("loadLastVisit error:", e);
      }
    };
    loadLastVisit();
    checkNewJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (ingestionStatus.results && ingestionStatus.results.length > 0 && !ingestionStatus.loading) {
      refreshLastVisit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingestionStatus.results]);

  // --- Auth Check ---
  
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

  // --- Render ---

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="text-sm text-slate-500">Manage job listings, learning content, ingestion, and settings.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl w-fit">
        {[
          { key: "post-job", label: "Post Job" },
          { key: "popup", label: "Popup Link" },
          { key: "reels", label: "Learning Reels" },
          { key: "bulk", label: "Bulk Delete" },
          { key: "ingestion", label: "Job Ingestion" },
          { key: "companies", label: "Company Priority" },
          { key: "new-jobs", label: "New Jobs" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === tab.key ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100"}`}
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

      {/* --- BULK DELETE SECTION UPDATED --- */}
      {activeSection === "bulk" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span>Bulk Delete Old Listings</span>
          </h3>
          <form onSubmit={handleBulkDelete} className="space-y-3 text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Delete Jobs Posted On or Before Date</label>
              <input 
                type="date" 
                value={bulkDeleteDate} 
                onChange={(e) => setBulkDeleteDate(e.target.value)} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-red-500/20 text-slate-600" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isDeleting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs"
            >
              {isDeleting ? "Deleting..." : "Bulk Delete Jobs"}
            </button>
          </form>
        </div>
      )}

      {activeSection === "ingestion" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Job Ingestion Controls</h3>
          <div className="mb-4">
            <button onClick={handleRefreshIngestion} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center">
              {ingestionStatus.loading ? "Ingesting..." : "Run Full Ingestion"}
              {ingestionStatus.loading ? <RefreshCw className="ml-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Sources Configuration</h4>
            <div className="space-y-2">
              {Object.entries(SOURCES).map(([key, source]) => {
                const enabled = sourceConfigs?.[key]?.enabled ?? source.enabled;
                return (
                  <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
                        {enabled ? <CheckCircle2 className="text-blue-600" /> : <Zap className="text-gray-500" />}
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-900">{source.name}</h5>
                        <p className="text-sm text-slate-500">{source.name} job board adapter</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSourceEnabled(key)}
                        className={`px-3 py-1 text-xs rounded ${enabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"} transition-colors`}
                      >
                        {enabled ? "Enabled" : "Disabled"}
                      </button>
                      <button
                        onClick={() => handleRunSourceIngestion(key)}
                        className="ml-2 px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                        disabled={!enabled || ingestionStatus.loading || ingestionStatus[key]?.loading}
                      >
                        {ingestionStatus[key]?.loading ? "Running" : "Run Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {ingestionStatus.results && ingestionStatus.results.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-slate-900 mb-2">Latest Ingestion Results</h4>
              <div className="space-y-2">
                {ingestionStatus.results.map((result, index) => {
                  const isError = result.errors && result.errors.length > 0;
                  return (
                    <div key={index} className={`p-3 border rounded-lg ${isError ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.source}</span>
                        <span className="text-sm">
                          {isError
                            ? `Failed: ${result.errors.join(', ')}`
                            : `Fetched: ${result.rawCount}, Validated: ${result.validCount}, Duplicates: ${result.duplicateCount}, Added: ${result.storedCount}`
                          }
                        </span>
                      </div>
                    </div>
                  );
                })}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={newCompany}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCompany.trim()) {
                    addCompanyPriority(newCompany.trim());
                    setNewCompany("");
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priority</label>
              <input
                type="number"
                min="1"
                value={newPriority}
                placeholder={companyPriorities.length + 1}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                onChange={(e) => setNewPriority(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (!newCompany.trim()) {
                    triggerNotification("Please enter a company name.");
                    return;
                  }
                  addCompanyPriority(newCompany.trim(), Number(newPriority) || companyPriorities.length + 1);
                  setNewCompany("");
                  setNewPriority("");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Company
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {companyPriorities.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
                No company priorities configured yet. Add your first company above.
              </div>
            ) : (
              companyPriorities
                .slice()
                .sort((a, b) => Number(a.priority) - Number(b.priority))
                .map((priority) => (
                  <div key={priority.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
                        <CheckCircle2 className="text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-900">{priority.company}</h5>
                        <p className="text-sm text-slate-500">Priority: {priority.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const nextPriority = prompt("Enter new priority for " + priority.company, priority.priority);
                          if (nextPriority && !Number.isNaN(Number(nextPriority))) {
                            updateCompanyPriority(priority.id, { priority: Number(nextPriority) });
                          }
                        }}
                        className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Edit Priority
                      </button>
                      <button
                        onClick={() => removeCompanyPriority(priority.id)}
                        className="ml-2 px-3 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeSection === "new-jobs" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              New Job Notifications
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={checkNewJobs}
                disabled={checkingNewJobs}
                className="px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
              >
                {checkingNewJobs ? "Checking..." : "Refresh"}
              </button>
              {newJobsCount > 0 && (
                <button
                  onClick={dismissNewJobs}
                  className="px-3 py-1.5 text-xs rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  <BellOff className="w-3 h-3" />
                  Dismiss
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            Shows jobs added to the database since your last visit. Clicking <strong>Dismiss</strong> updates your last-visit time.
          </p>

          {lastVisitTime && (
            <p className="text-xs text-slate-400 mb-4">
              Last visit: {new Date(lastVisitTime).toLocaleString()}
            </p>
          )}

          {newJobsCount === 0 && !checkingNewJobs && (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
              <BellOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No new jobs since your last visit.</p>
            </div>
          )}

          {newJobsList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ArrowUpCircle className="w-4 h-4 text-green-600" />
                {newJobsCount} new job{newJobsCount > 1 ? "s" : ""} found
              </div>
              {newJobsList.map((job) => (
                <div key={job.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{job.title || "Untitled"}</h4>
                      <p className="text-sm text-slate-500">{job.company || "Unknown Company"}</p>
                      {job.domain && <p className="text-xs text-slate-400 mt-1">{job.domain} · {job.jobType || "Full Time"}</p>}
                    </div>
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}