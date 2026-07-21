

// import React, { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
// import { 
//   PlusCircle, Search, ExternalLink, Trash2, Calendar, LayoutGrid, Table, 
//   CheckCircle, Briefcase, Globe, Info, Mail, Zap, CheckSquare, Pencil, X,
//   TrendingUp, ArrowRight, ShieldCheck, CheckCircle2, Sparkles
// } from "lucide-react";
// import logoImg from "./assets/logo.jpeg";

// import { auth, googleProvider, db } from "./firebase";
// import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
// import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

// // Custom SVG Icons for social platforms
// const LinkedinIcon = ({ className = "w-4 h-4" }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
//     <rect x="2" y="9" width="4" height="12"></rect>
//     <circle cx="4" cy="4" r="2"></circle>
//   </svg>
// );

// const TwitterIcon = ({ className = "w-4 h-4" }) => (
//   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
//     <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
//   </svg>
// );

// export default function App() {
//   const ADMIN_EMAIL = "sdivyanshu352@gmail.com"; 

//   const [jobs, setJobs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [viewMode, setViewMode] = useState("grid");
//   const [notification, setNotification] = useState("");
//   const [editingJobId, setEditingJobId] = useState(null);
//   const [weeklyUsers, setWeeklyUsers] = useState("6.1k+");
  
//   const [activeTab, setActiveTab] = useState("all"); 
//   const [selectedJobType, setSelectedJobType] = useState(""); 
//   const [selectedExperience, setSelectedExperience] = useState([]);
//   const [selectedSalary, setSelectedSalary] = useState([]);
//   const [selectedDomain, setSelectedDomain] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");

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

//   // Generate random user count formatted as 1k+ to 10k
//   useEffect(() => {
//     const randomCount = (Math.random() * (10.0 - 1.0) + 1.0).toFixed(1);
//     setWeeklyUsers(`${randomCount}k+`);
//   }, []);

//   // Track authentication state
//   useEffect(() => {
//     const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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

//   // Fetch jobs
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
//     try { 
//       await signOut(auth); 
//       cancelEditing();
//       triggerNotification("Signed out completely."); 
//     } 
//     catch (error) { console.error(error); }
//   };

//   const sanitizeJobUrl = (rawUrl) => {
//     try {
//       const parsedUrl = new URL(rawUrl);
//       return parsedUrl.origin + parsedUrl.pathname;
//     } catch { return rawUrl; }
//   };

//   const resetForm = () => {
//     setFormData({ 
//       title: "", company: "", jd: "", url: "", 
//       jobType: "Full Time", experience: "More than 0 year", 
//       salary: "Competitive", domain: "Engineering", isRemote: false 
//     });
//     setEditingJobId(null);
//   };

//   const startEditingJob = (job) => {
//     setEditingJobId(job.id);
//     setFormData({
//       title: job.title || "",
//       company: job.company || "",
//       jd: job.jd || "",
//       url: job.url || "",
//       jobType: job.jobType || "Full Time",
//       experience: job.experience || "More than 0 year",
//       salary: job.salary || "Competitive",
//       domain: job.domain || "Engineering",
//       isRemote: job.isRemote || false
//     });
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const cancelEditing = () => {
//     resetForm();
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!isAdmin) return; 
//     if (!formData.title || !formData.company || !formData.url) return;

//     try {
//       if (editingJobId) {
//         await updateDoc(doc(db, "jobs", editingJobId), {
//           title: formData.title,
//           company: formData.company,
//           jd: formData.jd || "No job description provided.",
//           url: sanitizeJobUrl(formData.url),
//           jobType: formData.jobType,
//           experience: formData.experience,
//           salary: formData.salary,
//           domain: formData.domain,
//           isRemote: formData.isRemote,
//           updatedAt: Date.now()
//         });
//         triggerNotification("Job post updated successfully!");
//       } else {
//         await addDoc(collection(db, "jobs"), {
//           title: formData.title,
//           company: formData.company,
//           jd: formData.jd || "No job description provided.",
//           url: sanitizeJobUrl(formData.url),
//           jobType: formData.jobType,
//           experience: formData.experience,
//           salary: formData.salary,
//           domain: formData.domain,
//           isRemote: formData.isRemote,
//           date: new Date().toISOString().split("T")[0],
//           createdAt: Date.now()
//         });
//         triggerNotification("Job link published directly to production!");
//       }

//       resetForm();
//     } catch (error) {
//       triggerNotification(editingJobId ? "Error updating post." : "Error publishing post.");
//     }
//   };

//   const handleRemoveJob = async (id) => {
//     if (!isAdmin) return;
//     try {
//       await deleteDoc(doc(db, "jobs", id));
//       if (editingJobId === id) cancelEditing();
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
//     setSelectedDate("");
//   };

//   const matchingJobs = jobs.filter((job) => {
//     const matchesSearch = 
//       job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.jd?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesTab = activeTab === "all" ? true : activeTab === "remote" ? job.isRemote === true : true;

//     const currentJobType = job.jobType || "Full Time";
//     const matchesJobType = selectedJobType ? currentJobType === selectedJobType : true;

//     const currentExperience = job.experience || "More than 0 year";
//     const matchesExperience = selectedExperience.length > 0 ? selectedExperience.includes(currentExperience) : true;

