import { useState, useEffect } from "react";
import {
  MessageSquare,
  X,
  Star,
  Send,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const STORAGE_KEY = "getjoblink_feedback_floating_dismissed";

export default function FloatingFeedbackWidget() {
  const { currentUser, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState("Platform Experience");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if the user previously clicked cross to dismiss the floating widget
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please sign in with Google to submit verified feedback.", "error");
      return;
    }
    if (!feedback.trim()) {
      showToast("Please write your feedback before submitting.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        userName: currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Member"),
        userPhoto: currentUser.photoURL || "",
        category,
        rating: Number(rating),
        feedback: feedback.trim(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      showToast("Thank you! Your feedback has been submitted successfully.");
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        setFeedback("");
        setRating(5);
      }, 1800);
    } catch (err) {
      console.error("Error submitting floating feedback:", err);
      showToast("Failed to submit feedback: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Floating Pill Button */}
      <aside aria-label="Feedback widget" className="fixed bottom-6 right-6 z-40 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300/80 dark:border-slate-700/80 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 pl-4 pr-2.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none"
          title="Give feedback"
        >
          <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span>Feedback</span>
        </button>

        <button
          onClick={handleDismiss}
          className="pr-3 pl-1.5 py-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border-l border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Don't show this again"
          aria-label="Dismiss feedback button permanently"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </aside>

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Platform Feedback</h3>
                  <p className="text-[11px] text-slate-400">Help us make GetJobLink better for candidates</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close feedback modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {!currentUser ? (
              /* Signed-out state: Prompt Google Login */
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Sign In Required to Submit Feedback
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Feedback submission is reserved for authenticated members so our product team can follow up directly on your experience.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={async () => {
                      try {
                        await loginWithGoogle();
                      } catch (err) {
                        showToast("Sign in failed: " + err.message, "error");
                      }
                    }}
                    className="inline-flex items-center space-x-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-blue-400 dark:text-white" />
                    <span>Sign In with Google</span>
                  </button>
                </div>
              </div>
            ) : submitted ? (
              /* Success state */
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Your feedback has been delivered directly to the team.
                </p>
              </div>
            ) : (
              /* Authenticated Feedback Form */
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* User Identification Banner */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <div className="flex items-center space-x-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
                    Verified Member
                  </span>
                </div>

                {/* Rating Picker */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    How would you rate your experience? *
                  </label>
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          star <= rating
                            ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-500 dark:text-amber-400 shadow-2xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:text-amber-400"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${star <= rating ? "fill-amber-400" : ""}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pl-2">
                      {rating === 5 && "⭐ Excellent"}
                      {rating === 4 && "⭐ Very Good"}
                      {rating === 3 && "⭐ Good"}
                      {rating === 2 && "⭐ Needs Improvement"}
                      {rating === 1 && "⭐ Poor"}
                    </span>
                  </div>
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Feedback Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Platform Experience">Overall Platform &amp; UI Experience</option>
                    <option value="ATS Matcher">Role-Wise ATS Evaluation Tool</option>
                    <option value="Resume Builder">Resume Builder &amp; Downloads</option>
                    <option value="Job Quality">Job Curation &amp; Link Accuracy</option>
                    <option value="Feature Request">New Feature Request / Suggestion</option>
                    <option value="Bug Report">Technical Bug or Issue</option>
                  </select>
                </div>

                {/* Feedback Textarea */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Feedback &amp; Suggestions *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you like, what felt confusing, or what features would help your job search..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Submitting..." : "Submit Feedback"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
