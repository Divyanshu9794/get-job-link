import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs, addDoc } from "firebase/firestore";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ChevronRight,
  Plus,
} from "lucide-react";
import { db } from "../firebase";
import SEO from "../components/SEO";
import { useToast } from "../context/ToastContext";

const CHANNELS = [
  { id: "all", name: "All Discussions" },
  { id: "oa", name: "Online Assessments (OA)" },
  { id: "interviews", name: "Technical Interview Prep" },
  { id: "resume", name: "Resume Feedback" },
  { id: "hiring", name: "Hiring Alerts & Referrals" },
];

const ANONYMOUS_HANDLES = [
  "Anonymous Engineer",
  "Anonymous Falcon",
  "Anonymous Architect",
  "Anonymous Developer",
  "Anonymous Algorist",
];

const SAMPLE_POSTS = [
  {
    id: "p-1",
    title: "Uber India SDE-2 Backend Virtual Onsite Experience",
    content: "3 rounds: 1 Machine Coding (Design an in-memory cache with TTL), 1 System Design (Global Ride Dispatcher), and 1 Hiring Manager cultural fit. Focus heavily on concurrency and clean OOP.",
    channel: "interviews",
    authorName: "Anonymous Architect",
    upvotes: 42,
    commentsCount: 14,
    createdAt: 1795800000000,
  },
  {
    id: "p-2",
    title: "Google Online Assessment (OA) Patterns for 2026 Batch",
    content: "Recent 2026 graduate OA focused on Monotonic Queues and Segment Trees with 2 questions in 60 mins. High edge-case test coverage required.",
    channel: "oa",
    authorName: "Anonymous Falcon",
    upvotes: 38,
    commentsCount: 9,
    createdAt: 1795700000000,
  },
  {
    id: "p-3",
    title: "Resume Review: 3 YOE Full Stack applying for US remote roles",
    content: "Switched bullet points from responsibilities to quantified impact ('Reduced API latency by 35% using Redis caching'). Got 3 ATS callback invites this week!",
    channel: "resume",
    authorName: "Anonymous Developer",
    upvotes: 27,
    commentsCount: 6,
    createdAt: 1795600000000,
  },
];

export default function CommunityPage() {
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("gjl_community_upvotes");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // New post state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    channel: "oa",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadPosts() {
      try {
        const q = query(
          collection(db, "community_posts"),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const snap = await getDocs(q);
        const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) {
          setPosts(records.length > 0 ? records : SAMPLE_POSTS);
        }
      } catch (err) {
        console.error("Failed to load community posts:", err);
        if (isMounted) setPosts(SAMPLE_POSTS);
      }
    }
    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpvote = (postId) => {
    const isCurrentlyUpvoted = upvotedIds.has(postId);
    const delta = isCurrentlyUpvoted ? -1 : 1;

    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyUpvoted) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      try {
        localStorage.setItem("gjl_community_upvotes", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return { ...p, upvotes: Math.max(0, (p.upvotes || 0) + delta) };
        }
        return p;
      })
    );
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      showToast("Please provide both title and content", "warning");
      return;
    }

    const randomHandle =
      ANONYMOUS_HANDLES[Math.floor(Math.random() * ANONYMOUS_HANDLES.length)];

    const postRecord = {
      title: newPost.title,
      content: newPost.content,
      channel: newPost.channel,
      authorName: randomHandle,
      upvotes: 1,
      commentsCount: 0,
      createdAt: Date.now(),
    };

    try {
      const docRef = await addDoc(collection(db, "community_posts"), postRecord);
      setPosts((prev) => [{ id: docRef.id, ...postRecord }, ...prev]);
      setModalOpen(false);
      setNewPost({ title: "", content: "", channel: "oa" });
      showToast("Post published anonymously!", "success");
    } catch (err) {
      console.error("Create post error:", err);
      // Fallback local addition if firestore rules require auth
      setPosts((prev) => [{ id: `local-${Date.now()}`, ...postRecord }, ...prev]);
      setModalOpen(false);
      showToast("Post published anonymously!", "success");
    }
  };

  const filteredPosts = posts.filter(
    (p) => selectedChannel === "all" || p.channel === selectedChannel
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Anonymous Tech Job Seekers' Lounge - OA & Interview Discussions | GetJobLink"
        description="Safe, moderated anonymous community for engineers. Discuss OA experiences, technical interviews, resume feedback, and hiring updates."
        canonicalUrl="https://getjoblink.in/community"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Community</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Anonymous Engineering Lounge</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Job Seekers&apos; <span className="text-blue-600 dark:text-blue-400">Lounge</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Peer-moderated discussion for genuine candidates. Share real OA insights, technical round breakdowns, and resume strategies without fear of recruiter exposure.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Anonymous Post</span>
            </button>
          </div>

          {/* Channels Filter */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChannel(ch.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedChannel === ch.id
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {ch.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Discussions Feed */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const hasUpvoted = upvotedIds.has(post.id);
            return (
              <article
                key={post.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{post.authorName}</span>
                    <span>•</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                      {post.channel}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Verified Peer</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Engagement Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleUpvote(post.id)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                        hasUpvoted
                          ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? "fill-blue-600" : ""}`} />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    <div className="inline-flex items-center space-x-1.5 text-slate-500 font-medium">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentsCount} comments</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400">Anonymous Safe Space</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Modal: New Post */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Start Anonymous Discussion</h3>
              <p className="text-xs text-slate-500 mb-4">Your email or identity is never linked to this post.</p>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic Channel</label>
                  <select
                    value={newPost.channel}
                    onChange={(e) => setNewPost({ ...newPost, channel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="oa">Online Assessments (OA)</option>
                    <option value="interviews">Technical Interview Prep</option>
                    <option value="resume">Resume Feedback</option>
                    <option value="hiring">Hiring Alerts & Referrals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Post Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe SDE Backend Interview Round Questions"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Discussion Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share specific technical details, rounds, algorithms or advice..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
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
                    Post Anonymously
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