//     const currentSalary = job.salary || "Competitive";
//     const matchesSalary = selectedSalary.length > 0 ? selectedSalary.includes(currentSalary) : true;

//     const currentDomain = job.domain || "Engineering";
//     const matchesDomain = selectedDomain ? currentDomain === selectedDomain : true;

//     const matchesDate = selectedDate ? job.date === selectedDate : true;

//     return matchesSearch && matchesTab && matchesJobType && matchesExperience && matchesSalary && matchesDomain && matchesDate;
//   });

//   // Dynamic Metadata Construction based on Active State
//   const pageTitle = activeTab === "remote" 
//     ? "Remote Software & Tech Jobs | Direct Application Links | GetJobLink"
//     : activeTab === "post-job"
//     ? "Post a Job | Reach Active Engineering Candidates | GetJobLink"
//     : "GetJobLink — Direct Hiring Links for Top Engineering & Tech Roles";

//   const pageDescription = "Discover top software engineering, design, and product management jobs with official direct application links. Skip recruiter black holes.";

//   // Schema.org JobPosting Structured Data for Google Jobs Rich Snippets
//   const jobSchemaList = matchingJobs.slice(0, 10).map((job) => ({
//     "@context": "https://schema.org/",
//     "@type": "JobPosting",
//     "title": job.title,
//     "description": job.jd || "Apply directly for this technology position.",
//     "identifier": {
//       "@type": "PropertyValue",
//       "name": job.company,
//       "value": job.id
//     },
//     "datePosted": job.date || new Date().toISOString().split("T")[0],
//     "employmentType": job.jobType === "Internship" ? "INTERN" : "FULL_TIME",
//     "hiringOrganization": {
//       "@type": "Organization",
//       "name": job.company
//     },
//     "jobLocation": job.isRemote ? {
//       "@type": "Place",
//       "address": {
//         "@type": "PostalAddress",
//         "addressCountry": "Remote"
//       }
//     } : {
//       "@type": "Place",
//       "address": {
//         "@type": "PostalAddress",
//         "addressCountry": "Global"
//       }
//     },
//     "applicantLocationRequirements": job.isRemote ? {
//       "@type": "Country",
//       "name": "WORLDWIDE"
//     } : undefined,
//     "jobLocationType": job.isRemote ? "TELECOMMUTE" : undefined,
//     "directApply": true,
//     "url": job.url
//   }));

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col justify-between">

//       {/* SEO HEAD METADATA */}
//       <Helmet>
//         <html lang="en" />
//         <title>{pageTitle}</title>
//         <meta name="description" content={pageDescription} />
//         <meta name="keywords" content="tech jobs, software engineer jobs, direct hiring links, remote tech jobs, internship openings, SDE jobs" />
//         <meta name="robots" content="index, follow" />
//         <link rel="canonical" href="https://getjoblink.com" />

//         {/* Open Graph / Facebook */}
//         <meta property="og:type" content="website" />
//         <meta property="og:title" content={pageTitle} />
//         <meta property="og:description" content={pageDescription} />
//         <meta property="og:image" content={logoImg} />
//         <meta property="og:url" content="https://getjoblink.com" />

//         {/* Twitter Cards */}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:site" content="@GetJobLink" />
//         <meta name="twitter:title" content={pageTitle} />
//         <meta name="twitter:description" content={pageDescription} />
//         <meta name="twitter:image" content={logoImg} />

//         {/* Structured Data / Google Search Schema */}
//         <script type="application/ld+json">
//           {JSON.stringify(jobSchemaList)}
//         </script>
//       </Helmet>

//       <div>
//         {notification && (
//           <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
//             <CheckCircle className="w-5 h-5 text-emerald-400" />
//             <span className="text-sm font-medium">{notification}</span>
//           </div>
//         )}

//         {/* HEADER SECTION WITH INTEGRATED SEARCH INPUT */}
//         <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
//             <div className="flex items-center space-x-2.5 select-none shrink-0">
//               <img src={logoImg} alt="Get Job Link Logo - Direct Hiring Platform" className="w-8 h-8 object-contain rounded-lg" />
//               <span className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:inline">
//                 GetJob<span className="text-blue-600">Link</span>
//               </span>
//             </div>

//             {/* Top Search Bar */}
//             <div className="flex-1 max-w-2xl mx-2">
//               <label htmlFor="search-input" className="sr-only">Search tech jobs and companies</label>
//               <div className="relative">
//                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   id="search-input"
//                   type="text"
//                   placeholder="Search jobs by title, company, or tech stack..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
//               <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-0.5">
//                 <button aria-label="Switch to grid view" onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><LayoutGrid className="w-4 h-4" /></button>
//                 <button aria-label="Switch to table view" onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Table className="w-4 h-4" /></button>
//               </div>

//               {currentUser ? (
//                 <div className="flex items-center space-x-2">
//                   {currentUser.photoURL && <img src={currentUser.photoURL} alt="Admin profile picture" className="w-7 h-7 rounded-full border border-slate-200" />}
//                   <button onClick={handleGoogleLogout} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-xl border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
//                     <span>Sign Out</span>
//                   </button>
//                 </div>
//               ) : (
//                 <button onClick={handleGoogleLogin} className="inline-flex items-center space-x-1 text-xs font-bold tracking-wide uppercase px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm">
//                   <span>Admin Login</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </header>

