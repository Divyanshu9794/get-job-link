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
  Plus,
  Trash2,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  MapPin,
  FolderGit2,
  ExternalLink,
  RefreshCw,
  Info,
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

const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "Go",
  "Docker",
  "Kubernetes",
  "AWS",
  "PostgreSQL",
  "MongoDB",
  "Next.js",
  "Tailwind CSS",
  "Redis",
  "GraphQL",
];

export default function PassportPage() {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useToast();

  const isPublicViewer = Boolean(id);
  const passportUserId = id || currentUser?.uid;

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("identity"); // "identity", "skills", "projects", "links"

  // Quick tag input buffers
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newRoleInput, setNewRoleInput] = useState("");

  // Passport state
  const [passport, setPassport] = useState({
    displayName: "",
    headline: "Full Stack Engineer & Tech Specialist",
    bio: "Passionate engineer focusing on modern distributed systems, scalable web apps, and clean architecture.",
    isPublic: true,
    showEmail: false,
    email: "",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
    preferredRoles: ["Full Stack Developer", "Backend Engineer"],
    experienceYears: "2-4 Years",
    location: "Bengaluru, India",
    availability: "Actively Looking",
    githubUrl: "https://github.com/",
    linkedinUrl: "https://linkedin.com/in/",
    portfolioUrl: "",
    education: "B.Tech in Computer Science",
    projects: [
      {
        title: "Distributed Microservices Stream",
        description: "High-throughput event-driven microservices pipeline processing and deduplicating job listings with Redis caching.",
        techStack: ["Node.js", "Redis", "Docker", "PostgreSQL"],
        githubUrl: "https://github.com",
        liveUrl: "",
      },
    ],
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
          const data = snap.data();
          setPassport((prev) => ({
            ...prev,
            ...data,
            skills: Array.isArray(data.skills) ? data.skills : prev.skills,
            preferredRoles: Array.isArray(data.preferredRoles) ? data.preferredRoles : prev.preferredRoles,
            projects: Array.isArray(data.projects) ? data.projects : prev.projects,
          }));
        } else if (currentUser && isMounted) {
          setPassport((prev) => ({
            ...prev,
            displayName: currentUser.displayName || prev.displayName || "Tech Professional",
            email: currentUser.email || prev.email || "",
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

  // Completeness criteria checklist
  const completenessItems = [
    {
      id: "identity",
      label: "Name & Professional Headline",
      desc: "Introduce yourself and primary specialty",
      done: Boolean(passport.displayName && passport.headline),
      weight: 20,
    },
    {
      id: "bio",
      label: "Career Pitch / Bio",
      desc: "Summary of your engineering philosophy & domain focus",
      done: Boolean(passport.bio && passport.bio.trim().length >= 15),
      weight: 20,
    },
    {
      id: "skills",
      label: "Skills & Target Roles",
      desc: "Add at least 3 technical competencies & 1 target role",
      done: Boolean(passport.skills?.length >= 3 && passport.preferredRoles?.length >= 1),
      weight: 20,
    },
    {
      id: "projects",
      label: "Featured Technical Projects",
      desc: "Showcase real code repositories or live applications",
      done: Boolean(passport.projects?.length > 0 && passport.projects[0]?.title),
      weight: 20,
    },
    {
      id: "links",
      label: "Public Coding Links",
      desc: "Attach your GitHub, LinkedIn, or portfolio URL",
      done: Boolean(passport.githubUrl || passport.linkedinUrl || passport.portfolioUrl),
      weight: 20,
    },
  ];

  const completeness = completenessItems.reduce((acc, item) => acc + (item.done ? item.weight : 0), 0);

  // One-click import from existing Resume / Profile data
  const handleImportFromResume = () => {
    let syncedItems = 0;
    const next = { ...passport };

    if (userProfile?.displayName && !next.displayName) {
      next.displayName = userProfile.displayName;
      syncedItems++;
    }
    if (userProfile?.headline) {
      next.headline = userProfile.headline;
      syncedItems++;
    }
    if (userProfile?.targetRole && (!next.preferredRoles || next.preferredRoles.length === 0)) {
      next.preferredRoles = [userProfile.targetRole];
      syncedItems++;
    }
    if (userProfile?.experience) {
      next.experienceYears = userProfile.experience;
      syncedItems++;
    }
    if (userProfile?.skills && Array.isArray(userProfile.skills)) {
      const merged = Array.from(new Set([...next.skills, ...userProfile.skills]));
      if (merged.length > next.skills.length) {
        syncedItems += (merged.length - next.skills.length);
        next.skills = merged;
      }
    }

    // Attempt to merge from stored DNA skills
    try {
      const storedDna = localStorage.getItem("gjl_user_dna_skills");
      if (storedDna) {
        const dnaSkills = JSON.parse(storedDna);
        if (Array.isArray(dnaSkills)) {
          const names = dnaSkills.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean);
          const merged = Array.from(new Set([...next.skills, ...names]));
          if (merged.length > next.skills.length) {
            syncedItems += (merged.length - next.skills.length);
            next.skills = merged;
          }
        }
      }
    } catch {
      // ignore parsing error
    }

    setPassport(next);
    if (syncedItems > 0) {
      showToast(`Imported ${syncedItems} attributes & skills from your profile/resume!`, "success");
    } else {
      showToast("Profile skills and credentials already up to date.", "info");
    }
  };

  // Save changes to Firestore
  const handleSavePassport = async (e) => {
    if (e) e.preventDefault();
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

  // Copy share URL
  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      showToast("Passport URL copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  // Download QR Code image
  const handleDownloadQr = async () => {
    try {
      const res = await fetch(qrCodeUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(passport.displayName || "candidate").replace(/\s+/g, "_")}_Passport_QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("QR code downloaded! Add it to your resume or portfolio.", "success");
    } catch {
      window.open(qrCodeUrl, "_blank");
    }
  };

  // Add / Remove Skills
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    if (!trimmed) return;
    if (!passport.skills.includes(trimmed)) {
      setPassport((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setPassport((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Add / Remove Preferred Roles
  const handleAddRole = (e) => {
    if (e && e.key && e.key !== "Enter") return;
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = newRoleInput.trim();
    if (!trimmed) return;
    if (!passport.preferredRoles.includes(trimmed)) {
      setPassport((prev) => ({
        ...prev,
        preferredRoles: [...prev.preferredRoles, trimmed],
      }));
    }
    setNewRoleInput("");
  };

  const handleRemoveRole = (roleToRemove) => {
    setPassport((prev) => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter((r) => r !== roleToRemove),
    }));
  };

  // Add / Remove Projects
  const handleAddProject = () => {
    setPassport((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: "New Technical Project",
          description: "Briefly explain the problem solved, architectural choices, and impact.",
          techStack: ["React", "Node.js"],
          githubUrl: "https://github.com",
          liveUrl: "",
        },
      ],
    }));
  };

  const handleUpdateProject = (index, field, value) => {
    setPassport((prev) => {
      const nextProjects = [...prev.projects];
      nextProjects[index] = {
        ...nextProjects[index],
        [field]: value,
      };
      return { ...prev, projects: nextProjects };
    });
  };

  const handleRemoveProject = (index) => {
    setPassport((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index),
    }));
  };

  // Unique shareable URL and QR code URL
  const shareableUrl = `${window.location.origin}/passport/${passportUserId || "user"}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    shareableUrl
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors pb-16">
      <SEO
        title={`${passport.displayName || "Job Seeker"} - Professional Career Passport | GetJobLink`}
        description="Shareable verified candidate passport with skills, experience, project credentials, and privacy controls."
        canonicalUrl={`https://getjoblink.in/passport/${passportUserId || ""}`}
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Career Tools</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Job Seeker Passport</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Verified Career Identity</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Job Seeker <span className="text-blue-600 dark:text-blue-400">Passport</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Your web-native, interactive technical identity & portfolio. Share a single verified link or scannable QR code without exposing your personal email or phone number.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center flex-wrap gap-2 pt-2 md:pt-0">
              {!isPublicViewer && (
                <>
                  <button
                    type="button"
                    onClick={handleImportFromResume}
                    title="Auto-fill skills and background from your resume"
                    className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Sync with Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMode(!editMode)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{editMode ? "Close Editor" : "Edit Passport"}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Share Link"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                title="Print or save as PDF card"
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Resume vs Passport Explainer Callout */}
          <div className="mt-5 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 flex items-start space-x-3 text-xs text-blue-900 dark:text-blue-200">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Passport vs. Resume: </span>
              A resume is a formal static document for ATS job applications. Your <strong>Job Seeker Passport</strong> is your public digital developer ID with a live scannable QR code, verified skills, and clickable projects to share on LinkedIn, GitHub, or in direct messages with hiring managers.
              <span className="ml-2 font-semibold underline inline-block">
                <Link to="/resume" className="hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center space-x-0.5">
                  <span>Open ATS Resume Builder</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </Link>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Interactive Passport Completeness Card */}
        {!isPublicViewer && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Passport Completeness
                  </h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {completeness}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete these sections to make your passport stand out when scanned by recruiters.
                </p>
              </div>

              {completeness >= 80 ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready to Share!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(true);
                    setActiveTab("identity");
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Improve Score &rarr;
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-5">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${completeness}%` }}
              />
            </div>

            {/* Completeness Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {completenessItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setEditMode(true);
                    if (item.id === "identity" || item.id === "bio") setActiveTab("identity");
                    else if (item.id === "skills") setActiveTab("skills");
                    else if (item.id === "projects") setActiveTab("projects");
                    else if (item.id === "links") setActiveTab("links");
                  }}
                  className={`text-left p-3 rounded-2xl border transition-all ${
                    item.done
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                      : "bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.label}
                    </span>
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">+{item.weight}%</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inline Sectional Editor (Visible when editMode is active) */}
        {editMode && !isPublicViewer && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-900/60 p-6 shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Customize Your Career Passport</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your identity, skill tags, highlighted projects, and privacy controls.
                </p>
              </div>

              {/* Editor Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("identity")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "identity"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Identity
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("skills")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "skills"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Skills & Roles
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "projects"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Projects ({passport.projects?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("links")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "links"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Links & Privacy
                </button>
              </div>
            </div>

            {/* Tab 1: Identity & Bio */}
            {activeTab === "identity" && (
              <div className="py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={passport.displayName}
                      onChange={(e) => setPassport({ ...passport, displayName: e.target.value })}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={passport.headline}
                      onChange={(e) => setPassport({ ...passport, headline: e.target.value })}
                      placeholder="e.g. Senior Backend Engineer | Distributed Systems"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Career Pitch & Bio
                  </label>
                  <textarea
                    rows={3}
                    value={passport.bio}
                    onChange={(e) => setPassport({ ...passport, bio: e.target.value })}
                    placeholder="Briefly describe what you build, technologies you master, and what kinds of opportunities excite you."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Location
                    </label>
                    <input
                      type="text"
                      value={passport.location}
                      onChange={(e) => setPassport({ ...passport, location: e.target.value })}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Experience Level
                    </label>
                    <select
                      value={passport.experienceYears}
                      onChange={(e) => setPassport({ ...passport, experienceYears: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Fresher (0 - 1 Years)">Fresher (0 - 1 Years)</option>
                      <option value="1 - 3 Years">1 - 3 Years</option>
                      <option value="3 - 5 Years">3 - 5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Availability Status
                    </label>
                    <select
                      value={passport.availability}
                      onChange={(e) => setPassport({ ...passport, availability: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Actively Looking">🟢 Actively Looking</option>
                      <option value="Open to Offers">🟡 Open to Offers</option>
                      <option value="Exploring Projects">🟣 Exploring Projects</option>
                      <option value="Not Looking">⚪ Not Looking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Education & Degree
                  </label>
                  <input
                    type="text"
                    value={passport.education}
                    onChange={(e) => setPassport({ ...passport, education: e.target.value })}
                    placeholder="e.g. B.Tech in Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Skills & Target Roles */}
            {activeTab === "skills" && (
              <div className="py-5 space-y-6">
                {/* Skills Tag Management */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Core Technical Competencies ({passport.skills?.length || 0})
                  </label>

                  {/* Existing Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {passport.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500 transition-colors ml-1 font-bold"
                          title="Remove skill"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Custom Skill */}
                  <div className="flex items-center space-x-2 max-w-md">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add custom skill (press Enter)..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Popular Quick-Add Pills */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                      Suggested skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SKILLS.filter((s) => !passport.skills.includes(s)).slice(0, 8).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAddSkill(s)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Preferred Roles */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Target Job Roles & Career Interests
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {passport.preferredRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                      >
                        <span>{role}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="hover:text-red-500 transition-colors ml-1 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 max-w-md">
                    <input
                      type="text"
                      value={newRoleInput}
                      onChange={(e) => setNewRoleInput(e.target.value)}
                      onKeyDown={handleAddRole}
                      placeholder="Add target role (e.g. Backend Engineer)..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Featured Projects */}
            {activeTab === "projects" && (
              <div className="py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add highlighted projects with repository or demo links to verify your technical capabilities.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {passport.projects?.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                          Project #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleUpdateProject(idx, "title", e.target.value)}
                          placeholder="Project Title"
                          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack || ""}
                          onChange={(e) =>
                            handleUpdateProject(
                              idx,
                              "techStack",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="Tech Stack (comma separated, e.g. React, Node.js)"
                          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(idx, "description", e.target.value)}
                        placeholder="Brief project description & technical highlights"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="url"
                          value={proj.githubUrl || ""}
                          onChange={(e) => handleUpdateProject(idx, "githubUrl", e.target.value)}
                          placeholder="GitHub Repository URL"
                          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="url"
                          value={proj.liveUrl || ""}
                          onChange={(e) => handleUpdateProject(idx, "liveUrl", e.target.value)}
                          placeholder="Live Demo URL (optional)"
                          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Links & Privacy Controls */}
            {activeTab === "links" && (
              <div className="py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      value={passport.githubUrl}
                      onChange={(e) => setPassport({ ...passport, githubUrl: e.target.value })}
                      placeholder="https://github.com/yourhandle"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={passport.linkedinUrl}
                      onChange={(e) => setPassport({ ...passport, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/yourhandle"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Personal Portfolio / Website
                  </label>
                  <input
                    type="url"
                    value={passport.portfolioUrl}
                    onChange={(e) => setPassport({ ...passport, portfolioUrl: e.target.value })}
                    placeholder="https://yourportfolio.dev"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Public Passport Access
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Allow recruiters & peers with your link or QR code to view this passport.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={passport.isPublic}
                      onChange={(e) => setPassport({ ...passport, isPublic: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Contact Protection
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Zero spam: your personal phone and email remain private unless explicitly shared.
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Protected</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Editor Action Footer */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSavePassport}
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Passport</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASSPORT DIGITAL IDENTITY CARD (The Shareable Visual ID)       */}
        {/* ============================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden print:border-none print:shadow-none">
          {/* Header Security Stripe */}
          <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 relative px-6 sm:px-8 flex items-end justify-between pb-4">
            <div className="flex items-center space-x-2 text-xs text-white/95 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>GetJobLink Authenticated Technical Passport</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-black/40 backdrop-blur-md text-white border border-white/20">
                {passport.availability === "Actively Looking" && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                {passport.availability === "Open to Offers" && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                {passport.availability === "Exploring Projects" && <span className="h-2 w-2 rounded-full bg-purple-400" />}
                {passport.availability === "Not Looking" && <span className="h-2 w-2 rounded-full bg-slate-400" />}
                <span>{passport.availability || "Open to Offers"}</span>
              </span>

              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-white border border-white/20">
                {passport.isPublic ? <Eye className="w-3 h-3 text-emerald-300" /> : <EyeOff className="w-3 h-3 text-amber-300" />}
                <span>{passport.isPublic ? "Public" : "Private"}</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Identity Row: Name, Headline, Bio, and QR Code */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {passport.displayName || "Tech Professional"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    ID #{passportUserId ? passportUserId.slice(0, 8).toUpperCase() : "VERIFIED"}
                  </span>
                </div>

                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {passport.headline || "Software Engineer & Builder"}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {passport.bio || "Engineer committed to clean scalable code, high performance web architectures, and reliable product delivery."}
                </p>

                {/* Location & Status Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  {passport.location && (
                    <span className="inline-flex items-center space-x-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{passport.location}</span>
                    </span>
                  )}
                  <span>&bull;</span>
                  <span className="inline-flex items-center space-x-1 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{passport.experienceYears}</span>
                  </span>
                  {passport.education && (
                    <>
                      <span>&bull;</span>
                      <span className="inline-flex items-center space-x-1 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{passport.education}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Social & Professional Links */}
                <div className="flex items-center space-x-2 pt-3">
                  {passport.githubUrl && (
                    <a
                      href={passport.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}

                  {passport.linkedinUrl && (
                    <a
                      href={passport.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {passport.portfolioUrl && (
                    <a
                      href={passport.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Unique QR Code Container */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shrink-0 w-full sm:w-auto shadow-2xs">
                <img
                  src={qrCodeUrl}
                  alt="Candidate Unique QR Code"
                  className="w-28 h-28 rounded-xl bg-white p-1 mx-auto"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1.5">
                  Scan to View Live
                </span>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center space-x-1 mx-auto"
                >
                  <Download className="w-3 h-3" />
                  <span>Download QR</span>
                </button>
              </div>
            </div>

            {/* Target Job Roles */}
            {passport.preferredRoles?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Target Roles & Focus Areas</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {passport.preferredRoles.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Verified Technical Competencies</span>
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

            {/* Featured Projects Showcase */}
            {passport.projects?.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Featured Technical Projects</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {passport.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {proj.title}
                        </h4>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                              title="View GitHub Repository"
                            >
                              <GithubIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                              title="Open Live Demo"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {proj.description}
                      </p>

                      {proj.techStack && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(Array.isArray(proj.techStack)
                            ? proj.techStack
                            : String(proj.techStack).split(",")
                          ).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passport Footer Guarantee */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero recruiter spam &bull; Direct talent identity &bull; Verified on GetJobLink</span>
              </span>
              <span className="font-mono text-[10px]">
                PASS-{passportUserId ? passportUserId.slice(-6).toUpperCase() : "LIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Footer Links */}
        <div className="flex items-center justify-center space-x-4 text-xs font-semibold text-slate-500 pt-4">
          <Link to="/resume" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Open ATS Resume Builder</span>
          </Link>
          <span>&bull;</span>
          <Link to="/ats-checker" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check Resume ATS Score</span>
          </Link>
          <span>&bull;</span>
          <Link to="/project-proof" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Project Proof</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
