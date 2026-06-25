import React, { useState, useEffect } from "react";
import { PlusCircle, Search, ExternalLink, Trash2, Calendar, LayoutGrid, Table, CheckCircle, LogIn, LogOut } from "lucide-react";
import logoImg from "./assets/logo.jpeg";

import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function App() {
  const ADMIN_EMAIL = "sdivyanshu352@gmail.com"; 

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [notification, setNotification] = useState("");
  const [formData, setFormData] = useState({ title: "", company: "", jd: "", url: "" });

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

  // Sync with Firestore Database in Real-Time
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      triggerNotification("Authentication failed. Try again.");
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await signOut(auth);
      triggerNotification("Signed out completely.");
    } catch (error) {
      console.error(error);
    }
  };

  const sanitizeJobUrl = (rawUrl) => {
    try {
      const parsedUrl = new URL(rawUrl);
      return parsedUrl.origin + parsedUrl.pathname;
    } catch (error) {
      return rawUrl;
    }
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
        date: new Date().toISOString().split("T")[0],
        createdAt: Date.now()
      });

      setFormData({ title: "", company: "", jd: "", url: "" });
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
    } catch (error) {
      triggerNotification("Error deleting post.");
    }
  };

  const matchingJobs = jobs.filter((job) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jd?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

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
                {currentUser.photoURL && (
                  <img src={currentUser.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-slate-200" />
                )}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {isAdmin && (
            <aside className="lg:col-span-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                <div className="flex items-center space-x-2 mb-5">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Add Live Job Link</h2>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Job Title</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Software Development Engineer" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Company</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="e.g. WEX" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Raw Job URL</label>
                    <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://careers.company.com/..." className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Job Description (JD)</label>
                    <textarea value={formData.jd} onChange={(e) => setFormData({...formData, jd: e.target.value})} placeholder="Paste requirements here..." rows="4" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm text-sm">
                    <span>Clean & Post Link</span>
                  </button>
                </form>
              </div>
            </aside>
          )}

          <section className={`${isAdmin ? "lg:col-span-8" : "lg:col-span-12"} space-y-6`}>
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
                  <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">{job.title}</h3>
                          <p className="text-sm font-bold text-blue-600 mt-0.5">{job.company}</p>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
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
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-6">Company</th>
                        <th className="py-3 px-6">Role</th>
                        <th className="py-3 px-6">Date Added</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {matchingJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-6 font-bold text-slate-900">{job.company}</td>
                          <td className="py-4 px-6 font-medium text-slate-700">{job.title}</td>
                          <td className="py-4 px-6 text-xs text-slate-400 font-semibold">{job.date}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center space-x-3">
                              <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1">
                                <span>Apply</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              {isAdmin && (
                                <button onClick={() => handleRemoveJob(job.id)} className="text-slate-400 hover:text-red-600 p-1">
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
        </div>
      </main>
    </div>
  );
}