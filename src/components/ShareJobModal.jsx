import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function ShareJobModal({ job, isOpen, onClose }) {
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen || !job) return null;

  const jobUrl = `${window.location.origin}/job/${job.id}`;
  const jobTitle = job.title || "Software Engineering Role";
  const company = job.company || "Leading Tech Company";
  const location = job.location || (job.isRemote ? "Remote" : "India");
  const exp = job.experience || "Fresher / Experienced";

  const prefilledMessage = `🚀 ${jobTitle} opportunity at ${company}\n📍 Location: ${location}\n💼 Experience: ${exp}\n\nApply directly: ${jobUrl}\n\nDiscover verified tech jobs without recruiter spam on GetJobLink.`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(jobUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = jobUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedLink(true);
      showToast("Job link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast("Could not copy link", "error");
    }
  };

  const handleCopySummary = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prefilledMessage);
      } else {
        const ta = document.createElement("textarea");
        ta.value = prefilledMessage;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedSummary(true);
      showToast("Formatted job post copied to clipboard!");
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      showToast("Could not copy summary", "error");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${jobTitle} at ${company}`,
          text: prefilledMessage,
          url: jobUrl,
        });
        showToast("Shared successfully!");
        onClose();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    } else {
      handleCopySummary();
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(prefilledMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleLinkedIn = () => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
    window.open(liUrl, "_blank", "noopener,noreferrer");
  };

  const handleTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(prefilledMessage)}`;
    window.open(tgUrl, "_blank", "noopener,noreferrer");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Share Opportunity</h3>
              <p className="text-[11px] text-slate-400">Help peers discover verified tech openings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opportunity Preview Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{jobTitle}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              Verified
            </span>
          </div>
          <div className="text-slate-600 dark:text-slate-300 font-medium">{company} • {location}</div>
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            {jobUrl}
          </p>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:scale-105 transition-all"
          >
            <MessageCircle className="w-5 h-5 mb-1 text-emerald-600" />
            <span className="text-[11px]">WhatsApp</span>
          </button>

          <button
            onClick={handleLinkedIn}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5 mb-1 fill-blue-600" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span className="text-[11px]">LinkedIn</span>
          </button>

          <button
            onClick={handleTelegram}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 hover:scale-105 transition-all"
          >
            <Send className="w-5 h-5 mb-1 text-sky-500" />
            <span className="text-[11px]">Telegram</span>
          </button>

          {typeof navigator !== "undefined" && navigator.share ? (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 hover:scale-105 transition-all"
            >
              <Share2 className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-[11px]">More Apps</span>
            </button>
          ) : (
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
            >
              {copiedLink ? <Check className="w-5 h-5 mb-1 text-emerald-600" /> : <Copy className="w-5 h-5 mb-1 text-slate-500" />}
              <span className="text-[11px]">{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          )}
        </div>

        {/* Action Copy Options */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleCopySummary}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            {copiedSummary ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{copiedSummary ? "Post Text Copied!" : "Copy Formatted Share Post"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedLink ? "Link Copied to Clipboard" : "Copy Direct GetJobLink URL"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
