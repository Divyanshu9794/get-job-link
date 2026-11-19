import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Share2,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { getGuideBySlug, CAREER_GUIDES } from "../data/careerGuidesData";
import { useToast } from "../context/ToastContext";
import SEO from "../components/SEO";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function CareerGuideDetailPage() {
  const { slug } = useParams();
  const { showToast } = useToast();

  const guide = useMemo(() => getGuideBySlug(slug), [slug]);

  if (!guide) {
    return <Navigate to="/career-guides" replace />;
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Article link copied to clipboard!");
    } else {
      showToast("URL: " + window.location.href, "info");
    }
  };

  const otherGuides = CAREER_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  // Schema.org Article Structured Data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    author: {
      "@type": "Person",
      name: guide.author.name,
      jobTitle: guide.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "GetJobLink",
      logo: {
        "@type": "ImageObject",
        url: "https://getjoblink.in/logo.jpeg",
      },
    },
    datePublished: guide.publishedDate,
    dateModified: guide.updatedDate,
    mainEntityOfPage: `https://getjoblink.in/career-guides/${guide.slug}`,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <SEO
        title={guide.title}
        description={guide.description}
        canonicalUrl={`/career-guides/${guide.slug}`}
        ogType="article"
        jsonLd={articleJsonLd}
      />

      {/* Top Breadcrumb & Actions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/career-guides"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Career Guides</span>
          </Link>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Share article"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Article Container */}
        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {/* Article Header */}
          <header className="space-y-4 pb-6 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                {guide.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{guide.readTime}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {guide.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
              {guide.description}
            </p>

            {/* Author Byline & Date */}
            <div className="pt-2 flex items-center space-x-3.5">
              <img
                src={guide.author.avatar}
                alt={guide.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="text-xs leading-snug">
                <div className="font-bold text-slate-900">{guide.author.name}</div>
                <div className="text-slate-400 text-[11px] flex items-center space-x-2">
                  <span>{guide.author.role}</span>
                  <span>•</span>
                  <span>Published {guide.publishedDate}</span>
                  <span>•</span>
                  <span>Updated {guide.updatedDate}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Key Takeaways Box */}
          {guide.highlights && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Core Actionable Takeaways</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {guide.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Main Text (Formatted with Headings, Bold, Lists & Blockquotes) */}
          <div className="pt-2 pb-4">
            <MarkdownRenderer content={guide.content} />
          </div>

          {/* Editorial Integrity Attribution */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 text-xs text-slate-600">
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800">Editorial Policy &amp; Sourcing</h4>
              <p className="leading-relaxed text-[11px] text-slate-500">
                This guide was researched and published by the GetJobLink technical editorial team. We
                do not accept sponsored inclusions or paid placements. All compensation benchmarks,
                interview patterns, and ATS parser guidelines reflect verified hiring records from our
                daily curated job listings.
              </p>
            </div>
          </div>

          {/* Interactive Tools Callout */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-base">Benchmark Your Tech Resume Today</h3>
              <p className="text-xs text-slate-300">
                Use our free, instant ATS Score Evaluator to check your resume against real job descriptions.
              </p>
            </div>
            <Link
              to="/ats-checker"
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evaluate My Resume</span>
            </Link>
          </div>
        </article>

        {/* Related Guides Section */}
        {otherGuides.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Related Technical Career Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherGuides.map((g) => (
                <Link
                  key={g.slug}
                  to={`/career-guides/${g.slug}`}
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-400 hover:shadow-xs transition-all space-y-2 group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {g.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                    {g.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {g.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