//         {/* STICKY SOCIAL MEDIA BANNER */}
//         <div className="sticky top-[57px] z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-3">
//           <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md">
//             <div>
//               <h2 className="text-sm sm:text-base font-bold tracking-tight">Follow GetJobLink for Daily Direct Job Alerts</h2>
//               <p className="text-slate-300 text-xs mt-0.5 hidden sm:block">Get direct tech hiring links, engineering openings, and tech career updates.</p>
//             </div>
//             <div className="flex items-center flex-wrap gap-2.5 shrink-0">
//               <a 
//                 href="https://www.linkedin.com/in/getjob-link-b62169334/" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 aria-label="Follow GetJobLink on LinkedIn"
//                 className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
//               >
//                 <LinkedinIcon className="w-3.5 h-3.5" />
//                 <span>LinkedIn</span>
//               </a>
//               <a 
//                 href="https://x.com/GetJobLink" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 aria-label="Follow GetJobLink on Twitter"
//                 className="inline-flex items-center space-x-1.5 bg-black hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm border border-slate-800"
//               >
//                 <TwitterIcon className="w-3.5 h-3.5" />
//                 <span>X (Twitter)</span>
//               </a>
//             </div>
//           </div>
//         </div>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

//           {/* SPLIT HERO SECTION */}
//           <section className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-16 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl mb-10">
//             <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

//             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
//               <div className="lg:col-span-7 space-y-5 text-left">
//                 <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-medium text-blue-400 backdrop-blur-md">
//                   <span className="relative flex h-2 w-2">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
//                   </span>
//                   <span>Direct Hiring Opportunities Updated Daily</span>
//                 </div>

//                 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
//                   Discover Top Tech Roles <br />
//                   <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
//                     Without the Noise.
//                   </span>
//                 </h1>

//                 <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
//                   Direct application links, curated engineering roles, and verified opportunities. Skip the recruiter black hole and land your next offer faster.
//                 </p>

//                 <div className="flex flex-wrap items-center gap-4 pt-2">
//                   <a
//                     href="#job-listings"
//                     className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 group"
//                   >
//                     <span>Explore Openings ({jobs.length})</span>
//                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                   </a>

//                   <div className="flex items-center space-x-2 text-xs text-slate-400 px-2 py-1">
//                     <ShieldCheck className="w-4 h-4 text-emerald-400" />
//                     <span>100% Direct Official Job Links</span>
//                   </div>
//                 </div>
//               </div>

//               {/* USER COUNT ANALYTICS CARD */}
//               <div className="lg:col-span-5">
//                 <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                  
//                   <div className="flex items-center justify-between pb-4 border-b border-slate-800">
//                     <div className="flex items-center space-x-3">
//                       <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
//                         <TrendingUp className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Analytics</p>
//                         <h3 className="text-xs font-bold text-white">Weekly Traffic Activity</h3>
//                       </div>
//                     </div>
//                     <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
//                   </div>

//                   <div className="py-5 space-y-5">
                    
//                     <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
//                       <div>
//                         <span className="text-xs text-slate-400 block mb-1">Active Job Seekers This Week</span>
//                         <div className="flex items-baseline space-x-2">
//                           <span className="text-3xl font-black tracking-tight text-white">{weeklyUsers}</span>
//                           <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
//                             +18% vs last week
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-2 text-xs text-slate-300">
//                       <div className="flex items-center space-x-2">
//                         <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
//                         <span>Direct career portal redirects</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
//                         <span>No sign-up necessary for applicants</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
//                         <span>Filtered for full-time & internship roles</span>
//                       </div>
//                     </div>

//                   </div>

//                   <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
//                     <span>Verified metrics</span>
//                     <span className="flex items-center space-x-1">
//                       <Briefcase className="w-3 h-3" />
//                       <span>Global Opportunities</span>
//                     </span>
//                   </div>

//                 </div>
//               </div>

//             </div>
//           </section>

//           {/* TAB HEADER */}
//           <div id="job-listings" className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-px">
//             <button onClick={() => setActiveTab("all")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
//               <Briefcase className="w-4 h-4" />
//               <span>All Openings</span>
//             </button>
//             <button onClick={() => setActiveTab("remote")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "remote" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
//               <Globe className="w-4 h-4" />
//               <span>Remote Jobs</span>
//             </button>
//             <button onClick={() => setActiveTab("post-job")} className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "post-job" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
//               <PlusCircle className="w-4 h-4" />
//               <span>Post Your Jobs Here</span>
//             </button>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
//             {/* FILTERS SIDEBAR */}
//             <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
//               <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-start space-x-2.5">
//                 <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
//                 <p className="text-xs text-slate-600 leading-relaxed">
//                   <span className="font-bold text-slate-800">Important Note:</span> We are a third-party organization aggregating official job links directly to help candidates secure opportunities.
//                 </p>
//               </div>

//               <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//                 <h2 className="text-base font-bold text-slate-900">Filters</h2>
//                 <button onClick={clearAllFilters} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Clear All</button>
//               </div>

