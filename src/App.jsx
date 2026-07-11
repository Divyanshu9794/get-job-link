

// import React, { useState, useEffect } from "react";
// import { PlusCircle, Search, ExternalLink, Trash2, Calendar, LayoutGrid, Table, CheckCircle, Briefcase, Globe } from "lucide-react";
// import logoImg from "./assets/logo.jpeg";

// import { auth, googleProvider, db } from "./firebase";
// import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
// import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

// export default function App() {
//   const ADMIN_EMAIL = "sdivyanshu352@gmail.com"; 

//   const [jobs, setJobs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [viewMode, setViewMode] = useState("grid");
//   const [notification, setNotification] = useState("");
  
//   // FILTER STATES & ACTIVE TAB
//   const [activeTab, setActiveTab] = useState("all"); 
//   const [selectedJobType, setSelectedJobType] = useState(""); 
//   const [selectedExperience, setSelectedExperience] = useState([]);
//   const [selectedSalary, setSelectedSalary] = useState([]);
//   const [selectedDomain, setSelectedDomain] = useState("");

//   // Extended creator form state for Admin
//   const [formData, setFormData] = useState({ 
//     title: "", 
//     company: "", 
//     jd: "", 
//     url: "",
//     jobType: "Full Time",
//     experience: "More than 0 year",
//     salary: "Competitive",
//     domain: "Engineering",
//     isRemote: false 
//   });

//   useEffect(() => {
//     const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setCurrentUser(user);
//         setIsAdmin(user.email === ADMIN_EMAIL);
//       } else {
//         setCurrentUser(null);
//         setIsAdmin(false);
//       }
//     });
//     return () => unsubscribeAuth();
//   }, []);

//   useEffect(() => {
//     const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
//     const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
//       const jobList = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setJobs(jobList);
//     });
//     return () => unsubscribeSnapshot();
//   }, []);

//   const triggerNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 4000);
//   };

//   const handleGoogleLogin = async () => {
//     try { await signInWithPopup(auth, googleProvider); } 
//     catch (error) { triggerNotification("Authentication failed. Try again."); }
//   };

//   const handleGoogleLogout = async () => {
//     try { await signOut(auth); triggerNotification("Signed out completely."); } 
//     catch (error) { console.error(error); }
//   };

//   const sanitizeJobUrl = (rawUrl) => {
//     try {
//       const parsedUrl = new URL(rawUrl);
//       return parsedUrl.origin + parsedUrl.pathname;
//     } catch { return rawUrl; }
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!isAdmin) return; 
//     if (!formData.title || !formData.company || !formData.url) return;

//     try {
//       await addDoc(collection(db, "jobs"), {
//         title: formData.title,
//         company: formData.company,
//         jd: formData.jd || "No job description provided.",
//         url: sanitizeJobUrl(formData.url),
//         jobType: formData.jobType,
//         experience: formData.experience,
//         salary: formData.salary,
//         domain: formData.domain,
//         isRemote: formData.isRemote,
//         date: new Date().toISOString().split("T")[0],
//         createdAt: Date.now()
//       });

//       setFormData({ 
//         title: "", company: "", jd: "", url: "", 
//         jobType: "Full Time", experience: "More than 0 year", 
//         salary: "Competitive", domain: "Engineering", isRemote: false 
//       });
//       triggerNotification("Job link published directly to production!");
//     } catch (error) {
//       triggerNotification("Error publishing post.");
//     }
//   };

//   const handleRemoveJob = async (id) => {
//     if (!isAdmin) return;
//     try {
//       await deleteDoc(doc(db, "jobs", id));
//       triggerNotification("Job listing deleted from global network.");
//     } catch (error) { triggerNotification("Error deleting post."); }
//   };

//   const handleCheckboxChange = (value, state, setState) => {
//     if (state.includes(value)) {
//       setState(state.filter((item) => item !== value));
//     } else {
//       setState([...state, value]);
//     }
//   };

//   const clearAllFilters = () => {
//     setSelectedJobType("");
//     setSelectedExperience([]);
//     setSelectedSalary([]);
//     setSelectedDomain("");
//   };

//   // SAFE METADATA FILTERING ENGINE WITH NEW SALARY SUPPORT
//   const matchingJobs = jobs.filter((job) => {
//     const matchesSearch = 
//       job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.jd?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesTab = activeTab === "all" ? true : job.isRemote === true;

