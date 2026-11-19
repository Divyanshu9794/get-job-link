import { useState } from "react";
import {
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Star,
  Sparkles,
  LogIn,
  User,
  ThumbsUp,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SEO from "../components/SEO";

export default function ContactPage() {
  const { currentUser, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [formTab, setFormTab] = useState("message"); // "message" | "feedback"

  // Direct Message State (Public)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Platform Feedback State (Logged-in only)
  const [feedbackCategory, setFeedbackCategory] = useState("Platform Experience");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "contacts"), {
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      showToast("Message sent successfully! We will get back to you within 24–48 hours.");
    } catch (err) {
      console.error("Error submitting contact form:", err);
      showToast("Failed to submit message: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please sign in with Google to submit verified feedback.", "error");
      return;
    }
    if (!feedbackMessage.trim()) {
      showToast("Please share your feedback or suggestions.", "error");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        userName: currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Member"),
        userPhoto: currentUser.photoURL || "",
        category: feedbackCategory,
        rating: Number(feedbackRating),
        feedback: feedbackMessage.trim(),
        createdAt: serverTimestamp(),
      });
      setFeedbackSubmitted(true);
      showToast("Thank you for your valuable feedback! It has been submitted directly to our team.");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      showToast("Failed to submit feedback: " + err.message, "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <SEO
        title="Contact Us & Platform Feedback"
        description="Get in touch with the GetJobLink team or submit verified platform feedback on our job board, resume builder, and ATS scoring tools."
        canonicalUrl="/contact"
      />

      <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Support, Inquiries & Verified Feedback</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact &amp; Feedback Desk
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Have questions about our tech job curation, want to report an expired listing, or have feature feedback? We review all submissions promptly.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Operating Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Operating Details
              </h3>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Support Desk</span>
                    <a
                      href="mailto:getjoblink647@gmail.com"
                      className="text-blue-600 hover:underline break-all"
                    >
                      getjoblink647@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Response Window</span>
                    <span>24–48 Business Hours</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Official Channels</span>
                <div className="space-y-1.5">
                  <a
                    href="https://www.linkedin.com/in/getjob-link-b62169334/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:underline"
                  >
                    <span>LinkedIn @getjob-link</span>
                  </a>
                  <a
                    href="https://x.com/GetJobLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:underline"
                  >
                    <span>X (Twitter) @GetJobLink</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Fee Policy</span>
              </div>
              <p className="leading-relaxed text-[11px] text-emerald-800">
                GetJobLink will never ask for payment, security deposits, or registration charges.
                If any third-party asks for money claiming to represent GetJobLink, please report it immediately.
              </p>
            </div>
          </div>

          {/* Form Area */}
          <div className="md:col-span-2 space-y-4">
            {/* Form Mode Selector */}
            <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setFormTab("message")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  formTab === "message"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct Message</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab("feedback")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  formTab === "feedback"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Platform Feedback (Logged-in Only)</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              {/* TAB 1: DIRECT MESSAGE (PUBLIC) */}
              {formTab === "message" && (
                <>
                  {submitted ? (
                    <div className="text-center py-12 space-y-4 animate-in fade-in">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Thank You for Reaching Out!</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Your inquiry has been delivered directly to our editorial and curation team. We
                        will respond to your email at <span className="font-bold text-slate-700">{email}</span> within 24–48 hours.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setSubmitted(false);
                            setName("");
                            setEmail("");
                            setMessage("");
                          }}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Send another message
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span>Send Us a Direct Message</span>
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Your Email Address *</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Report Expired Job">Report Expired / Inaccurate Job Listing</option>
                          <option value="Career Guide Feedback">Career Guide Suggestion / Correction</option>
                          <option value="Employer Listing Request">Employer / Recruiter Job Submission</option>
                          <option value="Privacy / Data Request">Privacy &amp; Data Deletion Request</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Please share details about your inquiry or question..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submitting ? "Sending..." : "Submit Message"}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* TAB 2: PLATFORM FEEDBACK (LOGGED IN ONLY) */}
              {formTab === "feedback" && (
                <>
                  {!currentUser ? (
                    <div className="text-center py-10 space-y-4 animate-in fade-in">
                      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">
                        Sign In Required for Platform Feedback
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        To maintain high data integrity and ensure our product team can follow up directly, submitting platform feedback and feature requests is exclusive to authenticated members.
                      </p>
                      <div className="pt-3">
                        <button
                          onClick={loginWithGoogle}
                          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition-all"
                        >
                          <LogIn className="w-4 h-4 text-blue-400" />
                          <span>Sign In with Google to Submit Feedback</span>
                        </button>
                      </div>
                    </div>
                  ) : feedbackSubmitted ? (
                    <div className="text-center py-12 space-y-4 animate-in fade-in">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Feedback Received!</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Thank you for helping us improve GetJobLink, <span className="font-bold text-slate-800">{currentUser.displayName || currentUser.email}</span>. Your rating and comments have been recorded.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setFeedbackSubmitted(false);
                            setFeedbackMessage("");
                            setFeedbackRating(5);
                          }}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Submit additional feedback
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <h2 className="text-base font-bold text-slate-900">
                            Verified Member Feedback
                          </h2>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium truncate max-w-xs">{currentUser.email}</span>
                        </div>
                      </div>

                      {/* Rating Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          How would you rate your experience with GetJobLink? *
                        </label>
                        <div className="flex items-center space-x-2">
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
                              <Star className={`w-5 h-5 ${star <= feedbackRating ? "fill-amber-400" : ""}`} />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-slate-600 pl-2">
                            {feedbackRating === 5 && "⭐ Excellent"}
                            {feedbackRating === 4 && "⭐ Very Good"}
                            {feedbackRating === 3 && "⭐ Good / Satisfactory"}
                            {feedbackRating === 2 && "⭐ Needs Improvement"}
                            {feedbackRating === 1 && "⭐ Poor"}
                          </span>
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Feedback Topic / Category *
                        </label>
                        <select
                          value={feedbackCategory}
                          onChange={(e) => setFeedbackCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Platform Experience">Overall Platform Experience &amp; UI</option>
                          <option value="Job Quality">Job Curation &amp; Link Accuracy</option>
                          <option value="ATS Matcher">Role-Wise ATS Evaluation Tool</option>
                          <option value="Resume Builder">Resume Builder &amp; Downloads</option>
                          <option value="Feature Request">New Feature Request / Suggestion</option>
                          <option value="Bug Report">Technical Bug or Issue</option>
                        </select>
                      </div>

                      {/* Details Textarea */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Your Feedback &amp; Suggestions *
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          placeholder="What did you like? What features would make your job search easier? What can we improve?"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submittingFeedback}
                          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingFeedback ? "Submitting..." : "Submit Verified Feedback"}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