//               <div>
//                 <label htmlFor="filter-date" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">Date Added</label>
//                 <input 
//                   id="filter-date"
//                   type="date" 
//                   value={selectedDate} 
//                   onChange={(e) => setSelectedDate(e.target.value)} 
//                   max={new Date().toISOString().split("T")[0]}
//                   className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
//                 />
//               </div>

//               <div>
//                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Job Type</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {["Full Time", "Internship"].map((type) => (
//                     <button key={type} onClick={() => setSelectedJobType(selectedJobType === type ? "" : type)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedJobType === type ? "bg-blue-50 border-blue-600 text-blue-600 font-semibold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//                       {type}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Experience</h3>
//                 <div className="space-y-2 text-sm text-slate-600">
//                   {["More than 0 year", "More than 1 year", "More than 2 years", "More than 3 years", "More than 4 years"].map((exp) => (
//                     <label key={exp} className="flex items-center space-x-2.5 cursor-pointer">
//                       <input type="checkbox" checked={selectedExperience.includes(exp)} onChange={() => handleCheckboxChange(exp, selectedExperience, setSelectedExperience)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
//                       <span>{exp}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Salary</h3>
//                 <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
//                   {[
//                     "Competitive", 
//                     "2-4 LPA", 
//                     "4-6 LPA", 
//                     "6-10 LPA", 
//                     "10-20 LPA", 
//                     "20-30 LPA", 
//                     "$10 - $20 /hr",
//                     "$20 - $30 /hr",
//                     "$30 - $40 /hr",
//                     "$40+ /hr"
//                   ].map((sal) => (
//                     <label key={sal} className="flex items-center space-x-2.5 cursor-pointer">
//                       <input type="checkbox" checked={selectedSalary.includes(sal)} onChange={() => handleCheckboxChange(sal, selectedSalary, setSelectedSalary)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
//                       <span>{sal}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="filter-domain" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">Domain</label>
//                 <select id="filter-domain" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
//                   <option value="">Select domain</option>
//                   <option value="Engineering">Engineering / Tech</option>
//                   <option value="Design">Product Design</option>
//                   <option value="Marketing">Marketing</option>
//                   <option value="Management">Product Management</option>
//                   <option value="Data Entry">Operations / Data Entry</option>
//                 </select>
//               </div>
//             </aside>

//             {/* MAIN CONTENT AREA */}
//             <section className={`${isAdmin ? "lg:col-span-5" : "lg:col-span-9"} space-y-6`}>
//               {activeTab === "post-job" ? (
//                 <article className="flex flex-col items-center text-center py-12 px-4 bg-transparent max-w-4xl mx-auto">
//                   <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
//                     Post a Job Opening on GetJobLink
//                   </h2>
//                   <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
//                     We're currently accepting job postings directly via email. To post a job, please contact our team.
//                   </p>

//                   <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center mb-12">
//                     <h3 className="text-lg font-bold text-slate-900 mb-5">Contact Us to Post</h3>
//                     <a 
//                       href="mailto:getjoblink647@gmail.com" 
//                       className="inline-flex items-center space-x-3 bg-slate-950 hover:bg-slate-900 text-white font-medium py-3.5 px-8 rounded-xl transition-all shadow-md group w-full sm:w-auto justify-center"
//                     >
//                       <Mail className="w-5 h-5 text-slate-300 group-hover:text-white" />
//                       <span className="text-sm md:text-base tracking-wide">getjoblink647@gmail.com</span>
//                     </a>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
//                     <div className="space-y-2">
//                       <div className="flex items-center space-x-2 text-slate-900">
//                         <Zap className="w-4 h-4 text-blue-600" />
//                         <h3 className="font-bold text-base">Reach Targeted Talent</h3>
//                       </div>
//                       <p className="text-sm text-slate-500 leading-relaxed">
//                         Connect with qualified candidates actively looking for tech opportunities.
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex items-center space-x-2 text-slate-900">
//                         <CheckSquare className="w-4 h-4 text-blue-600" />
//                         <h3 className="font-bold text-base">Simple Process</h3>
//                       </div>
//                       <p className="text-sm text-slate-500 leading-relaxed">
//                         Just send us the job details, and we'll handle the formatting and posting.
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex items-center space-x-2 text-slate-900">
//                         <Briefcase className="w-4 h-4 text-blue-600" />
//                         <h3 className="font-bold text-base">Quick Support</h3>
//                       </div>
//                       <p className="text-sm text-slate-500 leading-relaxed">
//                         Our team is available to help you with any questions about your listing.
//                       </p>
//                     </div>
//                   </div>
//                 </article>
//               ) : (
//                 <>
//                   {matchingJobs.length === 0 ? (
//                     <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
//                       <p className="text-slate-400 font-medium text-sm">No active job listings found matching your search parameters.</p>
//                     </div>
//                   ) : viewMode === "grid" ? (
//                     <div className="grid grid-cols-1 gap-4">
//                       {matchingJobs.map((job) => (
//                         <article key={job.id} className={`bg-white p-6 rounded-2xl border transition-all shadow-sm flex flex-col justify-between relative overflow-hidden ${editingJobId === job.id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200"}`}>
//                           {job.isRemote && (
//                             <span className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-emerald-100 uppercase tracking-wider">
//                               Remote
//                             </span>
//                           )}
//                           <div>
//                             <div className="flex items-start justify-between mb-3">
//                               <div>
//                                 <h2 className="text-base font-bold text-slate-900 tracking-tight">{job.title}</h2>
//                                 <p className="text-sm font-bold text-blue-600 mt-0.5">{job.company}</p>
//                                 <div className="flex flex-wrap gap-1.5 mt-2">
//                                   <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.jobType || "Full Time"}</span>
//                                   <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.experience || "More than 0 year"}</span>
//                                   <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.salary || "Competitive"}</span>
//                                 </div>
//                               </div>

