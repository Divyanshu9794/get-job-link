import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import {
  Code2,
  Globe,
  CheckCircle2,
  ChevronRight,
  Plus,
  FolderGit2,
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

const SAMPLE_PROJECTS = [
  {
    id: "sample-1",
    title: "Distributed Job Stream Engine",
    description: "High-throughput event-driven microservices pipeline processing and deduplicating ATS listings with Redis caching.",
    githubUrl: "https://github.com",
    liveUrl: "https://getjoblink.in",
    techStack: ["Node.js", "Redis", "PostgreSQL", "Docker"],
    isVerified: true,
  },
  {
    id: "sample-2",
    title: "Real-time ATS Match Evaluator",
    description: "Interactive resume keyword extraction and scoring algorithm comparing semantic candidate skills against job requirements.",
    githubUrl: "https://github.com",
    liveUrl: "https://getjoblink.in/ats-checker",
    techStack: ["React", "TypeScript", "Tailwind CSS"],
    isVerified: true,
  },
];

export default function ProjectProofPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New project form
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    githubUrl: "",
    liveUrl: "",
    techStack: "React, Node.js, PostgreSQL",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      if (!currentUser) {
        setProjects(SAMPLE_PROJECTS);
        return;
      }
      try {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        const userProjects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) {
          setProjects(userProjects.length > 0 ? userProjects : SAMPLE_PROJECTS);
        }
      } catch (err) {
        console.error("Failed to load user projects:", err);
        if (isMounted) setProjects(SAMPLE_PROJECTS);
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) {
      showToast("Please enter a project title", "warning");
      return;
    }

    const techArray = newProject.techStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const projectData = {
      title: newProject.title,
      description: newProject.description,
      githubUrl: newProject.githubUrl,
      liveUrl: newProject.liveUrl,
      techStack: techArray,
      userId: currentUser?.uid || "guest",
      createdAt: Date.now(),
      isVerified: Boolean(newProject.githubUrl && newProject.githubUrl.includes("github.com")),
    };

    try {
      if (currentUser) {
        const docRef = await addDoc(collection(db, "projects"), projectData);
        setProjects((prev) => [{ id: docRef.id, ...projectData }, ...prev]);
      } else {
        setProjects((prev) => [{ id: `local-${Date.now()}`, ...projectData }, ...prev]);
      }
      setModalOpen(false);
      setNewProject({ title: "", description: "", githubUrl: "", liveUrl: "", techStack: "" });
      showToast("Technical project added to your portfolio!", "success");
    } catch (err) {
      console.error("Add project error:", err);
      showToast("Could not save project. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Project Proof - Technical Portfolio & Skill Verification | GetJobLink"
        description="Verify your programming skills with live repositories, deployed demos, and verified technical claims."
        canonicalUrl="https://getjoblink.in/project-proof"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Career Tools</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Project Proof</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Verified Engineering Proof</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Project <span className="text-blue-600 dark:text-blue-400">Proof</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Demonstrate actual coding competence. Connect GitHub repositories, deployed URLs, and technical architecture tags as verifiable evidence for hiring teams.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Proof Project</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  </div>
                  {p.isVerified ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      Claim
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {p.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 font-semibold"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Repository</span>
                    </a>
                  )}
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>

                <span className="text-[10px] text-slate-400">Technical Artifact</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Project Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Add Proof Project</h3>
              <p className="text-xs text-slate-500 mb-4">Add your technical project details and live links.</p>

              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Task Queue"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe the engineering problem solved, architecture, and metrics..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Live URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, Golang, Docker, AWS"
                    value={newProject.techStack}
                    onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
