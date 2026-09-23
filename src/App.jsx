import React, { createContext, useContext, useState, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc,
  updateDoc, getDocs, setDoc, writeBatch
} from "firebase/firestore";
import { SOURCES } from "./services/ingestion";
import Router from "./router/Router";
import { CheckCircle2, Users, X } from "lucide-react";

export const AppContext = createContext();

export function useApp() { return useContext(AppContext); }

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [learningReels, setLearningReels] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState("");
  const [editingJobId, setEditingJobId] = useState(null);
  const [weeklyUsers, setWeeklyUsers] = useState("6.1k+");
  const [showLearningBanner, setShowLearningBanner] = useState(false);
  const [showInstaModal, setShowInstaModal] = useState(false);
  const [instaPopupClicks, setInstaPopupClicks] = useState(0);
  const [popupLink, setPopupLink] = useState("https://www.instagram.com/codes_and_clouds/");
  const [bulkDeleteDate, setBulkDeleteDate] = useState("");
  const [formData, setFormData] = useState({ title: "", company: "", jd: "", url: "", jobType: "Full Time", experience: "More than 0 year", salary: "", domain: "Engineering", isRemote: false, skills: "", responsibilities: "", requirements: "", niceToHave: "", benefits: "" });
  const [userResumeSkills, setUserResumeSkills] = useState("");
  const [reelFormData, setReelFormData] = useState({ title: "", description: "", reelUrl: "", category: "Git & GitHub" });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceConfigs, setSourceConfigs] = useState({});
  const [companyPriorities, setCompanyPriorities] = useState([]);

  useEffect(() => {
    const statsDocRef = doc(db, "analytics", "insta_popup");
    const unsubscribe = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setInstaPopupClicks(data.clicks || 0);
        if (data.url) setPopupLink(data.url);
      } else {
        setDoc(statsDocRef, { clicks: 0, url: "https://www.instagram.com/codes_and_clouds/" }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("learning_banner_dismissed")) setShowLearningBanner(true);
  }, []);

  useEffect(() => {
    const randomCount = (Math.random() * (10.0 - 1.0) + 1.0).toFixed(1);
    setWeeklyUsers(`${randomCount}k+`);
  }, []);

  const closeLearningBanner = () => { localStorage.setItem("learning_banner_dismissed", "true"); setShowLearningBanner(false); };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAdmin(user.email === "sdivyanshu352@gmail.com");
        const storedSkills = localStorage.getItem("user_resume_skills");
        setUserResumeSkills(storedSkills || "");
      }
      else { setCurrentUser(null); setIsAdmin(false); setUserResumeSkills(""); }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      const snapshot = await getDocs(collection(db, "learning_reels"));
      if (snapshot.empty) {
        await addDoc(collection(db, "learning_reels"), {
          title: "Day 2 of GitHub in 10 Days",
          description: "Explaining the foundational difference between Git vs GitHub in simple and clear language.",
          reelUrl: "https://www.instagram.com/reel/C8_example_link/",
          category: "Git & GitHub",
          clicks: 0,
          date: new Date().toISOString().split("T")[0],
          createdAt: Date.now()
        });
      }
      const q = query(collection(db, "learning_reels"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(q, (snaps) => {
        setLearningReels(snaps.docs.map((doc) => ({ id: doc.id, clicks: 0, ...doc.data() })));
      });
    })();
    return () => unsubscribe();
  }, []);

  // Firestore listener for source configuration (source_config / defaults)
  useEffect(() => {
    const sourceConfigRef = doc(db, "source_config", "defaults");
    const unsubscribe = onSnapshot(sourceConfigRef, (snap) => {
      const sources = snap.data()?.sources || {};
      setSourceConfigs(sources);
      Object.entries(sources).forEach(([key, config]) => {
        if (SOURCES[key]) {
          SOURCES[key].enabled = Boolean(config.enabled);
        }
      });
      if (!snap.exists()) {
        setDoc(sourceConfigRef, { sources }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore listener for company priorities (company_priority collection)
  useEffect(() => {
    const q = query(collection(db, "company_priority"), orderBy("priority", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCompanyPriorities(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const triggerNotification = (message) => { setNotification(message); setTimeout(() => setNotification(""), 4000); };
  const handleGoogleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch { triggerNotification("Authentication failed. Try again."); } };
  const handleGoogleLogout = async () => { try { await signOut(auth); triggerNotification("Signed out completely."); } catch (error) { console.error(error); } };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.url) { triggerNotification("Please fill in all required fields."); return; }
    try {
      if (editingJobId) {
        await updateDoc(doc(db, "jobs", editingJobId), { ...formData, updatedAt: Date.now() });
        triggerNotification("Job post updated successfully!");
      } else {
        await addDoc(collection(db, "jobs"), { ...formData, date: new Date().toISOString().split("T")[0], createdAt: Date.now() });
        triggerNotification("Job link published directly to production!");
      }
      setFormData({ title: "", company: "", jd: "", url: "", jobType: "Full Time", experience: "More than 0 year", salary: "", domain: "Engineering", isRemote: false });
      setEditingJobId(null);
    } catch (error) { triggerNotification("Error publishing post."); }
  };

  const handleReelSubmit = async (e) => {
    e.preventDefault();
    if (!reelFormData.title || !reelFormData.reelUrl) { triggerNotification("Please fill in all required fields."); return; }
    try {
      await addDoc(collection(db, "learning_reels"), { ...reelFormData, clicks: 0, date: new Date().toISOString().split("T")[0], createdAt: Date.now() });
      setReelFormData({ title: "", description: "", reelUrl: "", category: "Git & GitHub" });
      triggerNotification("Learning Reel successfully added to database!");
    } catch (error) { triggerNotification("Failed to add learning reel."); }
  };

  const handleUpdatePopupLink = async (e) => {
    e.preventDefault();
    if (!popupLink || !popupLink.trim()) { triggerNotification("Please enter a valid URL."); return; }
    try {
      await setDoc(doc(db, "analytics", "insta_popup"), { url: popupLink.trim(), clicks: 0, updatedAt: Date.now() }, { merge: true });
      setInstaPopupClicks(0);
      triggerNotification("Popup Redirect Link updated & click count reset to 0!");
    } catch (error) { triggerNotification(`Failed to save link: ${error.message}`); }
  };

  const handleBulkDelete = async (e) => {
    e.preventDefault();
    if (!bulkDeleteDate) { triggerNotification("Please select a date."); return; }
    if (!window.confirm(`Are you sure you want to delete all job postings added on or before ${bulkDeleteDate}?`)) return;
    try {
      const jobsToDelete = jobs.filter((job) => job.date && job.date <= bulkDeleteDate);
      if (jobsToDelete.length === 0) { triggerNotification("No jobs found matching the date criteria."); return; }
      const batch = writeBatch(db);
      jobsToDelete.forEach((job) => batch.delete(doc(db, "jobs", job.id)));
      await batch.commit();
      triggerNotification(`Successfully deleted ${jobsToDelete.length} jobs.`);
      setBulkDeleteDate("");
    } catch (error) { console.error(error); triggerNotification("Error executing bulk delete."); }
  };

  const handleRemoveJob = async (id) => {
    try { await deleteDoc(doc(db, "jobs", id)); if (editingJobId === id) { setFormData({ title: "", company: "", jd: "", url: "", jobType: "Full Time", experience: "More than 0 year", salary: "", domain: "Engineering", isRemote: false }); setEditingJobId(null); } triggerNotification("Job listing deleted."); }
    catch { triggerNotification("Error deleting post."); }
  };

  const handleRemoveReel = async (id) => {
    try { await deleteDoc(doc(db, "learning_reels", id)); triggerNotification("Reel removed from database."); }
    catch { triggerNotification("Error deleting reel."); }
  };

  const handleCheckboxChange = (value, state, setState) => { if (state.includes(value)) setState(state.filter((item) => item !== value)); else setState([...state, value]); };

  // Source configuration helpers
  const toggleSourceConfig = async (sourceKey) => {
    const sourceConfigRef = doc(db, "source_config", "defaults");
    setSourceConfigs((prev) => {
      const currentEnabled = prev?.[sourceKey]?.enabled ?? false;
      const newEnabled = !currentEnabled;
      updateDoc(sourceConfigRef, { [`sources.${sourceKey}.enabled`]: newEnabled }).catch((error) => {
        console.error("Error toggling source config:", error);
        triggerNotification(`Failed to toggle ${sourceKey}`);
      });
      if (SOURCES[sourceKey]) {
        SOURCES[sourceKey].enabled = newEnabled;
      }
      return { ...prev, [sourceKey]: { ...prev?.[sourceKey], enabled: newEnabled } };
    });
    triggerNotification(`Source ${sourceKey} updated`);
  };

  // Company priority helpers
  const addCompanyPriority = async (company, priority = companyPriorities.length + 1) => {
    try {
      const docRef = await addDoc(collection(db, "company_priority"), {
        company,
        priority,
        enabled: true,
        createdAt: Date.now()
      });
      setCompanyPriorities((prev) => [...prev, { id: docRef.id, company, priority, enabled: true }]);
      triggerNotification(`Company priority "${company}" added.`);
    } catch (error) {
      console.error("Error adding company priority:", error);
      triggerNotification("Failed to add company priority.");
    }
  };

  const updateCompanyPriority = async (id, updates) => {
    try {
      await updateDoc(doc(db, "company_priority", id), updates);
      setCompanyPriorities((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      triggerNotification(`Company priority "${id}" updated.`);
    } catch (error) {
      console.error("Error updating company priority:", error);
      triggerNotification("Failed to update company priority.");
    }
  };

  const removeCompanyPriority = async (id) => {
    try {
      await deleteDoc(doc(db, "company_priority", id));
      setCompanyPriorities((prev) => prev.filter((p) => p.id !== id));
      triggerNotification("Company priority removed.");
    } catch (error) {
      console.error("Error removing company priority:", error);
      triggerNotification("Failed to remove company priority.");
    }
  };

  const shareToLinkedin = (job) => window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent("Job Opening: " + job.title + " at " + job.company)}`, "_blank");
  const shareToTwitter = (job) => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Hiring: " + job.title + " at " + job.company)}`, "_blank");
  const shareToWhatsapp = (job) => window.open(`https://wa.me/?text=${encodeURIComponent("Job: " + job.title + " at " + job.company)}`, "_blank");
  const shareToInstagram = (job) => { navigator.clipboard.writeText("Job: " + job.title + " at " + job.company).then(() => triggerNotification("Copied!")); window.open("https://www.instagram.com/codes_and_clouds/", "_blank"); };

  const value = {
    jobs, learningReels, currentUser, isAdmin, notification, setNotification,
    editingJobId, setEditingJobId, weeklyUsers, showLearningBanner, setShowLearningBanner,
    showInstaModal, setShowInstaModal, instaPopupClicks, setInstaPopupClicks,
    popupLink, setPopupLink, bulkDeleteDate, setBulkDeleteDate,
    formData, setFormData, userResumeSkills, setUserResumeSkills, reelFormData, setReelFormData, activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    sourceConfigs, setSourceConfigs, companyPriorities, setCompanyPriorities,
    toggleSourceConfig, addCompanyPriority, updateCompanyPriority, removeCompanyPriority,
    triggerNotification, handleGoogleLogin, handleGoogleLogout, handleFormSubmit,
    handleReelSubmit, handleUpdatePopupLink, handleBulkDelete, handleRemoveJob,
    handleRemoveReel, shareToLinkedin, shareToTwitter, shareToWhatsapp, shareToInstagram,
    handleCheckboxChange
  };

  return (
    <AppContext.Provider value={value}>
      <HelmetProvider>
        <Router />
      </HelmetProvider>

      {/* Global Modals */}
      {showInstaModal && <InstaModal />}
      {showLearningBanner && (
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white px-4 py-3 shadow-md sticky top-0 z-40 transition-all border-b border-white/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
              <span><strong>New Update!</strong> A dedicated <strong>Learning Section</strong> has been added with tech reels. Check it out!</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button onClick={() => { closeLearningBanner(); window.location.href = "/jobs"; }} className="bg-white text-purple-700 hover:bg-slate-100 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition-all">Check it out</button>
              <button onClick={closeLearningBanner} className="p-1 text-white/80 hover:text-white rounded-lg transition-colors" aria-label="Dismiss banner"><X className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}
    </AppContext.Provider>
  );
}

function InstaModal() {
  const { showInstaModal, setShowInstaModal, instaPopupClicks, isAdmin, popupLink, setPopupLink, triggerNotification } = useApp();
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100 relative">
        {isAdmin && <div className="mb-4 inline-flex items-center space-x-1.5 bg-pink-50 text-pink-700 border border-pink-200 text-xs font-bold px-3.5 py-1 rounded-full shadow-sm"><Users className="w-3.5 h-3.5 text-pink-600" /><span>Admin: {instaPopupClicks} Total Clicks</span></div>}
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-pink-500/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Join Our Tech Community</h2>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">Follow <strong className="text-slate-900">@codes_and_clouds</strong> on Instagram to unlock access and stay updated!</p>
        <div className="space-y-3">
          <button onClick={() => { window.open(popupLink, "_blank", "noopener,noreferrer"); setShowInstaModal(false); triggerNotification("Thank you for following us!"); }} className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 text-white font-bold text-sm py-3 px-5 rounded-xl transition-all shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <span>Follow on Instagram</span>
          </button>
        </div>
      </div>
    </div>
  );
}
