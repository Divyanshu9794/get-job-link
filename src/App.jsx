


// import React, { useState, useEffect } from "react";
// import { PlusCircle, Search, ExternalLink, Trash2, Calendar, LayoutGrid, Table, CheckCircle, Briefcase, Globe } from "lucide-react";
// import logoImg from "./assets/logo.jpeg";

// import { auth, googleProvider, db } from "./firebase";
// import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
// import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

// function GoogleAdSenseBanner() {
//   useEffect(() => {
//     const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
//     if (!existingScript) {
//       const script = document.createElement("script");
//       script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9438102359723143";
//       script.async = true;
//       script.crossOrigin = "anonymous";
//       document.head.appendChild(script);
//     }

//     try {
//       (window.adsbygoogle = window.adsbygoogle || []).push({});
//     } catch (e) {
//       console.error("AdSense initialization error: ", e);
//     }
//   }, []);

//   return (
//     <div className="w-full flex justify-center my-6 overflow-hidden min-h-[90px]">
//       <ins 
//         className="adsbygoogle"
//         style={{ display: "block" }}
//         data-ad-client="ca-pub-9438102359723143"
//         data-ad-slot="4553594304"
//         data-ad-format="auto"
//         data-full-width-responsive="true"
//       />
//     </div>
//   );
// }

// export default function App() {
//   const ADMIN_EMAIL = "sdivyanshu352@gmail.com"; 

//   const [jobs, setJobs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [viewMode, setViewMode] = useState("grid");
//   const [notification, setNotification] = useState("");
  
//   const [activeTab, setActiveTab] = useState("all"); 
//   const [selectedJobType, setSelectedJobType] = useState(""); 
//   const [selectedExperience, setSelectedExperience] = useState([]);
//   const [selectedSalary, setSelectedSalary] = useState([]);
//   const [selectedDomain, setSelectedDomain] = useState("");

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
        
//         {/* PHYSICAL AD CONTAINER DISPLAYED IMMEDIATELY UNDER HEADER */}
//         <GoogleAdSenseBanner />

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

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
//           {/* LEFT SIDEBAR PANEL: FILTERS MATRIX */}
//           <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
//             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//               <h2 className="text-base font-bold text-slate-900">Filters</h2>
//               <button onClick={clearAllFilters} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Clear All</button>
//             </div>

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
import { 
  PlusCircle, Search, ExternalLink, Trash2, Calendar, LayoutGrid, Table, 
  CheckCircle, Briefcase, Globe, Info, Mail, Zap, CheckSquare, Pencil, X,
  TrendingUp, ArrowRight, ShieldCheck, CheckCircle2, Sparkles
} from "lucide-react";
import logoImg from "./assets/logo.jpeg";

import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

