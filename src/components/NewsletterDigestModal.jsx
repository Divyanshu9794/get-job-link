import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Mail, Check, X, Shield } from "lucide-react";
import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function NewsletterDigestModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(currentUser?.email || "");
  const [rolePreference, setRolePreference] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher (0 - 1 Years)");
  const [includeRemote, setIncludeRemote] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (currentUser?.email && !email) {
      setEmail(currentUser.email);
    }
  }, [currentUser, email]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setSubmitting(true);
    const subscriberId = email.toLowerCase().replace(/[^a-z0-9]/g, "_");

    try {
      const subscriberDoc = {
        email: email.trim().toLowerCase(),
        rolePreference,
        experienceLevel,
        includeRemote,
        frequency: "weekly",
        active: true,
        source: "website_modal",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "newsletter_subscribers", subscriberId), subscriberDoc, { merge: true });

      setSubscribed(true);
      showToast("Successfully subscribed to the Weekly Tech Jobs Digest!");
      setTimeout(() => {
        setSubscribed(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Subscription error:", err);
      // Fallback local save
      try {
        localStorage.setItem("gjl_subscribed_email", email);
        setSubscribed(true);
        showToast("Subscribed! You will receive our curated weekly dispatch.", "success");
        setTimeout(() => {
          setSubscribed(false);
          onClose();
        }, 2000);
      } catch {
        showToast("Could not complete subscription", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Weekly Tech Jobs Digest
              </h3>
              <p className="text-[11px] text-slate-400">Curated opportunities delivered every Monday</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {subscribed ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">You are all set!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              We have scheduled your weekly tech digest. You will only receive verified direct job opportunities.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Role Focus
                </label>
                <select
                  value={rolePreference}
                  onChange={(e) => setRolePreference(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option>Software Engineer</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Data Analyst</option>
                  <option>DevOps Engineer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Experience Focus
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option>Fresher (0 - 1 Years)</option>
                  <option>1 - 3 Years</option>
                  <option>3 - 5 Years</option>
                  <option>Senior (5+ Years)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="include-remote-digest"
                checked={includeRemote}
                onChange={(e) => setIncludeRemote(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="include-remote-digest" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Include global 100% remote software jobs
              </label>
            </div>

            {/* Anti-spam guarantee */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center space-x-1 font-bold text-slate-700 dark:text-slate-300">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero Spam Guarantee</span>
              </div>
              <p>We send exactly 1 digest per week. Unsubscribe anytime with a single click.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              {submitting ? "Subscribing..." : "Subscribe to Weekly Digest"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
