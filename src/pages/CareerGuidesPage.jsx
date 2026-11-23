import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Calendar,
  Search,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { CAREER_GUIDES } from "../data/careerGuidesData";
import SEO from "../components/SEO";

export default function CareerGuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["All", "Fresher Careers", "Developer Roadmaps", "Resume & ATS", "Interview Prep", "Remote Work"];

  const filteredGuides = useMemo(() => {
    return CAREER_GUIDES.filter((guide) => {
      const matchesCategory = selectedCategory === "All" || guide.category === selectedCategory;
      const matchesSearch =
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 antialiased pb-16 transition-colors duration-200">
      <SEO
        title="Engineering Career Guides & Tech Hiring Roadmaps"
        description="In-depth, verified career roadmaps, ATS resume optimization strategies, technical interview frameworks, and off-campus placement guides written by senior engineers."
        canonicalUrl="/career-guides"
      />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-14 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>GetJobLink Editorial Publications</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Engineering Career Guides &amp; Hiring Roadmaps
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Original, research-backed guides written for software engineers, freshers, and tech
              candidates. Learn how modern tech firms evaluate resumes, screen algorithms, and hire
              for production systems.
            </p>
          </div>

          {/* Search & Category Pills */}
          <div className="mt-8 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guides by technology, role, or topic..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        {filteredGuides.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Career Guides Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search keywords or clear the category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGuides.map((guide) => (
              <article
                key={guide.slug}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-150 group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">
                      {guide.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{guide.readTime}</span>
                    </span>
                  </div>

                  <Link to={`/career-guides/${guide.slug}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 tracking-tight leading-snug">
                      {guide.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>

                  {/* Highlights checklist */}
                  {guide.highlights && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        What you will learn:
                      </span>
                      {guide.highlights.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-[11px] leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {guide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author & Read More Footer */}
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={guide.author.avatar}
                      alt={guide.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{guide.author.name}</span>
                      <span className="text-slate-400 text-[10px] flex items-center space-x-1">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>Updated {guide.updatedDate}</span>
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/career-guides/${guide.slug}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