//     const currentJobType = job.jobType || "Full Time";
//     const matchesJobType = selectedJobType ? currentJobType === selectedJobType : true;

//     const currentExperience = job.experience || "More than 0 year";
//     const matchesExperience = selectedExperience.length > 0 ? selectedExperience.includes(currentExperience) : true;

//     const currentSalary = job.salary || "Competitive";
//     const matchesSalary = selectedSalary.length > 0 ? selectedSalary.includes(currentSalary) : true;

//     const currentDomain = job.domain || "Engineering";
//     const matchesDomain = selectedDomain ? currentDomain === selectedDomain : true;

//     return matchesSearch && matchesTab && matchesJobType && matchesExperience && matchesSalary && matchesDomain;
//   });

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
//       {notification && (
//         <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
//           <CheckCircle className="w-5 h-5 text-emerald-400" />
//           <span className="text-sm font-medium">{notification}</span>
//         </div>
//       )}

//       {/* HEADER SECTION */}
//       <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center space-x-2.5 select-none">
//             <img src={logoImg} alt="Get Job Link Logo" className="w-8 h-8 object-contain rounded-lg" />
//             <span className="text-xl font-extrabold tracking-tight text-slate-900">
//               GetJob<span className="text-blue-600">Link</span>
//             </span>
//           </div>
//           <div className="flex items-center space-x-3">
//             <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-100 p-0.5">
//               <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><LayoutGrid className="w-4 h-4" /></button>
//               <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Table className="w-4 h-4" /></button>
//             </div>
//             {currentUser ? (
//               <div className="flex items-center space-x-3">
//                 {currentUser.photoURL && <img src={currentUser.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-slate-200" />}
//                 <button onClick={handleGoogleLogout} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
//                   <span>Sign Out</span>
//                 </button>
//               </div>
//             ) : (
//               <button onClick={handleGoogleLogin} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm">
//                 <span>Admin Login</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         {/* WORKPLACE ENVIRONMENTS TAB HEADER */}
//         <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-px">
//           <button onClick={() => setActiveTab("all")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
//             <Briefcase className="w-4 h-4" />
//             <span>All Openings</span>
//           </button>
//           <button onClick={() => setActiveTab("remote")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "remote" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
//             <Globe className="w-4 h-4" />
//             <span>Remote Jobs</span>
//           </button>
//         </div>

//         {/* THREE-COLUMN RESPONSIVE LAYOUT MATRIX */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
//           {/* LEFT SIDEBAR PANEL: FILTERS MATRIX */}
//           <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
//             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//               <h2 className="text-base font-bold text-slate-900">Filters</h2>
//               <button onClick={clearAllFilters} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Clear All</button>
//             </div>

//             {/* Job Type Pill Filter */}
//             <div>
//               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Job Type</h3>
//               <div className="flex flex-wrap gap-2">
//                 {["Full Time", "Internship"].map((type) => (
//                   <button key={type} onClick={() => setSelectedJobType(selectedJobType === type ? "" : type)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedJobType === type ? "bg-blue-50 border-blue-600 text-blue-600 font-semibold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//                     {type}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Experience Checkbox Set */}
//             <div>
//               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Experience</h3>
//               <div className="space-y-2 text-sm text-slate-600">
//                 {["More than 0 year", "More than 1 year", "More than 2 years", "More than 3 years", "More than 4 years"].map((exp) => (
//                   <label key={exp} className="flex items-center space-x-2.5 cursor-pointer">
//                     <input type="checkbox" checked={selectedExperience.includes(exp)} onChange={() => handleCheckboxChange(exp, selectedExperience, setSelectedExperience)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
//                     <span>{exp}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Salary Grid Box Checksets (LPA & Dollar Rates Integrated) */}
//             <div>
//               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Salary</h3>
//               <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
//                 {[
//                   "Competitive", 
//                   "2-4 LPA", 
//                   "4-6 LPA", 
//                   "6-10 LPA", 
//                   "10-20 LPA", 
//                   "20-30 LPA", 
//                   "$10 - $20 /hr",
//                   "$20 - $30 /hr",
//                   "$30 - $40 /hr",
//                   "$40+ /hr"
//                 ].map((sal) => (
//                   <label key={sal} className="flex items-center space-x-2.5 cursor-pointer">
//                     <input type="checkbox" checked={selectedSalary.includes(sal)} onChange={() => handleCheckboxChange(sal, selectedSalary, setSelectedSalary)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
//                     <span>{sal}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Domain Dropdown Filter */}
//             <div>
//               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Domain</h3>
//               <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
//                 <option value="">Select domain</option>
//                 <option value="Engineering">Engineering / Tech</option>
//                 <option value="Design">Product Design</option>
//                 <option value="Marketing">Marketing</option>
//                 <option value="Management">Product Management</option>
//                 <option value="Data Entry">Operations / Data Entry</option>
//               </select>
//             </div>
//           </aside>

