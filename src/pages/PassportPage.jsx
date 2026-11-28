import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  QrCode,
  Share2,
  Shield,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { db } from "../firebase";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  );
}

export default function PassportPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const isPublicViewer = Boolean(id);
  const passportUserId = id || currentUser?.uid;

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Passport state
  const [passport, setPassport] = useState({
    displayName: "",
    headline: "Full Stack Engineer & Tech Specialist",
    bio: "Passionate engineer focusing on modern distributed systems, scalable web apps, and clean architecture.",
    isPublic: true,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
    preferredRoles: ["Full Stack Developer", "Backend Engineer"],
    experienceYears: "2-4 Years",
    githubUrl: "https://github.com/",
    linkedinUrl: "https://linkedin.com/in/",
    portfolioUrl: "",
    education: "B.Tech in Computer Science",
  });

  // Load passport from Firestore or fallback to user profile
  useEffect(() => {
    let isMounted = true;
    async function fetchPassport() {
      if (!passportUserId) {
        return;
      }
      try {
        const passportRef = doc(db, "passports", passportUserId);
        const snap = await getDoc(passportRef);
        if (snap.exists() && isMounted) {
          setPassport((prev) => ({ ...prev, ...snap.data() }));
        } else if (currentUser && isMounted) {
          // Pre-populate with auth details
          setPassport((prev) => ({
            ...prev,
            displayName: currentUser.displayName || "Tech Professional",
          }));
        }
      } catch (err) {
        console.error("Error reading passport:", err);
      }
    }
    fetchPassport();
    return () => {
      isMounted = false;
    };
  }, [passportUserId, currentUser]);

  // Profile completeness calculation
  const completeness = Math.min(
    100,
    (passport.displayName ? 20 : 0) +
      (passport.headline ? 20 : 0) +
      (passport.bio ? 20 : 0) +
      (passport.skills.length > 2 ? 20 : 0) +
      (passport.githubUrl ? 10 : 0) +
      (passport.linkedinUrl ? 10 : 0)
  );

  const handleSavePassport = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please sign in to save your passport", "warning");
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, "passports", currentUser.uid);
      await setDoc(ref, {
        ...passport,
        uid: currentUser.uid,
        updatedAt: Date.now(),
      });
      setEditMode(false);
      showToast("Career Passport updated successfully!", "success");
    } catch (err) {
      console.error("Save passport error:", err);
      showToast("Failed to save passport. Please check connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyShareUrl = async () => {
    const url = `${window.location.origin}/passport/${currentUser?.uid || "preview"}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Passport URL copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  // Generate QR code URL using standard public QR API
  const shareableUrl = `${window.location.origin}/passport/${passportUserId || "user"}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    shareableUrl
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title={`${passport.displayName || "Job Seeker"} - Professional Career Passport | GetJobLink`}
        description="Shareable verified candidate passport with skills, experience, project credentials, and privacy controls."
        canonicalUrl={`https://getjoblink.in/passport/${passportUserId || ""}`}
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Career Tools</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Job Seeker Passport</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Verified Career Identity</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Job Seeker <span className="text-blue-600 dark:text-blue-400">Passport</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your shareable verified technical profile. Privacy-first, zero contact spam, instant QR generation.
              </p>
            </div>

            {!isPublicViewer && currentUser && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEditMode(!editMode)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editMode ? "Cancel Editing" : "Edit Passport"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Share Link"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Completeness Bar */}
        {!isPublicViewer && (
          <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Passport Completeness</span>
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        )}

        {/* Passport Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          {/* Top Banner Stripe */}
          <div className="h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 relative px-6 flex items-end justify-between pb-4">
            <div className="flex items-center space-x-2 text-xs text-white/90 font-medium">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>GetJobLink Authenticated Identity</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-black/30 backdrop-blur-md text-white border border-white/20">
              {passport.isPublic ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Profile</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Private</span>
                </>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5 flex-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {passport.displayName || "Anonymous Candidate"}
                </h2>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {passport.headline}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {passport.bio}
                </p>

                {/* Social Links */}
                <div className="flex items-center space-x-3 pt-3">
                  {passport.githubUrl && (
                    <a
                      href={passport.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {passport.linkedinUrl && (
                    <a
                      href={passport.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="Passport QR Code"
                  className="w-24 h-24 rounded-lg bg-white p-1 mx-auto"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1.5">
                  Scan to View
                </span>
              </div>
            </div>

            {/* Skills & Experience Section */}
            <div className="py-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Technical Competencies</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {passport.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Experience Level</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {passport.experienceYears}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Education</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {passport.education}
                  </div>
                </div>
              </div>
            </div>

            {/* Editing Form */}
            {editMode && (
              <form onSubmit={handleSavePassport} className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Your Passport</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={passport.displayName}
                      onChange={(e) => setPassport({ ...passport, displayName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Headline</label>
                    <input
                      type="text"
                      value={passport.headline}
                      onChange={(e) => setPassport({ ...passport, headline: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={passport.bio}
                    onChange={(e) => setPassport({ ...passport, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">GitHub Profile</label>
                    <input
                      type="url"
                      value={passport.githubUrl}
                      onChange={(e) => setPassport({ ...passport, githubUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={passport.linkedinUrl}
                      onChange={(e) => setPassport({ ...passport, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={passport.isPublic}
                    onChange={(e) => setPassport({ ...passport, isPublic: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="isPublic" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Make Passport Publicly Accessible via unique link
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