//                               {isAdmin && (
//                                 <div className="flex items-center space-x-1">
//                                   <button aria-label="Edit job" onClick={() => startEditingJob(job)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
//                                     <Pencil className="w-4 h-4" />
//                                   </button>
//                                   <button aria-label="Delete job" onClick={() => handleRemoveJob(job.id)} className="p-1.5 text-slate-400">
//                                     <Trash2 className="w-4 h-4 text-red-500" />
//                                   </button>
//                                 </div>
//                               )}
//                             </div>

//                             <p className="text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">
//                               {job.jd}
//                             </p>
//                           </div>

//                           <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
//                             <div className="flex items-center space-x-1 text-slate-400 text-xs">
//                               <Calendar className="w-3.5 h-3.5" />
//                               <span>{job.date || "Recently"}</span>
//                             </div>

//                             <a
//                               href={job.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
//                             >
//                               <span>Apply Directly</span>
//                               <ExternalLink className="w-3.5 h-3.5" />
//                             </a>
//                           </div>
//                         </article>
//                       ))}
//                     </div>
//                   ) : (
//                     /* TABLE VIEW */
//                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//                       <div className="overflow-x-auto">
//                         <table className="w-full text-left text-xs">
//                           <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
//                             <tr>
//                               <th scope="col" className="px-4 py-3">Role</th>
//                               <th scope="col" className="px-4 py-3">Company</th>
//                               <th scope="col" className="px-4 py-3">Type</th>
//                               <th scope="col" className="px-4 py-3">Experience</th>
//                               <th scope="col" className="px-4 py-3">Salary</th>
//                               <th scope="col" className="px-4 py-3">Date</th>
//                               <th scope="col" className="px-4 py-3 text-right">Action</th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-slate-100 text-slate-700">
//                             {matchingJobs.map((job) => (
//                               <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
//                                 <td className="px-4 py-3 font-bold text-slate-900">{job.title}</td>
//                                 <td className="px-4 py-3 font-semibold text-blue-600">{job.company}</td>
//                                 <td className="px-4 py-3">{job.jobType || "Full Time"}</td>
//                                 <td className="px-4 py-3">{job.experience || "More than 0 year"}</td>
//                                 <td className="px-4 py-3">{job.salary || "Competitive"}</td>
//                                 <td className="px-4 py-3 text-slate-400">{job.date || "Recently"}</td>
//                                 <td className="px-4 py-3 text-right">
//                                   <div className="flex items-center justify-end space-x-2">
//                                     {isAdmin && (
//                                       <>
//                                         <button aria-label="Edit job" onClick={() => startEditingJob(job)} className="text-slate-400 hover:text-blue-600 p-1">
//                                           <Pencil className="w-3.5 h-3.5" />
//                                         </button>
//                                         <button aria-label="Delete job" onClick={() => handleRemoveJob(job.id)} className="text-slate-400 hover:text-red-600 p-1">
//                                           <Trash2 className="w-3.5 h-3.5" />
//                                         </button>
//                                       </>
//                                     )}
//                                     <a
//                                       href={job.url}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="inline-flex items-center space-x-1 bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-all"
//                                     >
//                                       <span>Apply</span>
//                                       <ExternalLink className="w-3 h-3" />
//                                     </a>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </section>

//             {/* ADMIN FORM SIDEBAR */}
//             {isAdmin && (
//               <aside className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20">
//                 <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
//                   <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
//                     <PlusCircle className="w-5 h-5 text-blue-600" />
//                     <span>{editingJobId ? "Edit Job Listing" : "Add Job Listing"}</span>
//                   </h2>
//                   {editingJobId && (
//                     <button aria-label="Cancel editing" onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
//                       <X className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>