//           {/* MAIN COLUMN: JOB MATRIX CONTENT LIST */}
//           <section className={`${isAdmin ? "lg:col-span-5" : "lg:col-span-9"} space-y-6`}>
//             <div className="relative">
//               <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
//               <input type="text" placeholder="Filter by position, organization, or requirements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm" />
//             </div>

//             {matchingJobs.length === 0 ? (
//               <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
//                 <p className="text-slate-400 font-medium text-sm">No active job listings found matching your search parameters.</p>
//               </div>
//             ) : viewMode === "grid" ? (
//               <div className="grid grid-cols-1 gap-4">
//                 {matchingJobs.map((job) => (
//                   <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
//                     {job.isRemote && (
//                       <span className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-emerald-100 uppercase tracking-wider">
//                         Remote
//                       </span>
//                     )}
//                     <div>
//                       <div className="flex items-start justify-between mb-3">
//                         <div>
//                           <h3 className="text-base font-bold text-slate-900 tracking-tight">{job.title}</h3>
//                           <p className="text-sm font-bold text-blue-600 mt-0.5">{job.company}</p>
//                           <div className="flex flex-wrap gap-1.5 mt-2">
//                             <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.jobType || "Full Time"}</span>
//                             <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.experience || "More than 0 year"}</span>
//                             <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded">{job.salary || "Competitive"}</span>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
//                           <Calendar className="w-3.5 h-3.5" />
//                           <span>{job.date}</span>
//                         </div>
//                       </div>
//                       <p className="text-slate-600 text-sm leading-relaxed mb-5 whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
//                         {job.jd}
//                       </p>
//                     </div>
//                     <div className="flex items-center justify-between pt-3 border-t border-slate-100">
//                       <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1.5 text-xs font-bold tracking-wide uppercase text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm">
//                         <span>Apply Directly</span>
//                         <ExternalLink className="w-3.5 h-3.5" />
//                       </a>
//                       {isAdmin && (
//                         <button onClick={() => handleRemoveJob(job.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50">
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               /* HIGH-DENSITY, NON-SQUEEZED TABLE VIEW */
//               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left border-collapse min-w-[620px]">
//                     <thead>
//                       <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                         <th className="py-3.5 px-4 pl-6">Company</th>
//                         <th className="py-3.5 px-4">Role</th>
//                         <th className="py-3.5 px-4 hidden md:table-cell">Metadata</th>
//                         <th className="py-3.5 px-4 whitespace-nowrap">Date Added</th>
//                         <th className="py-3.5 px-4 pr-6 text-right">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100 text-sm">
//                       {matchingJobs.map((job) => (
//                         <tr key={job.id} className="hover:bg-slate-50/60 transition-colors group">
//                           <td className="py-4 px-4 pl-6 font-bold text-slate-900 whitespace-nowrap">
//                             <div className="flex items-center space-x-2">
//                               <span>{job.company}</span>
//                               {job.isRemote && (
//                                 <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
//                                   Remote
//                                 </span>
//                               )}
//                             </div>
//                           </td>
//                           <td className="py-4 px-4 font-semibold text-slate-700 max-w-[180px] truncate">
//                             {job.title}
//                           </td>
//                           <td className="py-4 px-4 hidden md:table-cell">
//                             <div className="flex flex-wrap gap-1">
//                               <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded whitespace-nowrap">
//                                 {job.jobType || "Full Time"}
//                               </span>
//                               <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded whitespace-nowrap">
//                                 {job.salary || "Competitive"}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="py-4 px-4 text-xs text-slate-400 font-semibold whitespace-nowrap">
//                             {job.date}
//                           </td>
//                           <td className="py-4 px-4 pr-6 text-right whitespace-nowrap">
//                             <div className="inline-flex items-center space-x-2">
//                               <a 
//                                 href={job.url} 
//                                 target="_blank" 
//                                 rel="noopener noreferrer" 
//                                 className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
//                               >
//                                 <span>Apply</span>
//                                 <ExternalLink className="w-3 h-3" />
//                               </a>
//                               {isAdmin && (
//                                 <button 
//                                   onClick={() => handleRemoveJob(job.id)} 
//                                   className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
//                                 >
//                                   <Trash2 className="w-3.5 h-3.5" />
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </section>

