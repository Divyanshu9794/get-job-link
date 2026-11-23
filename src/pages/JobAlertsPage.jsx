import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Bell,
  Plus,
  Trash2,
  Edit3,
  Pause,
  Play,
  X,
  ArrowRight,
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SEO from "../components/SEO";

export default function JobAlertsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    role: "Frontend Developer",
    skills: "React, JavaScript, TypeScript",
    location: "Bengaluru",
    experienceLevel: "Fresher (0 - 1 Years)",
    isRemoteOnly: false,
    frequency: "Daily",
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Load alerts from Firestore or LocalStorage
  useEffect(() => {
    let isMounted = true;
    async function loadAlerts() {
      setLoading(true);
      const storageKey = currentUser ? `gjl_user_alerts_${currentUser.uid}` : "gjl_guest_alerts";

      // Helper to read cached local alerts
      const getLocalAlerts = () => {
        try {
          const stored = localStorage.getItem(storageKey) || localStorage.getItem("gjl_guest_alerts");
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      };

      try {
        if (currentUser) {
          try {
            const colRef = collection(db, "users", currentUser.uid, "alerts");
            const snap = await getDocs(query(colRef, orderBy("createdAt", "desc")));
            if (isMounted && snap.docs.length > 0) {
              const remoteList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
              setAlerts(remoteList);
              localStorage.setItem(storageKey, JSON.stringify(remoteList));
              return;
            }
          } catch (firestoreErr) {
            console.warn("Firestore alerts sync notice:", firestoreErr.message);
          }
        }

        const localList = getLocalAlerts();
        if (localList && isMounted) {
          setAlerts(localList);
        } else if (isMounted) {
          // Default sample alert for new visitors
          const sample = [
            {
              id: "alert_sample_1",
              title: "Frontend & React Freshers",
              role: "React Developer",
              skills: "React, JavaScript",
              location: "India",
              experienceLevel: "Fresher (0 - 1 Years)",
              isRemoteOnly: false,
              frequency: "Daily",
              active: true,
              createdAt: new Date().toISOString(),
            },
          ];
          setAlerts(sample);
          localStorage.setItem(storageKey, JSON.stringify(sample));
        }
      } catch (err) {
        console.error("Error loading alerts:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAlerts();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleSaveAlert = async (e) => {
    e.preventDefault();
    if (!formData.title && !formData.role) {
      showToast("Please provide an alert title or role.", "error");
      return;
    }

    setSubmitting(true);
    const alertId = editingAlert?.id || `alert_${Date.now()}`;
    const payload = {
      ...formData,
      id: alertId,
      title: formData.title || `${formData.role} in ${formData.location || "Any"}`,
      updatedAt: new Date().toISOString(),
      createdAt: editingAlert?.createdAt || new Date().toISOString(),
    };

    const storageKey = currentUser ? `gjl_user_alerts_${currentUser.uid}` : "gjl_guest_alerts";

    // 1. Immediately update local state & localStorage for 100% resilience
    setAlerts((prev) => {
      const idx = prev.findIndex((a) => a.id === alertId);
      const updatedList = idx >= 0 ? prev.map((a) => (a.id === alertId ? payload : a)) : [payload, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
        localStorage.setItem("gjl_guest_alerts", JSON.stringify(updatedList));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return updatedList;
    });

    // 2. Attempt Firestore sync in background
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "alerts", alertId), payload, { merge: true });
      } catch (firestoreErr) {
        console.warn("Firestore remote alert sync warning:", firestoreErr.message);
      }
    }

    setSubmitting(false);
    showToast(editingAlert ? "Job alert updated!" : "New job alert created!");
    setModalOpen(false);
    setEditingAlert(null);
  };

  const handleToggleActive = async (alert) => {
    const updated = { ...alert, active: !alert.active };
    const storageKey = currentUser ? `gjl_user_alerts_${currentUser.uid}` : "gjl_guest_alerts";

    // Immediate local update
    setAlerts((prev) => {
      const list = prev.map((a) => (a.id === alert.id ? updated : a));
      try {
        localStorage.setItem(storageKey, JSON.stringify(list));
        localStorage.setItem("gjl_guest_alerts", JSON.stringify(list));
      } catch (e) {
        console.warn("Could not update alert locally:", e);
      }
      return list;
    });

    showToast(updated.active ? "Alert resumed." : "Alert paused.");

    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "alerts", alert.id), updated, { merge: true });
      } catch (err) {
        console.warn("Firestore alert pause/resume sync notice:", err.message);
      }
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm("Delete this job alert?")) return;
    const storageKey = currentUser ? `gjl_user_alerts_${currentUser.uid}` : "gjl_guest_alerts";

    // Immediate local update
    setAlerts((prev) => {
      const list = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(list));
        localStorage.setItem("gjl_guest_alerts", JSON.stringify(list));
      } catch (e) {
        console.warn("Could not delete alert locally:", e);
      }
      return list;
    });

    showToast("Alert removed.");

    if (currentUser) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "alerts", id));
      } catch (err) {
        console.warn("Firestore alert delete sync notice:", err.message);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingAlert(null);
    setFormData({
      title: "",
      role: "Software Engineer",
      skills: "React, Node.js, Python",
      location: "Bengaluru",
      experienceLevel: "Fresher (0 - 1 Years)",
      isRemoteOnly: false,
      frequency: "Daily",
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (al) => {
    setEditingAlert(al);
    setFormData({
      title: al.title || "",
      role: al.role || "",
      skills: al.skills || "",
      location: al.location || "",
      experienceLevel: al.experienceLevel || "Fresher (0 - 1 Years)",
      isRemoteOnly: al.isRemoteOnly || false,
      frequency: al.frequency || "Daily",
      active: al.active !== false,
    });
    setModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SEO
        title="Smart Job Alerts: Realtime Tech Opportunities"
        description="Never miss matching software engineer and developer openings. Create personalized job alerts by role, skills, location, and experience with zero recruiter spam."
        canonicalUrl="/alerts"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
            <Bell className="w-3.5 h-3.5" />
            <span>Targeted Notifications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Smart Job Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure custom triggers for your target tech roles, skills, and locations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Alert</span>
        </button>
      </div>

      {/* Alerts Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create an alert to get notified whenever fresh matching jobs are added to GetJobLink.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Alert</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-xs space-y-4 transition-all ${
                al.active !== false
                  ? "border-slate-200 dark:border-slate-800"
                  : "border-slate-200 dark:border-slate-800/50 opacity-60 bg-slate-50/50 dark:bg-slate-900/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${al.active !== false ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{al.title}</h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Role: <span className="text-slate-800 dark:text-slate-200 font-bold">{al.role || "Any"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(al)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={al.active !== false ? "Pause alert" : "Resume alert"}
                  >
                    {al.active !== false ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(al)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                    title="Edit alert"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(al.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Criteria Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {al.skills && (
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                    Skills: {al.skills}
                  </span>
                )}
                {al.location && (
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    📍 {al.location}
                  </span>
                )}
                {al.isRemoteOnly && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                    💻 Remote Only
                  </span>
                )}
                {al.experienceLevel && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                    🎓 {al.experienceLevel}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Frequency: {al.frequency || "Daily Digest"}</span>
                <Link
                  to={`/jobs/india?q=${encodeURIComponent(al.role || al.skills || "")}`}
                  className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  <span>View Matching Postings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {editingAlert ? "Edit Job Alert Criteria" : "Create Smart Job Alert"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Name / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. React & Node Developer in Bengaluru"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, India"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Experience</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option>Fresher (0 - 1 Years)</option>
                    <option>1 - 2 Years</option>
                    <option>2 - 4 Years</option>
                    <option>More than 4 years</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Daily">Daily Summary</option>
                    <option value="Instant">Instant In-App Alert</option>
                    <option value="Weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="remote-only-alert"
                  checked={formData.isRemoteOnly}
                  onChange={(e) => setFormData({ ...formData, isRemoteOnly: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="remote-only-alert" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Only notify for 100% Remote positions
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {submitting ? "Saving..." : "Save Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
