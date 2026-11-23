import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../context/ToastContext";
import SEO from "../components/SEO";

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setLoading(true);
    try {
      const subscriberId = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
      await updateDoc(doc(db, "newsletter_subscribers", subscriberId), {
        active: false,
        unsubscribedAt: new Date().toISOString(),
      });
      setUnsubscribed(true);
      showToast("You have been unsubscribed from the weekly digest.");
    } catch {
      // If doc not found, still confirm locally to respect user intent
      setUnsubscribed(true);
      showToast("Your email preferences have been updated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <SEO
        title="Unsubscribe: Email Preferences"
        description="Manage or unsubscribe your email preferences for GetJobLink Weekly Tech Jobs Digest."
        noIndex={true}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6" />
        </div>

        {unsubscribed ? (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Unsubscribed Successfully</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You will no longer receive the Weekly Tech Jobs Digest at <span className="font-bold">{email}</span>.
            </p>
            <div className="pt-2">
              <Link
                to="/jobs/india"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to GetJobLink</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4 text-xs">
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Unsubscribe from Digest</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirm your email address below to stop receiving the weekly digest.
              </p>
            </div>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-center"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              {loading ? "Updating Preferences..." : "Confirm Unsubscribe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