//           {/* RIGHT SIDEBAR PANEL: ADMIN PUBLISHER TOOL */}
//           {isAdmin && (
//             <aside className="lg:col-span-4">
//               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24 max-h-[85vh] overflow-y-auto space-y-4">
//                 <div className="flex items-center space-x-2 mb-2">
//                   <PlusCircle className="w-5 h-5 text-blue-600" />
//                   <h2 className="text-base font-bold text-slate-900">Add Live Job Link</h2>
//                 </div>
//                 <form onSubmit={handleFormSubmit} className="space-y-3.5 text-sm">
//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Job Title *</label>
//                     <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Data Entry Support" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Company *</label>
//                     <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="e.g. Viasat" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Raw Job URL *</label>
//                     <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://get-job-link.web.app/" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Job Type</label>
//                       <select value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
//                         <option>Full Time</option>
//                         <option>Internship</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Experience</label>
//                       <select value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
//                         <option>More than 0 year</option>
//                         <option>More than 1 year</option>
//                         <option>More than 2 years</option>
//                         <option>More than 3 years</option>
//                         <option>More than 4 years</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Salary Range</label>
//                       <select value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
//                         <option>Competitive</option>
//                         <option>2-4 LPA</option>
//                         <option>4-6 LPA</option>
//                         <option>6-10 LPA</option>
//                         <option>10-20 LPA</option>
//                         <option>20-30 LPA</option>
//                         <option>$10 - $20 /hr</option>
//                         <option>$20 - $30 /hr</option>
//                         <option>$30 - $40 /hr</option>
//                         <option>$40+ /hr</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Domain</label>
//                       <select value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
//                         <option value="Engineering">Engineering</option>
//                         <option value="Design">Design</option>
//                         <option value="Marketing">Marketing</option>
//                         <option value="Management">Management</option>
//                         <option value="Data Entry">Data Entry</option>
//                       </select>
//                     </div>
//                   </div>

//                   <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer select-none">
//                     <input type="checkbox" checked={formData.isRemote} onChange={(e) => setFormData({...formData, isRemote: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
//                     <span className="text-xs font-semibold text-slate-700">Mark as Remote Job</span>
//                   </label>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Job Description</label>
//                     <textarea value={formData.jd} onChange={(e) => setFormData({...formData, jd: e.target.value})} placeholder="Requirements..." rows="3" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none text-xs"></textarea>
//                   </div>
//                   <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs">
//                     <span>Clean & Post Link</span>
//                   </button>
//                 </form>
//               </div>
//             </aside>
//           )}

//         </div>
//       </main>
//     </div>
//   );
// }







import React, { useState, useEffect } from "react";
import { PlusCircle, Search, ExternalLink, Trash2, Calendar, LayoutGrid, Table, CheckCircle, Briefcase, Globe } from "lucide-react";
import logoImg from "./assets/logo.jpeg";

import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