//                 <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
//                   <div>
//                     <label htmlFor="form-title" className="block font-bold text-slate-700 mb-1">Job Title *</label>
//                     <input
//                       id="form-title"
//                       type="text"
//                       required
//                       value={formData.title}
//                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       placeholder="e.g. Frontend Engineer"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="form-company" className="block font-bold text-slate-700 mb-1">Company Name *</label>
//                     <input
//                       id="form-company"
//                       type="text"
//                       required
//                       value={formData.company}
//                       onChange={(e) => setFormData({ ...formData, company: e.target.value })}
//                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       placeholder="e.g. Google"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="form-url" className="block font-bold text-slate-700 mb-1">Application URL *</label>
//                     <input
//                       id="form-url"
//                       type="url"
//                       required
//                       value={formData.url}
//                       onChange={(e) => setFormData({ ...formData, url: e.target.value })}
//                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       placeholder="https://company.com/careers/job"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label htmlFor="form-jobType" className="block font-bold text-slate-700 mb-1">Job Type</label>
//                       <select
//                         id="form-jobType"
//                         value={formData.jobType}
//                         onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
//                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       >
//                         <option value="Full Time">Full Time</option>
//                         <option value="Internship">Internship</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label htmlFor="form-domain" className="block font-bold text-slate-700 mb-1">Domain</label>
//                       <select
//                         id="form-domain"
//                         value={formData.domain}
//                         onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
//                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       >
//                         <option value="Engineering">Engineering</option>
//                         <option value="Design">Design</option>
//                         <option value="Marketing">Marketing</option>
//                         <option value="Management">Management</option>
//                         <option value="Data Entry">Data Entry</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label htmlFor="form-experience" className="block font-bold text-slate-700 mb-1">Experience</label>
//                       <select
//                         id="form-experience"
//                         value={formData.experience}
//                         onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
//                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       >
//                         <option value="More than 0 year">More than 0 year</option>
//                         <option value="More than 1 year">More than 1 year</option>
//                         <option value="More than 2 years">More than 2 years</option>
//                         <option value="More than 3 years">More than 3 years</option>
//                         <option value="More than 4 years">More than 4 years</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label htmlFor="form-salary" className="block font-bold text-slate-700 mb-1">Salary</label>
//                       <select
//                         id="form-salary"
//                         value={formData.salary}
//                         onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
//                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       >
//                         <option value="Competitive">Competitive</option>
//                         <option value="2-4 LPA">2-4 LPA</option>
//                         <option value="4-6 LPA">4-6 LPA</option>
//                         <option value="6-10 LPA">6-10 LPA</option>
//                         <option value="10-20 LPA">10-20 LPA</option>
//                         <option value="20-30 LPA">20-30 LPA</option>
//                         <option value="$10 - $20 /hr">$10 - $20 /hr</option>
//                         <option value="$20 - $30 /hr">$20 - $30 /hr</option>
//                         <option value="$30 - $40 /hr">$30 - $40 /hr</option>
//                         <option value="$40+ /hr">$40+ /hr</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="form-jd" className="block font-bold text-slate-700 mb-1">Description</label>
//                     <textarea
//                       id="form-jd"
//                       rows="3"
//                       value={formData.jd}
//                       onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
//                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                       placeholder="Role summary or qualifications..."
//                     />
//                   </div>

//                   <div className="flex items-center space-x-2 pt-1">
//                     <input
//                       type="checkbox"
//                       id="isRemote"
//                       checked={formData.isRemote}
//                       onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
//                       className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
//                     />
//                     <label htmlFor="isRemote" className="font-semibold text-slate-700">Remote Position</label>
//                   </div>

//                   <div className="pt-2 flex space-x-2">
//                     <button
//                       type="submit"
//                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs"
//                     >
//                       {editingJobId ? "Update Job" : "Publish Job"}
//                     </button>
//                     {editingJobId && (
//                       <button
//                         type="button"
//                         onClick={cancelEditing}
//                         className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-all text-xs"
//                       >
//                         Cancel
//                       </button>
//                     )}
//                   </div>
//                 </form>
//               </aside>
//             )}

//           </div>
//         </main>
//       </div>

//       {/* FOOTER */}
//       <footer className="bg-white border-t border-slate-200 mt-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
//           <div className="flex items-center space-x-2">
//             <img src={logoImg} alt="Get Job Link Logo Footer" className="w-5 h-5 object-contain rounded" />
//             <span className="font-bold text-slate-800">GetJobLink</span>
//             <span>© {new Date().getFullYear()} — All rights reserved.</span>
//           </div>
//           <div className="flex items-center space-x-4">
//             <a href="mailto:getjoblink647@gmail.com" className="hover:text-slate-800 transition-colors">Contact</a>
//             <a href="https://www.linkedin.com/in/getjob-link-b62169334/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">LinkedIn</a>
//             <a href="https://x.com/GetJobLink" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">Twitter</a>
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// }






















import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { 
  PlusCircle, Search, ExternalLink, Trash2, Calendar, LayoutGrid, Table, 
  CheckCircle, Briefcase, Globe, Info, Mail, Zap, CheckSquare, Pencil, X,
  TrendingUp, ArrowRight, ShieldCheck, CheckCircle2, Sparkles
} from "lucide-react";
import logoImg from "./assets/logo.jpeg";

import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

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

  // Load Adcash Anti-Adblock library from Render backend and run AutoTag
  // useEffect(() => {
  //   const adLibScript = document.createElement("script");
  //   adLibScript.src = "https://get-job-link.onrender.com/api/adcash-lib.js"; 
  //   adLibScript.async = true;

  //   adLibScript.onload = () => {
  //     if (window.aclib) {
  //       window.aclib.runAutoTag({
  //         zoneId: 'mgttqf1elu',
  //       });
  //     }
  //   };

  //   document.head.appendChild(adLibScript);

  //   return () => {
  //     if (document.head.contains(adLibScript)) {
  //       document.head.removeChild(adLibScript);
  //     }
  //   };
  // }, []);

