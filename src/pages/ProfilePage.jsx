import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  FileText,
  Bookmark,
  History,
  Upload,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Save,
  Briefcase,
  MapPin,
  LogIn,
  ThumbsUp,
  Star,
  Send,
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { timeAgo } from "../utils/jobClassification";
import { extractPdfText } from "../utils/pdfExtractor";
import SEO from "../components/SEO";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    userProfile,
    updateUserProfile,
    saveUserResume,
    deleteUserResume,
    savedJobIds,
    toggleSaveJob,
    loginWithGoogle,
  } = useAuth();
  const { showToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const isSavedJobsRoute = location.pathname === "/profile/saved-jobs";
  const activeTab = isSavedJobsRoute ? "saved" : searchParams.get("tab") || "profile";

  // Editable Profile State
  const [headline, setHeadline] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("0-1 years");
  const [skillsInput, setSkillsInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);

  // Saved Jobs State
  const [savedJobsList, setSavedJobsList] = useState([]);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);

  // ATS History State
  const [atsHistoryList, setAtsHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setHeadline(userProfile.headline || "");
      setTargetRole(userProfile.targetRole || "");
      setExperienceLevel(userProfile.experienceLevel || "0-1 years");
      setSkillsInput(userProfile.skills ? userProfile.skills.join(", ") : "");
    }
  }, [userProfile]);

  // Load Saved Jobs when on "saved" tab
  useEffect(() => {
    async function loadSavedJobs() {
      if (!currentUser || activeTab !== "saved") return;
      setLoadingSavedJobs(true);
      try {
        const snap = await getDocs(
          collection(db, "users", currentUser.uid, "savedJobs")
        );
        const list = snap.docs.map((d) => {
          const data = d.data();
          let savedTime = 0;
          if (data.savedAt) {
            if (typeof data.savedAt === "object" && data.savedAt.seconds) {
              savedTime = data.savedAt.seconds * 1000;
            } else if (typeof data.savedAt === "number") {
              savedTime = data.savedAt;
            } else {
              savedTime = new Date(data.savedAt).getTime();
            }
          }
          return { id: d.id, ...data, _savedTime: savedTime };
        });
        list.sort((a, b) => (b._savedTime || 0) - (a._savedTime || 0));
        setSavedJobsList(list);
      } catch (err) {
        console.error("Error loading saved jobs:", err);
      } finally {
        setLoadingSavedJobs(false);
      }
    }

    loadSavedJobs();
  }, [currentUser, activeTab, savedJobIds]);

  // Load ATS History when on "history" tab
  useEffect(() => {
    async function loadHistory() {
      if (!currentUser || activeTab !== "history") return;
      setLoadingHistory(true);
      try {
        const q = query(
          collection(db, "users", currentUser.uid, "atsHistory"),
          orderBy("evaluatedAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAtsHistoryList(list);
      } catch (err) {
        console.error("Error loading ATS history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [currentUser, activeTab]);

  // Feedback Tab State & Loader
  const [feedbackCategory, setFeedbackCategory] = useState("Platform Experience");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    async function loadFeedbacks() {
      if (!currentUser || activeTab !== "feedback") return;
      setLoadingFeedbacks(true);
      try {
        const snap = await getDocs(collection(db, "feedbacks"));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((f) => f.userId === currentUser.uid);
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
          return tB - tA;
        });
        setMyFeedbacks(list);
      } catch (err) {
        console.error("Error loading feedbacks:", err);
      } finally {
        setLoadingFeedbacks(false);
      }
    }
    loadFeedbacks();
  }, [currentUser, activeTab]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!feedbackText.trim()) {
      showToast("Please write your feedback before submitting.", "error");
      return;
    }
    setSubmittingFeedback(true);
    try {
      const docRef = await addDoc(collection(db, "feedbacks"), {
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        userName: currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Member"),
        userPhoto: currentUser.photoURL || "",
        category: feedbackCategory,
        rating: Number(feedbackRating),
        feedback: feedbackText.trim(),
        createdAt: serverTimestamp(),
      });
      setMyFeedbacks((prev) => [
        {
          id: docRef.id,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          category: feedbackCategory,
          rating: Number(feedbackRating),
          feedback: feedbackText.trim(),
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
        },
        ...prev,
      ]);
      setFeedbackText("");
      showToast("Thank you! Your feedback has been submitted successfully.");
    } catch (err) {
      console.error("Feedback submit error:", err);
      showToast("Failed to submit feedback: " + err.message, "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await updateUserProfile({
        headline: headline.trim(),
        targetRole: targetRole.trim(),
        experienceLevel,
        skills: skillsArray,
      });
      showToast("Profile information updated successfully!");
    } catch (err) {
      showToast("Failed to update profile: " + err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload and parse default resume (PDF)
  const handleResumeFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate type & size (max 5MB)
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      showToast("Please upload a PDF or DOCX file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Resume file size must be less than 5MB.", "error");
      return;
    }

    setUploadingResume(true);
    try {
      // 1. Ultra-fast local text extraction using bundled engine (sub-second)
      let extractedText = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        try {
          extractedText = await extractPdfText(file);
        } catch (pdfErr) {
          console.warn("Could not extract PDF text locally:", pdfErr);
        }
      }

      // 2. Generate immediate previewable Data URL for files < 600KB
      let localDataUrl = "";
      if (file.size < 600 * 1024) {
        try {
          localDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result || "");
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });
        } catch (e) {
          console.warn("Local data URL generation skipped:", e);
        }
      }

      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const storagePath = `resumes/${currentUser.uid}/${safeName}`;

      // 3. Immediately save metadata & text into Firestore so user is never blocked or waiting
      await saveUserResume({
        fileName: file.name,
        storagePath,
        downloadUrl: localDataUrl,
        fileSize: file.size,
        contentType: file.type || "application/pdf",
        extractedText: extractedText || "",
        uploadedAt: Date.now(),
      });

      showToast("Default resume uploaded and saved! It will now be used automatically in all ATS checks.");
      setUploadingResume(false);

      // 4. Background cloud storage sync without blocking user
      (async () => {
        try {
          const storageRef = ref(storage, storagePath);
          const uploadPromise = uploadBytes(storageRef, file);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Storage timeout")), 4000)
          );
          await Promise.race([uploadPromise, timeoutPromise]);
          const cloudUrl = await getDownloadURL(storageRef);
          if (cloudUrl) {
            await saveUserResume({
              fileName: file.name,
              storagePath,
              downloadUrl: cloudUrl,
              fileSize: file.size,
              contentType: file.type || "application/pdf",
              extractedText: extractedText || "",
              uploadedAt: Date.now(),
            });
          }
        } catch (storageErr) {
          console.warn("Background cloud storage sync skipped/fallback active:", storageErr.message);
        }
      })();
    } catch (err) {
      console.error("Resume upload failed:", err);
      showToast("Failed to upload resume: " + err.message, "error");
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to delete your saved resume?")) return;
    try {
      if (userProfile?.defaultResume?.storagePath) {
        try {
          const fileRef = ref(storage, userProfile.defaultResume.storagePath);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn("Could not delete physical storage file:", storageErr);
        }
      }
      await deleteUserResume();
      showToast("Resume deleted.");
    } catch (err) {
      showToast("Error deleting resume: " + err.message, "error");
    }
  };

  const handleRemoveSavedJob = async (job) => {
    try {
      await toggleSaveJob(job);
      setSavedJobsList((prev) => prev.filter((j) => j.id !== job.id));
      showToast("Job removed from saved list.");
    } catch (err) {
      showToast("Error removing saved job: " + err.message, "error");
    }
  };

  const handleDeleteAtsHistoryItem = async (evalId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "atsHistory", evalId));
      setAtsHistoryList((prev) => prev.filter((h) => h.id !== evalId));
      showToast("Evaluation entry removed.");
    } catch (err) {
      showToast("Error removing entry: " + err.message, "error");
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Sign In to Access Your Profile
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain your saved jobs, manage your default resume, and review your historical ATS
              evaluations across job applications.
            </p>
          </div>
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
          <div className="pt-2">
            <Link to="/jobs/india" className="text-xs text-slate-400 hover:text-slate-700">
              ← Browse active jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const defaultResume = userProfile?.defaultResume;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <SEO title="User Profile & Resume Management" noIndex={true} />
      {/* Profile Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || "User"}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 font-black text-2xl flex items-center justify-center border-2 border-blue-200">
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUser.displayName || "Job Seeker"}
              </h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Account</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
            {userProfile?.headline && (
              <p className="text-xs font-semibold text-slate-700 pt-0.5">
                {userProfile.headline}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 p-3 rounded-2xl self-stretch sm:self-auto justify-around sm:justify-start">
          <div className="text-center px-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved Jobs</span>
            <span className="text-base font-black text-slate-900">{savedJobIds.size}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center px-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Default Resume</span>
            <span className="text-xs font-bold text-slate-800 flex items-center justify-center space-x-1 mt-0.5">
              {defaultResume ? (
                <span className="text-emerald-600 font-bold">Active</span>
              ) : (
                <span className="text-slate-400">None</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1.5 bg-slate-200/60 p-1 rounded-2xl border border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => navigate("/profile?tab=profile")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => navigate("/profile?tab=resume")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "resume"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Resume</span>
          {defaultResume && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </button>

        <button
          onClick={() => navigate("/profile/saved-jobs")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "saved"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Jobs</span>
          {savedJobIds.size > 0 && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
              {savedJobIds.size}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/profile?tab=history")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>ATS History</span>
        </button>

        <button
          onClick={() => navigate("/profile?tab=feedback")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "feedback"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Platform Feedback</span>
        </button>
      </div>

      {/* TAB 1: PROFILE INFORMATION */}
      {activeTab === "profile" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Career Profile</span>
            </h2>
            <p className="text-xs text-slate-500 pt-1">
              Keep your profile up to date to get tailored role alerts and auto-populate your ATS evaluations.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={currentUser.displayName || ""}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Synchronized from Google account</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email || ""}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer | React & TypeScript Enthusiast"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Category</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="fresher">Fresher (0-1 yr)</option>
                  <option value="1-3 years">1-3 Years</option>
                  <option value="3-5 years">3-5 Years</option>
                  <option value="5+ years">5+ Years</option>
                  <option value="10+ years">10+ Years (Leadership)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Tech Skills (comma-separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, TypeScript, Node.js, PostgreSQL, AWS"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? "Saving Profile..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: RESUME MANAGEMENT */}
      {activeTab === "resume" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Default Resume & ATS Profile</span>
            </h2>
          </div>

          {/* Current Saved Resume Card */}
          {defaultResume ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 max-w-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900 max-w-xs truncate">
                        {defaultResume.fileName}
                      </h3>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-md">
                        Default Resume
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Uploaded {timeAgo(defaultResume.uploadedAt)} • {(defaultResume.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {defaultResume.downloadUrl && (
                    <a
                      href={defaultResume.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl border border-slate-200 transition-colors shadow-2xs"
                      title="Preview Resume"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={handleDeleteResume}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {defaultResume.extractedText ? (
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Parsed Content Ready for Automatic ATS Matching</span>
                  </span>
                  <p className="line-clamp-2 text-[11px] text-slate-500 font-mono">
                    {defaultResume.extractedText.slice(0, 220)}...
                  </p>
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Text parsing not available for this file type. You can replace it with a text-selectable PDF.
                </p>
              )}

              {/* Replace Resume Action */}
              <div className="pt-2 flex items-center space-x-3">
                <label className="cursor-pointer inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Replace With New File</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleResumeFileSelect}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>
                <Link
                  to="/resume"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Or build a new ATS resume
                </Link>
              </div>
            </div>
          ) : (
            /* Empty State: Upload Prompt */
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">Upload Your Default Resume</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Upload your PDF or DOCX resume once. When browsing tech jobs on GetJobLink, you can
                  run instant, 1-click ATS score benchmarks without having to copy-paste your resume each time.
                </p>
              </div>

              <div>
                <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingResume ? "Uploading & Parsing..." : "Select Resume File (PDF)"}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleResumeFileSelect}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-400">Maximum file size: 5MB • Formats: PDF, DOCX</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAVED JOBS */}
      {activeTab === "saved" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span>My Bookmarked Opportunities</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {savedJobsList.length} saved
              </span>
            </h2>
            <p className="text-xs text-slate-500 pt-1">
              Review and apply directly to roles you bookmarked while browsing.
            </p>
          </div>

          {loadingSavedJobs ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : savedJobsList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">No Saved Jobs Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the bookmark button on any job card to save it here for quick access later.
              </p>
              <div className="pt-2">
                <Link
                  to="/jobs/india"
                  className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Browse Jobs</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {savedJobsList.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/job/${job.jobId || job.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 truncate transition-colors"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.2 rounded">
                        {job.jobType || "Full Time"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location || "India"}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">
                        Saved {timeAgo(job.savedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    <Link
                      to={`/job/${job.jobId || job.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => handleRemoveSavedJob(job)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove from saved jobs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ATS EVALUATION HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>My ATS Evaluation History</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {atsHistoryList.length} records
              </span>
            </h2>
            <p className="text-xs text-slate-500 pt-1">
              Track how well your resume scored across different job positions.
            </p>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : atsHistoryList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">No ATS Evaluations Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Evaluate your resume against any job posting to automatically save your score benchmarks here.
              </p>
              <div className="pt-2">
                <Link
                  to="/ats-checker"
                  className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open ATS Checker</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {atsHistoryList.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                        entry.score >= 75
                          ? "bg-emerald-100 text-emerald-700"
                          : entry.score >= 55
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {entry.score}%
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {entry.jobTitle || "Evaluated Role"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {entry.company ? `${entry.company} • ` : ""}
                        Evaluated {timeAgo(entry.evaluatedAt)}
                      </p>
                      {entry.matchedKeywords && entry.matchedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {entry.matchedKeywords.slice(0, 5).map((k, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    {entry.jobId && (
                      <Link
                        to={`/job/${entry.jobId}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition-colors"
                      >
                        View Job
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteAtsHistoryItem(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PLATFORM FEEDBACK */}
      {activeTab === "feedback" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Submission Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-4 h-4 text-blue-600" />
                  <span>Submit Platform Feedback &amp; Feature Requests</span>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Verified Member
                </span>
              </h2>
              <p className="text-xs text-slate-500 pt-1">
                Your feedback directly shapes our product roadmap, ATS engine enhancements, and job curation.
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Experience Rating *
                  </label>
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`p-2 rounded-xl border transition-all ${
                          star <= feedbackRating
                            ? "bg-amber-50 border-amber-300 text-amber-500 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-300 hover:text-amber-400"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${star <= feedbackRating ? "fill-amber-400" : ""}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 pl-2">
                      {feedbackRating === 5 && "⭐ Excellent"}
                      {feedbackRating === 4 && "⭐ Very Good"}
                      {feedbackRating === 3 && "⭐ Good"}
                      {feedbackRating === 2 && "⭐ Needs Improvement"}
                      {feedbackRating === 1 && "⭐ Poor"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Platform Experience">Overall Platform &amp; UI Experience</option>
                    <option value="ATS Matcher">Role-Wise ATS Evaluation Tool</option>
                    <option value="Resume Builder">Resume Builder &amp; Downloads</option>
                    <option value="Job Quality">Job Curation &amp; Link Accuracy</option>
                    <option value="Feature Request">New Feature Request / Suggestion</option>
                    <option value="Bug Report">Technical Bug or Issue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you love, what felt friction-heavy, or what tools would accelerate your job search..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingFeedback ? "Submitting..." : "Submit Feedback"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Previous Feedback History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>My Previously Submitted Feedback</span>
              <span className="text-xs text-slate-400 font-normal">{myFeedbacks.length} submissions</span>
            </h3>

            {loadingFeedbacks ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : myFeedbacks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                You haven&apos;t submitted any feedback yet. Your submissions will be saved here.
              </div>
            ) : (
              <div className="space-y-3">
                {myFeedbacks.map((f) => (
                  <div key={f.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {f.category}
                        </span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: f.rating || 5 }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {f.createdAt?.seconds
                          ? new Date(f.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{f.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
