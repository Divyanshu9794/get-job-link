import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Shield,
  PlusCircle,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  LogIn,
  LogOut,
  Briefcase,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  FileText,
  Sparkles,
  Bookmark,
  Activity,
  ArrowUpRight,
  MessageSquare,
  Mail,
  Inbox,
  Star,
  ThumbsUp,
  Download,
} from "lucide-react";
import { db } from "../firebase";
import { useAuth, ADMIN_EMAIL } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  timeAgo,
  sanitizeJobUrl,
  isRemoteJob,
  getJobTimestamp,
} from "../utils/jobClassification";
import SEO from "../components/SEO";
import AdminHiringAnalytics from "../components/AdminHiringAnalytics";
import AdminJobStagingHub from "../components/AdminJobStagingHub";

const PAGE_SIZE = 50;

export default function AdminPage() {
  const { currentUser, isAdmin, loadingAuth, loginWithGoogle, logout } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // when set, edit modal is open
  const [deletingJob, setDeletingJob] = useState(null); // individual delete modal
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Form State
  const initialFormState = {
    title: "",
    company: "",
    location: "Bengaluru, India",
    url: "",
    jobType: "Full Time",
    experience: "More than 0 year",
    salary: "Competitive",
    domain: "Engineering",
    isRemote: false,
    skills: "",
    jd: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Top Section Switch ("jobs" | "analytics" | "messages")
  const [adminSection, setAdminSection] = useState("jobs");
  const [analyticsRange, setAnalyticsRange] = useState("7days"); // "today" | "7days" | "30days" | "ytd"
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  // Direct Messages & Inquiries + Feedback State
  const [contactsList, setContactsList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsSearch, setContactsSearch] = useState("");
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState("all"); // "all" | "inquiry" | "feedback"

  const loadContactsAndFeedbacks = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingContacts(true);
    try {
      const qContacts = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const snapContacts = await getDocs(qContacts);
      setContactsList(snapContacts.docs.map((d) => ({ id: d.id, _type: "contact", ...d.data() })));

      const qFeedbacks = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
      const snapFeedbacks = await getDocs(qFeedbacks);
      setFeedbacksList(snapFeedbacks.docs.map((d) => ({ id: d.id, _type: "feedback", ...d.data() })));
    } catch (err) {
      console.error("Error loading contacts/feedbacks:", err);
    } finally {
      setLoadingContacts(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadContactsAndFeedbacks();
    }
  }, [isAdmin, loadContactsAndFeedbacks]);

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteDoc(doc(db, "contacts", contactId));
      setContactsList((prev) => prev.filter((c) => c.id !== contactId));
      showToast("Message deleted successfully.");
    } catch (err) {
      showToast("Failed to delete message: " + err.message, "error");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this user feedback?")) return;
    try {
      await deleteDoc(doc(db, "feedbacks", feedbackId));
      setFeedbacksList((prev) => prev.filter((f) => f.id !== feedbackId));
      showToast("Feedback deleted successfully.");
    } catch (err) {
      showToast("Failed to delete feedback: " + err.message, "error");
    }
  };

  const filteredInquiriesAndFeedbacks = useMemo(() => {
    let combined = [];
    if (inquiryTypeFilter === "all" || inquiryTypeFilter === "inquiry") {
      combined = [...combined, ...contactsList];
    }
    if (inquiryTypeFilter === "all" || inquiryTypeFilter === "feedback") {
      combined = [...combined, ...feedbacksList];
    }

    combined.sort((a, b) => {
      const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return tB - tA;
    });

    if (!contactsSearch.trim()) return combined;
    const term = contactsSearch.toLowerCase();
    return combined.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.userName?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.userEmail?.toLowerCase().includes(term) ||
        c.subject?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        c.message?.toLowerCase().includes(term) ||
        c.feedback?.toLowerCase().includes(term)
    );
  }, [contactsList, feedbacksList, inquiryTypeFilter, contactsSearch]);

  // Load real registered user count from Firestore
  useEffect(() => {
    async function loadUserStats() {
      if (!isAdmin) return;
      try {
        const snap = await getDocs(collection(db, "users"));
        setTotalUsersCount(snap.size);
      } catch (err) {
        console.warn("Could not load users count:", err);
      }
    }
    loadUserStats();
  }, [isAdmin]);

  // Fetch GA4 Analytics via Secure Backend / Cloud Function
  const fetchAnalytics = useCallback(async (range) => {
    if (!currentUser) return;
    setLoadingAnalytics(true);
    try {
      const token = await currentUser.getIdToken();
      let response = null;

      // 1. In local dev, use the local proxy endpoint; in production, use Cloud Function
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      const endpoints = isLocalhost
        ? [
            `/api/getGA4Analytics?dateRange=${range}`,
            `https://us-central1-get-job-link.cloudfunctions.net/getGA4Analytics?dateRange=${range}`,
          ]
        : [
            `https://us-central1-get-job-link.cloudfunctions.net/getGA4Analytics?dateRange=${range}`,
            `/api/getGA4Analytics?dateRange=${range}`,
          ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            response = res;
            break;
          }
        } catch {
          // Try next endpoint
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        setAnalyticsData({
          configured: false,
          propertyId: "543069695",
          measurementId: "G-7LPCET02EM",
          dateRange: range,
        });
      }
    } catch {
      setAnalyticsData({
        configured: false,
        propertyId: "543069695",
        measurementId: "G-7LPCET02EM",
        dateRange: range,
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (adminSection === "analytics") {
      fetchAnalytics(analyticsRange);
    }
  }, [adminSection, analyticsRange, fetchAnalytics]);

  // Fetch all jobs for admin (all jobs uploaded in portal, not only latest)
  const loadAdminJobs = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingJobs(true);
    try {
      // Fetch entire jobs collection without limit so admin manages all portal jobs
      const snap = await getDocs(collection(db, "jobs"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Sort descending by creation date or date string (newest first)
      list.sort((a, b) => {
        const timeA = getJobTimestamp(a) || 0;
        const timeB = getJobTimestamp(b) || 0;
        return (timeB || 0) - (timeA || 0);
      });

      setJobs(list);
    } catch (err) {
      console.error("Admin fetch error:", err);
      showToast("Error loading portal jobs: " + err.message, "error");
    } finally {
      setLoadingJobs(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminJobs();
    }
  }, [isAdmin, loadAdminJobs]);

  // Dashboard Stats
  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.length; // all in collection are live
    let todayStr = "";
    try {
      todayStr = new Date().toISOString().split("T")[0];
    } catch {
      todayStr = "";
    }

    const todayCount = jobs.filter((j) => {
      if (j.date === todayStr) return true;
      const ts = getJobTimestamp(j);
      if (ts) {
        try {
          const d = new Date(ts).toISOString().split("T")[0];
          return d === todayStr;
        } catch {
          return false;
        }
      }
      return false;
    }).length;

    return { total, active, todayCount };
  }, [jobs]);

  // Filter & Sort
  const processedJobs = useMemo(() => {
    let result = [...jobs];

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q)
      );
    }

    // Filter Type
    if (filterType === "remote") {
      result = result.filter((j) => isRemoteJob(j));
    } else if (filterType) {
      result = result.filter((j) => (j.jobType || "").toLowerCase() === filterType.toLowerCase());
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "company") {
      result.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
    }

    return result;
  }, [jobs, searchTerm, filterType, sortBy]);

  // Pagination for admin table
  const totalPages = Math.max(1, Math.ceil(processedJobs.length / PAGE_SIZE));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedJobs.slice(start, start + PAGE_SIZE);
  }, [processedJobs, currentPage]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedJobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedJobs.map((j) => j.id)));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "Bengaluru, India",
      url: job.url || job.applyUrl || "",
      jobType: job.jobType || "Full Time",
      experience: job.experience || "More than 0 year",
      salary: job.salary || "Competitive",
      domain: job.domain || "Engineering",
      isRemote: Boolean(job.isRemote),
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : job.skills || "",
      jd: job.jd || job.description || "",
    });
  };

  // Submit Add Job
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.title || !formData.company || !formData.url) {
      showToast("Please fill in all required fields (*)", "error");
      return;
    }

    setSubmitting(true);
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const cleanUrl = sanitizeJobUrl(formData.url);
      const newJobData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        url: cleanUrl,
        applyUrl: cleanUrl,
        applicationUrl: cleanUrl,
        jobType: formData.jobType,
        experience: formData.experience,
        salary: formData.salary,
        domain: formData.domain,
        isRemote: Boolean(formData.isRemote),
        skills: skillsArray,
        requiredSkills: skillsArray,
        jd: formData.jd.trim() || "No detailed description provided.",
        description: formData.jd.trim() || "No detailed description provided.",
        date: new Date().toISOString().split("T")[0],
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, "jobs"), newJobData);

      setJobs((prev) => [{ id: docRef.id, ...newJobData }, ...prev]);
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      showToast("New job link published successfully!");
    } catch (err) {
      console.error("Error creating job:", err);
      showToast("Failed to publish job: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Job
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingJob) return;

    setSubmitting(true);
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const cleanUrl = sanitizeJobUrl(formData.url);
      const updatedData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        url: cleanUrl,
        applyUrl: cleanUrl,
        applicationUrl: cleanUrl,
        jobType: formData.jobType,
        experience: formData.experience,
        salary: formData.salary,
        domain: formData.domain,
        isRemote: Boolean(formData.isRemote),
        skills: skillsArray,
        requiredSkills: skillsArray,
        jd: formData.jd.trim(),
        description: formData.jd.trim(),
        updatedAt: Date.now(),
      };

      await updateDoc(doc(db, "jobs", editingJob.id), updatedData);

      setJobs((prev) =>
        prev.map((j) => (j.id === editingJob.id ? { ...j, ...updatedData } : j))
      );
      setEditingJob(null);
      showToast("Job record updated successfully!");
    } catch (err) {
      console.error("Error updating job:", err);
      showToast("Failed to update job: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Single Delete
  const handleDeleteConfirm = async () => {
    if (!isAdmin || !deletingJob) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, "jobs", deletingJob.id));
      setJobs((prev) => prev.filter((j) => j.id !== deletingJob.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingJob.id);
        return next;
      });
      setDeletingJob(null);
      showToast("Job deleted from database.");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete job: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (!isAdmin || selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      // Batch delete in chunks of 400 (Firestore limit is 500)
      const batchSize = 400;
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const chunk = idsToDelete.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach((id) => {
          batch.delete(doc(db, "jobs", id));
        });
        await batch.commit();
      }

      setJobs((prev) => prev.filter((j) => !selectedIds.has(j.id)));
      showToast(`Successfully deleted ${selectedIds.size} jobs.`);
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
    } catch (err) {
      console.error("Bulk delete error:", err);
      showToast("Bulk delete failed: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading Auth State
  if (loadingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying Administrator Access...</p>
        </div>
      </div>
    );
  }

  // 2. Not Logged In State
  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Gateway</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sign in with your verified administrator account to manage postings, update records,
              and review portal statistics.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-[11px] text-slate-600 dark:text-slate-300 text-left space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-200">Security Requirement:</div>
            <div>Database writes are restricted to: <code className="bg-white dark:bg-slate-900 px-1 rounded text-blue-700 dark:text-blue-400 font-mono">{ADMIN_EMAIL}</code></div>
          </div>

          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center space-x-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>

          <div className="pt-2">
            <Link to="/jobs/india" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              ← Return to public portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged In But Unauthorized State
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-8 sm:p-10 shadow-lg max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/80 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Access Restricted</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You are signed in as <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.email}</span>,
              which does not have administrator privileges on GetJobLink.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={logout}
              className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Try Another Account</span>
            </button>
            <Link
              to="/jobs/india"
              className="inline-flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-2"
            >
              Back to Job Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 pb-16 transition-colors duration-200">
      <SEO title="Admin Gateway" noIndex={true} />
      {/* Top Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Admin Workspace
                </h1>
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  Verified Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
            <button
              onClick={loadAdminJobs}
              disabled={loadingJobs}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Refresh jobs list"
            >
              <RotateCcw className={`w-4 h-4 ${loadingJobs ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Section Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setAdminSection("jobs")}
            className={`inline-flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
              adminSection === "jobs"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Inventory &amp; Records ({stats.total.toLocaleString()})</span>
          </button>

          <button
            onClick={() => setAdminSection("staging")}
            className={`inline-flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
              adminSection === "staging"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Auto-Fetch &amp; Staging Approval</span>
          </button>

          <button
            onClick={() => setAdminSection("hiring_analytics")}
            className={`inline-flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
              adminSection === "hiring_analytics"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Hiring Analytics</span>
          </button>

          <button
            onClick={() => setAdminSection("analytics")}
            className={`inline-flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
              adminSection === "analytics"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Google Analytics 4 (GA4)</span>
          </button>

          <button
            onClick={() => setAdminSection("messages")}
            className={`inline-flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
              adminSection === "messages"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages &amp; Feedback ({contactsList.length + feedbacksList.length})</span>
          </button>
        </div>

        {adminSection === "jobs" ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Total Database Jobs
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.total.toLocaleString()}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Active Listings
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats.active.toLocaleString()}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Jobs Added Today
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {stats.todayCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

        {/* Toolbar: Search, Filters, Bulk Delete Button */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search jobs by title, company, location, or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
              <option value="remote">Remote Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="company">Company (A-Z)</option>
            </select>
          </div>

          {/* Bulk Delete CTA (shown when items selected) */}
          {selectedIds.size > 0 && (
            <div className="flex items-center space-x-2 self-end md:self-auto shrink-0 animate-in fade-in">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          )}
        </div>

        {/* Jobs Management Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label="Select All"
                    >
                      {selectedIds.size > 0 && selectedIds.size === paginatedJobs.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Type & Exp</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date Added</th>
                  <th className="py-3 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loadingJobs ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4 text-center"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-1" /><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-28" /></td>
                      <td className="py-4 px-4"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24" /></td>
                      <td className="py-4 px-4"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20" /></td>
                      <td className="py-4 px-4"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16" /></td>
                      <td className="py-4 px-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No jobs matching your filter parameters.
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((job) => {
                    const isSelected = selectedIds.has(job.id);
                    const isRemote = isRemoteJob(job);
                    return (
                      <tr
                        key={job.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                          isSelected ? "bg-blue-50/30 dark:bg-blue-950/30" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleSelect(job.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 dark:text-white max-w-[220px] truncate block">
                              {job.title}
                            </span>
                            {isRemote && (
                              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-800">
                                Remote
                              </span>
                            )}
                          </div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                            {job.company}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[150px]">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{job.location || "India"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{job.jobType || "Full Time"}</span>
                            <span className="text-slate-400 dark:text-slate-500 text-[10px]">{job.experience || "0+ yrs"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                          {timeAgo(job.createdAt || job.date)}
                        </td>
                        <td className="py-3 px-4 pr-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1">
                            {/* View Live */}
                            <Link
                              to={`/job/${job.id}`}
                              target="_blank"
                              title="View Job Details"
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(job)}
                              title="Edit Job"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeletingJob(job)}
                              title="Delete Job"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Admin Table Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                Showing {processedJobs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, processedJobs.length)} of{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">{processedJobs.length.toLocaleString()}</span> jobs
              </span>
              {jobs.length > 0 && (
                <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                  All {jobs.length.toLocaleString()} in portal
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-800 dark:text-slate-200 text-xs">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last Page"
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
        </>
      ) : adminSection === "analytics" ? (
        /* GOOGLE ANALYTICS 4 (GA4) DASHBOARD */
        <div className="space-y-6 animate-in fade-in">
          {/* Header Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Google Analytics 4 Overview
                </h2>
                <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  Property: 543069695
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  G-7LPCET02EM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time audience tracking, job views, apply conversions, and feature usage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter Buttons (Today, 7 Days, 30 Days, Year to Date) */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                {[
                  { id: "today", label: "Today" },
                  { id: "7days", label: "7 Days" },
                  { id: "30days", label: "30 Days" },
                  { id: "ytd", label: "Year to Date" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAnalyticsRange(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      analyticsRange === tab.id
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchAnalytics(analyticsRange)}
                disabled={loadingAnalytics}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Refresh GA4 Data"
              >
                <RotateCcw className={`w-4 h-4 ${loadingAnalytics ? "animate-spin text-blue-600" : ""}`} />
              </button>

              <a
                href="https://analytics.google.com/analytics/web/#/a302626524p543069695/realtime/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Live Realtime</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Real-time Platform Database Records (Always Live in Firestore) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>GetJobLink Database Telemetry (Live Platform State)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Direct database records synchronized in real-time from Firestore.
                </p>
              </div>
              <span className="self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                Active Firestore Sync
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Registered Users
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalUsersCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Firebase Auth accounts</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Indexed Jobs
                </span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {stats.total.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Active catalog listings</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Openings
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.active.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Valid employer links</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Added Today
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {stats.todayCount}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Today&apos;s new jobs</span>
              </div>
            </div>
          </div>

          {/* Core GA4 Server-Side Metrics Grid (9 Required Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Total Users */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Users (GA4)
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.totalUsers === "number"
                    ? analyticsData.metrics.totalUsers.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "Unique visitors" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* 2. New Users */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  New Users (GA4)
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.newUsers === "number"
                    ? analyticsData.metrics.newUsers.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "First-time sessions" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Active Users */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Users (GA4)
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.activeUsers === "number"
                    ? analyticsData.metrics.activeUsers.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "Engaged visitors" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            {/* 4. Total Page Views */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Page Views
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.totalPageViews === "number"
                    ? analyticsData.metrics.totalPageViews.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "All screens rendered" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
            </div>

            {/* 5. Job Detail Page Views */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Job Detail Page Views
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.jobDetailPageViews === "number"
                    ? analyticsData.metrics.jobDetailPageViews.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "Deep job inspections" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            {/* 6. Apply Button Clicks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Apply Button Clicks
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.applyButtonClicks === "number"
                    ? analyticsData.metrics.applyButtonClicks.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "Direct candidate conversions" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5" />
              </div>
            </div>

            {/* 7. Resume Builder Usage */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Resume Builder Usage
                </span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.resumeBuilderUsage === "number"
                    ? analyticsData.metrics.resumeBuilderUsage.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "Resumes created/downloaded" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* 8. ATS Checker Usage */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  ATS Checker Usage
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.atsCheckerUsage === "number"
                    ? analyticsData.metrics.atsCheckerUsage.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "Resume score scans" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* 9. Saved Job Engagement */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Saved Job Engagement
                </span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {loadingAnalytics
                    ? "..."
                    : analyticsData?.configured && typeof analyticsData?.metrics?.savedJobEngagement === "number"
                    ? analyticsData.metrics.savedJobEngagement.toLocaleString()
                    : "—"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {analyticsData?.configured ? "Bookmarks created" : "Pending API credential"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Trends and Top Pages Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily / Monthly Trends */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Daily &amp; Monthly Trends</span>
                </h3>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Filter: {analyticsRange}</span>
              </div>

              {analyticsData?.trends && analyticsData.trends.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {analyticsData.trends.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{t.date}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-500 dark:text-slate-400">{t.activeUsers} users</span>
                        <span className="font-bold text-slate-900 dark:text-white">{t.pageViews} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Trend data points will display here when GA4 Data API responses are received.
                </div>
              )}
            </div>

            {/* Top Visited Pages */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Top Visited Pages &amp; Most Viewed Jobs</span>
                </h3>
              </div>

              {analyticsData?.topPages && analyticsData.topPages.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {analyticsData.topPages.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-xs">{p.pagePath}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.views} views</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Top pages and jobs will appear here as users browse the platform.
                </div>
              )}
            </div>
          </div>

          {/* Transparent Setup Notice (When API is not yet configured) */}
          {!analyticsData?.configured && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <h3 className="font-bold text-sm text-white">
                      GA4 Data API Integration Ready (Property: 543069695)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    The analytics dashboard is connected to Google Analytics 4 Property <strong>543069695</strong> (Measurement ID: <strong>G-7LPCET02EM</strong>).
                    To display live server-side GA4 metrics inside this admin view, configure a Google Cloud Service Account with Viewer permissions on Property 543069695.
                  </p>
                </div>

                <a
                  href="https://analytics.google.com/analytics/web/#/a302626524p543069695/realtime/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  <span>Open Realtime in GA4</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-bold text-slate-200 block mb-0.5">1. Service Account</span>
                  <span>Create a service account in Google Cloud IAM and download JSON key.</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-bold text-slate-200 block mb-0.5">2. Grant Viewer Role</span>
                  <span>Add the service account email to GA4 Property 543069695 with Viewer role.</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-bold text-slate-200 block mb-0.5">3. Upgrade to Blaze</span>
                  <span>Cloud Functions deployment requires Firebase Blaze pay-as-you-go plan.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : adminSection === "staging" ? (
        /* AUTO-FETCH & JOB STAGING APPROVAL HUB */
        <AdminJobStagingHub existingJobs={jobs} onJobPublished={loadAdminJobs} />
      ) : adminSection === "hiring_analytics" ? (
        /* HIRING RADAR & COMPANY ANALYTICS HUB */
        <AdminHiringAnalytics jobs={jobs} isAdmin={isAdmin} showToast={showToast} />
      ) : (
        /* DIRECT MESSAGES & INQUIRIES SECTION */
        <div className="space-y-6 animate-in fade-in">
          {/* Header Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Direct Messages &amp; User Feedback
                </h2>
                <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {contactsList.length + feedbacksList.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review inquiries from the Contact page and authenticated member feedback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInquiryTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    inquiryTypeFilter === "all"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All ({contactsList.length + feedbacksList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryTypeFilter("inquiry")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    inquiryTypeFilter === "inquiry"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Contact Form ({contactsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryTypeFilter("feedback")}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                    inquiryTypeFilter === "feedback"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Feedback ({feedbacksList.length})</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search inquiries & feedback..."
                  value={contactsSearch}
                  onChange={(e) => setContactsSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
                />
              </div>
              <button
                onClick={loadContactsAndFeedbacks}
                disabled={loadingContacts}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="Refresh messages & feedback"
              >
                <RotateCcw className={`w-4 h-4 ${loadingContacts ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>
          </div>

          {/* Messages & Feedback List */}
          {filteredInquiriesAndFeedbacks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Submissions Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {contactsSearch
                  ? "No messages or feedback matched your search query."
                  : "Inquiries submitted via /contact and member feedback will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiriesAndFeedbacks.map((item) => {
                const dateStr = item.createdAt?.toDate
                  ? item.createdAt.toDate().toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : item.createdAt?.seconds
                  ? new Date(item.createdAt.seconds * 1000).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Recently";

                const isFeedback = item._type === "feedback";
                const senderName = item.name || item.userName || "Verified Member";
                const senderEmail = item.email || item.userEmail || "";
                const subjectBadge = item.subject || item.category || (isFeedback ? "User Feedback" : "Inquiry");

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-black text-slate-900 dark:text-white text-sm">{senderName}</span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                            isFeedback
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {isFeedback ? `Feedback: ${subjectBadge}` : subjectBadge}
                        </span>

                        {isFeedback && typeof item.rating === "number" && (
                          <div className="flex items-center text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                            {Array.from({ length: item.rating }).map((_, idx) => (
                              <Star key={idx} className="w-3 h-3 fill-amber-400" />
                            ))}
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 ml-1">
                              {item.rating}/5
                            </span>
                          </div>
                        )}

                        <span className="text-[11px] text-slate-400 dark:text-slate-500">• {dateStr}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {senderEmail && (
                          <a
                            href={`mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subjectBadge || "GetJobLink")}`}
                            className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reply ({senderEmail})</span>
                          </a>
                        )}

                        <button
                          onClick={() => (isFeedback ? handleDeleteFeedback(item.id) : handleDeleteContact(item.id))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                      {item.message || item.feedback}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>

      {/* ADD JOB MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Publish New Job Link</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google / Razorpay"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India or Remote"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Application URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://company.greenhouse.io/..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
                    <option>Full Time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                    <option>Part Time</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Experience</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
                    <option>More than 0 year</option>
                    <option>Fresher (0 - 1 Years)</option>
                    <option>More than 1 year</option>
                    <option>More than 2 years</option>
                    <option>More than 3 years</option>
                    <option>More than 4 years</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Salary</label>
                  <select
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
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
                    <option>Not Disclosed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
                    <option value="Data Entry">Data Entry</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="add-remote"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="add-remote" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Flag as Distributed Remote Role
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, Node.js, TypeScript, Docker"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Description & Requirements *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.jd}
                  onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
                  placeholder="Paste complete requirements, qualifications, and context details..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {submitting ? "Publishing..." : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Job Listing</h3>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Application URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
                    <option>Full Time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                    <option>Part Time</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Experience</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
                    <option>More than 0 year</option>
                    <option>Fresher (0 - 1 Years)</option>
                    <option>More than 1 year</option>
                    <option>More than 2 years</option>
                    <option>More than 3 years</option>
                    <option>More than 4 years</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Salary</label>
                  <select
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
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
                    <option>Not Disclosed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
                    <option value="Data Entry">Data Entry</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="edit-remote"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="edit-remote" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Flag as Distributed Remote Role
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Description & Requirements</label>
                <textarea
                  rows={5}
                  value={formData.jd}
                  onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL DELETE CONFIRMATION MODAL */}
      {deletingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-900 dark:text-white">{deletingJob.title}</span> at{" "}
                <span className="font-bold text-slate-900 dark:text-white">{deletingJob.company}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeletingJob(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {submitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Bulk Delete ({selectedIds.size} Jobs)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete all{" "}
                <span className="font-bold text-slate-900 dark:text-white">{selectedIds.size}</span> selected job
                records from Firestore? This operation will remove them from production.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {submitting ? "Deleting..." : `Delete ${selectedIds.size} Jobs`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