// Load Adcash Anti-Adblock library from Render backend and run all ad formats
useEffect(() => {
  const adLibScript = document.createElement("script");
  adLibScript.src = "https://get-job-link.onrender.com/api/adcash-lib.js"; 
  adLibScript.async = true;

  adLibScript.onload = () => {
    if (window.aclib) {
      // 1. AutoTag Ad Format
      window.aclib.runAutoTag({
        zoneId: 'mgttqf1elu',
      });

      // 2. In-Page Push Ad Format (Zone: 11775618)
      window.aclib.runInPagePush({
        zoneId: '11775618',
        maxAds: 2,
      });

      // 3. Pop-Under Ad Format (Zone: 11775646)
      window.aclib.runPop({
        zoneId: '11775646',
      });
    }
  };

  document.head.appendChild(adLibScript);

  return () => {
    if (document.head.contains(adLibScript)) {
      document.head.removeChild(adLibScript);
    }
  };
}, []);
  useEffect(() => {
    const randomCount = (Math.random() * (10.0 - 1.0) + 1.0).toFixed(1);
    setWeeklyUsers(`${randomCount}k+`);
  }, []);

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

  const pageTitle = activeTab === "remote" 
    ? "Remote Software & Tech Jobs | Direct Application Links | GetJobLink"
    : activeTab === "post-job"
    ? "Post a Job | Reach Active Engineering Candidates | GetJobLink"
    : "GetJobLink — Direct Hiring Links for Top Engineering & Tech Roles";

  const pageDescription = "Discover top software engineering, design, and product management jobs with official direct application links. Skip recruiter black holes.";

  const jobSchemaList = matchingJobs.slice(0, 10).map((job) => ({
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.jd || "Apply directly for this technology position.",
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company,
      "value": job.id
    },
    "datePosted": job.date || new Date().toISOString().split("T")[0],
    "employmentType": job.jobType === "Internship" ? "INTERN" : "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company
    },
    "jobLocation": job.isRemote ? {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Remote"
      }
    } : {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Global"
      }
    },
    "applicantLocationRequirements": job.isRemote ? {
      "@type": "Country",
      "name": "WORLDWIDE"
    } : undefined,
    "jobLocationType": job.isRemote ? "TELECOMMUTE" : undefined,
    "directApply": true,
    "url": job.url
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col justify-between">
      <Helmet>
        <html lang="en" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="tech jobs, software engineer jobs, direct hiring links, remote tech jobs, internship openings, SDE jobs" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://getjoblink.com" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={logoImg} />
        <meta property="og:url" content="https://getjoblink.com" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GetJobLink" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={logoImg} />

        <script type="application/ld+json">
          {JSON.stringify(jobSchemaList)}
        </script>
      </Helmet>

      <div>
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}

        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 select-none shrink-0">
              <img src={logoImg} alt="Get Job Link Logo - Direct Hiring Platform" className="w-8 h-8 object-contain rounded-lg" />
              <span className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:inline">
                GetJob<span className="text-blue-600">Link</span>
              </span>
            </div>

            <div className="flex-1 max-w-2xl mx-2">
              <label htmlFor="search-input" className="sr-only">Search tech jobs and companies</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search jobs by title, company, or tech stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-0.5">
                <button aria-label="Switch to grid view" onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><LayoutGrid className="w-4 h-4" /></button>
                <button aria-label="Switch to table view" onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Table className="w-4 h-4" /></button>
              </div>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  {currentUser.photoURL && <img src={currentUser.photoURL} alt="Admin profile picture" className="w-7 h-7 rounded-full border border-slate-200" />}
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

        <div className="sticky top-[57px] z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-3">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md">
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Follow GetJobLink for Daily Direct Job Alerts</h2>
              <p className="text-slate-300 text-xs mt-0.5 hidden sm:block">Get direct tech hiring links, engineering openings, and tech career updates.</p>
            </div>
            <div className="flex items-center flex-wrap gap-2.5 shrink-0">
              <a 
                href="https://www.linkedin.com/in/getjob-link-b62169334/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Follow GetJobLink on LinkedIn"
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://x.com/GetJobLink" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Follow GetJobLink on Twitter"
                className="inline-flex items-center space-x-1.5 bg-black hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm border border-slate-800"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
                <span>X (Twitter)</span>
              </a>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

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
                <label htmlFor="filter-date" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">Date Added</label>
                <input 
                  id="filter-date"
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
                <label htmlFor="filter-domain" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">Domain</label>
                <select id="filter-domain" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Select domain</option>
                  <option value="Engineering">Engineering / Tech</option>
                  <option value="Design">Product Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Product Management</option>
                  <option value="Data Entry">Operations / Data Entry</option>
                </select>
              </div>
            </aside>

            <section className={`${isAdmin ? "lg:col-span-5" : "lg:col-span-9"} space-y-6`}>
              {activeTab === "post-job" ? (
                <article className="flex flex-col items-center text-center py-12 px-4 bg-transparent max-w-4xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Post a Job Opening on GetJobLink
                  </h2>
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
                        <h3 className="font-bold text-base">Reach Targeted Talent</h3>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Connect with qualified candidates actively looking for tech opportunities.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-slate-900">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-base">Simple Process</h3>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Just send us the job details, and we'll handle the formatting and posting.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-slate-900">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-base">Quick Support</h3>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Our team is available to help you with any questions about your listing.
                      </p>
                    </div>
                  </div>
                </article>
              ) : (
                <>
                  {matchingJobs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-slate-400 font-medium text-sm">No active job listings found matching your search parameters.</p>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-4">
                      {matchingJobs.map((job) => (
                        <article key={job.id} className={`bg-white p-6 rounded-2xl border transition-all shadow-sm flex flex-col justify-between relative overflow-hidden ${editingJobId === job.id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200"}`}>
                          {job.isRemote && (
                            <span className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-emerald-100 uppercase tracking-wider">
                              Remote
                            </span>
                          )}
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h2 className="text-base font-bold text-slate-900 tracking-tight">{job.title}</h2>
                                <p className="text-sm font-bold text-blue-600 mt-0.5">{job.company}</p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.jobType || "Full Time"}</span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.experience || "More than 0 year"}</span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded">{job.salary || "Competitive"}</span>
                                </div>
                              </div>

                              {isAdmin && (
                                <div className="flex items-center space-x-1">
                                  <button aria-label="Edit job" onClick={() => startEditingJob(job)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button aria-label="Delete job" onClick={() => handleRemoveJob(job.id)} className="p-1.5 text-slate-400">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <p className="text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">
                              {job.jd}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                            <div className="flex items-center space-x-1 text-slate-400 text-xs">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{job.date || "Recently"}</span>
                            </div>

                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                            >
                              <span>Apply Directly</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th scope="col" className="px-4 py-3">Role</th>
                              <th scope="col" className="px-4 py-3">Company</th>
                              <th scope="col" className="px-4 py-3">Type</th>
                              <th scope="col" className="px-4 py-3">Experience</th>
                              <th scope="col" className="px-4 py-3">Salary</th>
                              <th scope="col" className="px-4 py-3">Date</th>
                              <th scope="col" className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {matchingJobs.map((job) => (
                              <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900">{job.title}</td>
                                <td className="px-4 py-3 font-semibold text-blue-600">{job.company}</td>
                                <td className="px-4 py-3">{job.jobType || "Full Time"}</td>
                                <td className="px-4 py-3">{job.experience || "More than 0 year"}</td>
                                <td className="px-4 py-3">{job.salary || "Competitive"}</td>
                                <td className="px-4 py-3 text-slate-400">{job.date || "Recently"}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    {isAdmin && (
                                      <>
                                        <button aria-label="Edit job" onClick={() => startEditingJob(job)} className="text-slate-400 hover:text-blue-600 p-1">
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button aria-label="Delete job" onClick={() => handleRemoveJob(job.id)} className="text-slate-400 hover:text-red-600 p-1">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                    <a
                                      href={job.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-all"
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

            {isAdmin && (
              <aside className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <PlusCircle className="w-5 h-5 text-blue-600" />
                    <span>{editingJobId ? "Edit Job Listing" : "Add Job Listing"}</span>
                  </h2>
                  {editingJobId && (
                    <button aria-label="Cancel editing" onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="form-title" className="block font-bold text-slate-700 mb-1">Job Title *</label>
                    <input
                      id="form-title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. Frontend Engineer"
                    />
                  </div>

                  <div>
                    <label htmlFor="form-company" className="block font-bold text-slate-700 mb-1">Company Name *</label>
                    <input
                      id="form-company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. Google"
                    />
                  </div>

                  <div>
                    <label htmlFor="form-url" className="block font-bold text-slate-700 mb-1">Application URL *</label>
                    <input
                      id="form-url"
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="https://company.com/careers/job"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="form-jobType" className="block font-bold text-slate-700 mb-1">Job Type</label>
                      <select
                        id="form-jobType"
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="form-domain" className="block font-bold text-slate-700 mb-1">Domain</label>
                      <select
                        id="form-domain"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Management">Management</option>
                        <option value="Data Entry">Data Entry</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="form-experience" className="block font-bold text-slate-700 mb-1">Experience</label>
                      <select
                        id="form-experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="More than 0 year">More than 0 year</option>
                        <option value="More than 1 year">More than 1 year</option>
                        <option value="More than 2 years">More than 2 years</option>
                        <option value="More than 3 years">More than 3 years</option>
                        <option value="More than 4 years">More than 4 years</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="form-salary" className="block font-bold text-slate-700 mb-1">Salary</label>
                      <select
                        id="form-salary"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  </div>

                  <div>
                    <label htmlFor="form-jd" className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      id="form-jd"
                      rows="3"
                      value={formData.jd}
                      onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Role summary or qualifications..."
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="isRemote"
                      checked={formData.isRemote}
                      onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="isRemote" className="font-semibold text-slate-700">Remote Position</label>
                  </div>

                  <div className="pt-2 flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs"
                    >
                      {editingJobId ? "Update Job" : "Publish Job"}
                    </button>
                    {editingJobId && (
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-all text-xs"
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

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <img src={logoImg} alt="Get Job Link Logo Footer" className="w-5 h-5 object-contain rounded" />
            <span className="font-bold text-slate-800">GetJobLink</span>
            <span>© {new Date().getFullYear()} — All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="mailto:getjoblink647@gmail.com" className="hover:text-slate-800 transition-colors">Contact</a>
            <a href="https://www.linkedin.com/in/getjob-link-b62169334/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">LinkedIn</a>
            <a href="https://x.com/GetJobLink" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
}