function GoogleAdSenseBanner() {
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9438102359723143";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense initialization error: ", e);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-6 overflow-hidden min-h-[90px]">
      <ins 
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9438102359723143"
        data-ad-slot="4553594304"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default function App() {
  const ADMIN_EMAIL = "sdivyanshu352@gmail.com"; 

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [notification, setNotification] = useState("");
  
  const [activeTab, setActiveTab] = useState("all"); 
  const [selectedJobType, setSelectedJobType] = useState(""); 
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  const [formData, setFormData] = useState({ 
    title: "", 
    company: "", 
    jd: "", 
    url: "",
    jobType: "Full Time",
    experience: "More than 0 year",
    salary: "Competitive",
    domain: "Engineering",
    isRemote: false 
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAdmin(user.email === ADMIN_EMAIL);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const jobList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobList);
    });
    return () => unsubscribeSnapshot();
  }, []);

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 4000);
  };

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { triggerNotification("Authentication failed. Try again."); }
  };

  const handleGoogleLogout = async () => {
    try { await signOut(auth); triggerNotification("Signed out completely."); } 
    catch (error) { console.error(error); }
  };

  const sanitizeJobUrl = (rawUrl) => {
    try {
      const parsedUrl = new URL(rawUrl);
      return parsedUrl.origin + parsedUrl.pathname;
    } catch { return rawUrl; }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 
    if (!formData.title || !formData.company || !formData.url) return;

    try {
      await addDoc(collection(db, "jobs"), {
        title: formData.title,
        company: formData.company,
        jd: formData.jd || "No job description provided.",
        url: sanitizeJobUrl(formData.url),
        jobType: formData.jobType,
        experience: formData.experience,
        salary: formData.salary,
        domain: formData.domain,
        isRemote: formData.isRemote,
        date: new Date().toISOString().split("T")[0],
        createdAt: Date.now()
      });

      setFormData({ 
        title: "", company: "", jd: "", url: "", 
        jobType: "Full Time", experience: "More than 0 year", 
        salary: "Competitive", domain: "Engineering", isRemote: false 
      });
      triggerNotification("Job link published directly to production!");
    } catch (error) {
      triggerNotification("Error publishing post.");
    }
  };

  const handleRemoveJob = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, "jobs", id));
      triggerNotification("Job listing deleted from global network.");
    } catch (error) { triggerNotification("Error deleting post."); }
  };

  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedJobType("");
    setSelectedExperience([]);
    setSelectedSalary([]);
    setSelectedDomain("");
  };

  const matchingJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jd?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" ? true : job.isRemote === true;

    const currentJobType = job.jobType || "Full Time";
    const matchesJobType = selectedJobType ? currentJobType === selectedJobType : true;

    const currentExperience = job.experience || "More than 0 year";
    const matchesExperience = selectedExperience.length > 0 ? selectedExperience.includes(currentExperience) : true;

    const currentSalary = job.salary || "Competitive";
    const matchesSalary = selectedSalary.length > 0 ? selectedSalary.includes(currentSalary) : true;

    const currentDomain = job.domain || "Engineering";
    const matchesDomain = selectedDomain ? currentDomain === selectedDomain : true;

    return matchesSearch && matchesTab && matchesJobType && matchesExperience && matchesSalary && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">

      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 select-none">
            <img src={logoImg} alt="Get Job Link Logo" className="w-8 h-8 object-contain rounded-lg" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              GetJob<span className="text-blue-600">Link</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-100 p-0.5">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Table className="w-4 h-4" /></button>
            </div>
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {currentUser.photoURL && <img src={currentUser.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-slate-200" />}
                <button onClick={handleGoogleLogout} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button onClick={handleGoogleLogin} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm">
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* PHYSICAL AD CONTAINER DISPLAYED IMMEDIATELY UNDER HEADER */}
        <GoogleAdSenseBanner />

        {/* WORKPLACE ENVIRONMENTS TAB HEADER */}
        <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-px">
          <button onClick={() => setActiveTab("all")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            <Briefcase className="w-4 h-4" />
            <span>All Openings</span>
          </button>
          <button onClick={() => setActiveTab("remote")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "remote" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            <Globe className="w-4 h-4" />
            <span>Remote Jobs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR PANEL: FILTERS MATRIX */}
          <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
              <button onClick={clearAllFilters} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Clear All</button>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Job Type</h3>
              <div className="flex flex-wrap gap-2">
                {["Full Time", "Internship"].map((type) => (
                  <button key={type} onClick={() => setSelectedJobType(selectedJobType === type ? "" : type)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedJobType === type ? "bg-blue-50 border-blue-600 text-blue-600 font-semibold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Experience</h3>
              <div className="space-y-2 text-sm text-slate-600">
                {["More than 0 year", "More than 1 year", "More than 2 years", "More than 3 years", "More than 4 years"].map((exp) => (
                  <label key={exp} className="flex items-center space-x-2.5 cursor-pointer">
                    <input type="checkbox" checked={selectedExperience.includes(exp)} onChange={() => handleCheckboxChange(exp, selectedExperience, setSelectedExperience)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Salary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                {[
                  "Competitive", 
                  "2-4 LPA", 
                  "4-6 LPA", 
                  "6-10 LPA", 
                  "10-20 LPA", 
                  "20-30 LPA", 
                  "$10 - $20 /hr",
                  "$20 - $30 /hr",
                  "$30 - $40 /hr",
                  "$40+ /hr"
                ].map((sal) => (
                  <label key={sal} className="flex items-center space-x-2.5 cursor-pointer">
                    <input type="checkbox" checked={selectedSalary.includes(sal)} onChange={() => handleCheckboxChange(sal, selectedSalary, setSelectedSalary)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span>{sal}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Domain</h3>
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Select domain</option>
                <option value="Engineering">Engineering / Tech</option>
                <option value="Design">Product Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Management">Product Management</option>
                <option value="Data Entry">Operations / Data Entry</option>
              </select>
            </div>
          </aside>

          {/* MAIN COLUMN: JOB MATRIX CONTENT LIST */}
          <section className={`${isAdmin ? "lg:col-span-5" : "lg:col-span-9"} space-y-6`}>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input type="text" placeholder="Filter by position, organization, or requirements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm" />
            </div>

            {matchingJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-400 font-medium text-sm">No active job listings found matching your search parameters.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4">
                {matchingJobs.map((job) => (
                  <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    {job.isRemote && (
                      <span className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-emerald-100 uppercase tracking-wider">
                        Remote
                      </span>
                    )}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">{job.title}</h3>
                          <p className="text-sm font-bold text-blue-600 mt-0.5">{job.company}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.jobType || "Full Time"}</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.experience || "More than 0 year"}</span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded">{job.salary || "Competitive"}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{job.date}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-5 whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                        {job.jd}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1.5 text-xs font-bold tracking-wide uppercase text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm">
                        <span>Apply Directly</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {isAdmin && (
                        <button onClick={() => handleRemoveJob(job.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[620px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-4 pl-6">Company</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4 hidden md:table-cell">Metadata</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Date Added</th>
                        <th className="py-3.5 px-4 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {matchingJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="py-4 px-4 pl-6 font-bold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span>{job.company}</span>
                              {job.isRemote && (
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                                  Remote
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-700 max-w-[180px] truncate">
                            {job.title}
                          </td>
                          <td className="py-4 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded whitespace-nowrap">
                                {job.jobType || "Full Time"}
                              </span>
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded whitespace-nowrap">
                                {job.salary || "Competitive"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400 font-semibold whitespace-nowrap">
                            {job.date}
                          </td>
                          <td className="py-4 px-4 pr-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-2">
                              <a 
                                href={job.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <span>Apply</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              {isAdmin && (
                                <button 
                                  onClick={() => handleRemoveJob(job.id)} 
                                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR PANEL: ADMIN PUBLISHER TOOL */}
          {isAdmin && (
            <aside className="lg:col-span-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24 max-h-[85vh] overflow-y-auto space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Add Live Job Link</h2>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-3.5 text-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Job Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Data Entry Support" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Company *</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="e.g. Viasat" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Raw Job URL *</label>
                    <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://get-job-link.web.app/" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Job Type</label>
                      <select value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <option>Full Time</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Experience</label>
                      <select value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <option>More than 0 year</option>
                        <option>More than 1 year</option>
                        <option>More than 2 years</option>
                        <option>More than 3 years</option>
                        <option>More than 4 years</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Salary Range</label>
                      <select value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <option>Competitive</option>
                        <option>2-4 LPA</option>
                        <option>4-6 LPA</option>
                        <option>6-10 LPA</option>
                        <option>10-20 LPA</option>
                        <option>20-30 LPA</option>
                        <option>$10 - $20 /hr</option>
                        <option>$20 - $30 /hr</option>
                        <option>$30 - $40 /hr</option>
                        <option>$40+ /hr</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Domain</label>
                      <select value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Management">Management</option>
                        <option value="Data Entry">Data Entry</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer select-none">
                    <input type="checkbox" checked={formData.isRemote} onChange={(e) => setFormData({...formData, isRemote: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span className="text-xs font-semibold text-slate-700">Mark as Remote Job</span>
                  </label>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Job Description</label>
                    <textarea value={formData.jd} onChange={(e) => setFormData({...formData, jd: e.target.value})} placeholder="Requirements..." rows="3" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none text-xs"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-xs">
                    <span>Clean & Post Link</span>
                  </button>
                </form>
              </div>
            </aside>
          )}

        </div>
      </main>
    </div>
  );
}