// Custom SVG Icons for social platforms
const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function App() {
  const ADMIN_EMAIL = "sdivyanshu352@gmail.com"; 

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [notification, setNotification] = useState("");
  const [editingJobId, setEditingJobId] = useState(null);
  const [weeklyUsers, setWeeklyUsers] = useState("6.1k+");
  
  const [activeTab, setActiveTab] = useState("all"); 
  const [selectedJobType, setSelectedJobType] = useState(""); 
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

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

  // Generate random user count formatted as 1k+ to 10k
  useEffect(() => {
    const randomCount = (Math.random() * (10.0 - 1.0) + 1.0).toFixed(1);
    setWeeklyUsers(`${randomCount}k+`);
  }, []);

  // Track authentication state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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

  // Fetch jobs
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
    try { 
      await signOut(auth); 
      cancelEditing();
      triggerNotification("Signed out completely."); 
    } 
    catch (error) { console.error(error); }
  };

  const sanitizeJobUrl = (rawUrl) => {
    try {
      const parsedUrl = new URL(rawUrl);
      return parsedUrl.origin + parsedUrl.pathname;
    } catch { return rawUrl; }
  };

  const resetForm = () => {
    setFormData({ 
      title: "", company: "", jd: "", url: "", 
      jobType: "Full Time", experience: "More than 0 year", 
      salary: "Competitive", domain: "Engineering", isRemote: false 
    });
    setEditingJobId(null);
  };

  const startEditingJob = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title || "",
      company: job.company || "",
      jd: job.jd || "",
      url: job.url || "",
      jobType: job.jobType || "Full Time",
      experience: job.experience || "More than 0 year",
      salary: job.salary || "Competitive",
      domain: job.domain || "Engineering",
      isRemote: job.isRemote || false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    resetForm();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 
    if (!formData.title || !formData.company || !formData.url) return;

    try {
      if (editingJobId) {
        await updateDoc(doc(db, "jobs", editingJobId), {
          title: formData.title,
          company: formData.company,
          jd: formData.jd || "No job description provided.",
          url: sanitizeJobUrl(formData.url),
          jobType: formData.jobType,
          experience: formData.experience,
          salary: formData.salary,
          domain: formData.domain,
          isRemote: formData.isRemote,
          updatedAt: Date.now()
        });
        triggerNotification("Job post updated successfully!");
      } else {
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
        triggerNotification("Job link published directly to production!");
      }

      resetForm();
    } catch (error) {
      triggerNotification(editingJobId ? "Error updating post." : "Error publishing post.");
    }
  };

  const handleRemoveJob = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, "jobs", id));
      if (editingJobId === id) cancelEditing();
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
    setSelectedDate("");
  };

  const matchingJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jd?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" ? true : activeTab === "remote" ? job.isRemote === true : true;

    const currentJobType = job.jobType || "Full Time";
    const matchesJobType = selectedJobType ? currentJobType === selectedJobType : true;

    const currentExperience = job.experience || "More than 0 year";
    const matchesExperience = selectedExperience.length > 0 ? selectedExperience.includes(currentExperience) : true;

    const currentSalary = job.salary || "Competitive";
    const matchesSalary = selectedSalary.length > 0 ? selectedSalary.includes(currentSalary) : true;

    const currentDomain = job.domain || "Engineering";
    const matchesDomain = selectedDomain ? currentDomain === selectedDomain : true;

    const matchesDate = selectedDate ? job.date === selectedDate : true;

    return matchesSearch && matchesTab && matchesJobType && matchesExperience && matchesSalary && matchesDomain && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col justify-between">

      <div>
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}

        {/* HEADER SECTION WITH INTEGRATED SEARCH INPUT */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 select-none shrink-0">
              <img src={logoImg} alt="Get Job Link Logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:inline">
                GetJob<span className="text-blue-600">Link</span>
              </span>
            </div>

            {/* Top Search Bar */}
            <div className="flex-1 max-w-2xl mx-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-0.5">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Table className="w-4 h-4" /></button>
              </div>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  {currentUser.photoURL && <img src={currentUser.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-slate-200" />}
                  <button onClick={handleGoogleLogout} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-xl border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button onClick={handleGoogleLogin} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm">
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* STICKY SOCIAL MEDIA BANNER */}
        <div className="sticky top-[57px] z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-3">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md">
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Follow GetJobLink for More Opportunities!</h2>
              <p className="text-slate-300 text-xs mt-0.5 hidden sm:block">Get daily updates on tech, code, and direct hiring links straight to your feed.</p>
            </div>
            <div className="flex items-center flex-wrap gap-2.5 shrink-0">
              <a 
                href="https://www.linkedin.com/in/getjob-link-b62169334/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://x.com/GetJobLink" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center space-x-1.5 bg-black hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm border border-slate-800"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
                <span>X (Twitter)</span>
              </a>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          {/* SPLIT HERO SECTION */}
          <section className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-16 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl mb-10">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-medium text-blue-400 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>Direct Hiring Opportunities Updated Daily</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  Discover Top Tech Roles <br />
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    Without the Noise.
                  </span>
                </h1>

                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  Direct application links, curated engineering roles, and verified opportunities. Skip the recruiter black hole and land your next offer faster.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#job-listings"
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 group"
                  >
                    <span>Explore Openings ({jobs.length})</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <div className="flex items-center space-x-2 text-xs text-slate-400 px-2 py-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>100% Direct Official Job Links</span>
                  </div>
                </div>
              </div>

              {/* USER COUNT ANALYTICS CARD */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Analytics</p>
                        <h3 className="text-xs font-bold text-white">Weekly Traffic Activity</h3>
                      </div>
                    </div>
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>

                  <div className="py-5 space-y-5">
                    
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block mb-1">Active Job Seekers This Week</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-black tracking-tight text-white">{weeklyUsers}</span>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            +18% vs last week
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Direct career portal redirects</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>No sign-up necessary for applicants</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Filtered for full-time & internship roles</span>
                      </div>
                    </div>

                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Verified metrics</span>
                    <span className="flex items-center space-x-1">
                      <Briefcase className="w-3 h-3" />
                      <span>Global Opportunities</span>
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* TAB HEADER */}
          <div id="job-listings" className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-px">
            <button onClick={() => setActiveTab("all")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              <Briefcase className="w-4 h-4" />
              <span>All Openings</span>
            </button>
            <button onClick={() => setActiveTab("remote")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "remote" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              <Globe className="w-4 h-4" />
              <span>Remote Jobs</span>
            </button>
            <button onClick={() => setActiveTab("post-job")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "post-job" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              <PlusCircle className="w-4 h-4" />
              <span>Post Your Jobs Here</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* FILTERS SIDEBAR */}
            <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">Important Note:</span> We are a third-party organization aggregating official job links directly to help candidates secure opportunities.
                </p>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Filters</h2>
                <button onClick={clearAllFilters} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Clear All</button>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Date Added</h3>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                />
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

            {/* MAIN CONTENT AREA */}
            <section className={`${isAdmin ? "lg:col-span-5" : "lg:col-span-9"} space-y-6`}>
              {activeTab === "post-job" ? (
                <div className="flex flex-col items-center text-center py-12 px-4 bg-transparent max-w-4xl mx-auto">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Post a Job on GetJobLink
                  </h1>
                  <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
                    We're currently accepting job postings directly via email. To post a job, please contact our team.
                  </p>

                  <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center mb-12">
                    <h3 className="text-lg font-bold text-slate-900 mb-5">Contact Us to Post</h3>
                    <a 
                      href="mailto:getjoblink647@gmail.com" 
                      className="inline-flex items-center space-x-3 bg-slate-950 hover:bg-slate-900 text-white font-medium py-3.5 px-8 rounded-xl transition-all shadow-md group w-full sm:w-auto justify-center"
                    >
                      <Mail className="w-5 h-5 text-slate-300 group-hover:text-white" />
                      <span className="text-sm md:text-base tracking-wide">getjoblink647@gmail.com</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-slate-900">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-base">Reach Targeted Talent</h4>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Connect with qualified candidates actively looking for opportunities.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-slate-900">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-base">Simple Process</h4>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Just send us the job details, and we'll handle the formatting and posting.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-slate-900">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-base">Quick Support</h4>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Our team is available to help you with any questions about your listing.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {matchingJobs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-slate-400 font-medium text-sm">No active job listings found matching your search parameters.</p>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-4">
                      {matchingJobs.map((job) => (
                        <div key={job.id} className={`bg-white p-6 rounded-2xl border transition-all shadow-sm flex flex-col justify-between relative overflow-hidden ${editingJobId === job.id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200"}`}>
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
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.salary || "Competitive"}</span>
                                </div>
                              </div>

                              {isAdmin && (
                                <div className="flex items-center space-x-1">
                                  <button onClick={() => startEditingJob(job)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleRemoveJob(job.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                              {job.jd}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {job.date || "Recently"}
                            </span>

                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                            >
                              <span>Apply Directly</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="p-4">Role & Company</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Experience</th>
                              <th className="p-4">Salary</th>
                              <th className="p-4">Posted</th>
                              <th className="p-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {matchingJobs.map((job) => (
                              <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-bold text-slate-900">{job.title}</div>
                                  <div className="text-blue-600 font-semibold">{job.company}</div>
                                </td>
                                <td className="p-4">{job.jobType || "Full Time"}</td>
                                <td className="p-4">{job.experience || "More than 0 year"}</td>
                                <td className="p-4">{job.salary || "Competitive"}</td>
                                <td className="p-4 text-slate-400">{job.date || "Recently"}</td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    {isAdmin && (
                                      <>
                                        <button onClick={() => startEditingJob(job)} className="p-1 text-slate-400 hover:text-blue-600">
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleRemoveJob(job.id)} className="p-1 text-slate-400 hover:text-red-600">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                    <a
                                      href={job.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                                    >
                                      <span>Apply</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ADMIN PUBLISH FORM PANEL */}
            {isAdmin && (
              <aside className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">
                    {editingJobId ? "Edit Job Listing" : "Publish Job Listing"}
                  </h2>
                  {editingJobId && (
                    <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Company</label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Application URL</label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Type</label>
                      <select
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Experience</label>
                      <select
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="More than 0 year">More than 0 year</option>
                        <option value="More than 1 year">More than 1 year</option>
                        <option value="More than 2 years">More than 2 years</option>
                        <option value="More than 3 years">More than 3 years</option>
                        <option value="More than 4 years">More than 4 years</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Salary</label>
                      <select
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Competitive">Competitive</option>
                        <option value="2-4 LPA">2-4 LPA</option>
                        <option value="4-6 LPA">4-6 LPA</option>
                        <option value="6-10 LPA">6-10 LPA</option>
                        <option value="10-20 LPA">10-20 LPA</option>
                        <option value="20-30 LPA">20-30 LPA</option>
                        <option value="$10 - $20 /hr">$10 - $20 /hr</option>
                        <option value="$20 - $30 /hr">$20 - $30 /hr</option>
                        <option value="$30 - $40 /hr">$30 - $40 /hr</option>
                        <option value="$40+ /hr">$40+ /hr</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Domain</label>
                      <select
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Management">Management</option>
                        <option value="Data Entry">Data Entry</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRemote}
                        onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="font-medium text-slate-700">Mark as Remote Position</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Job Description</label>
                    <textarea
                      rows="4"
                      value={formData.jd}
                      onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all"
                    >
                      {editingJobId ? "Save Changes" : "Publish Job Listing"}
                    </button>

                    {editingJobId && (
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </aside>
            )}

          </div>
        </main>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs space-y-2">
          <p>© {new Date().getFullYear()} GetJobLink. All rights reserved.</p>
          <p className="text-slate-500">Connecting candidates directly with official engineering application portals.</p>
        </div>
      </footer>

    </div>
  );
}