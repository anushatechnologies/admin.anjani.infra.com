import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Edit2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { getBlogsServerAction } from '@/app/actions';
import { getAllBlogs, BlogArticle } from '@/data/blogs';

interface PageProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const blogs = await getBlogsServerAction();
    return blogs.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (error) {
    const fallbackBlogs = getAllBlogs();
    return fallbackBlogs.map((blog) => ({
      slug: blog.slug,
    }));
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const blogs = await getBlogsServerAction();
  const blog = blogs.find((b) => b.slug === params.slug || b.id === params.slug);

  if (!blog) {
    return {
      title: 'Article Not Found | Anjani Infra Admin Preview',
    };
  }

  return {
    title: `${blog.title} | Anjani Infra Admin Article Preview`,
    description: blog.excerpt || 'Live article preview in Anjani Infra Admin Portal',
  };
}

export default async function BlogPreviewPage({ params }: PageProps) {
  const blogs = await getBlogsServerAction();
  const blog = blogs.find((b) => b.slug === params.slug || b.id === params.slug);

  if (!blog) {
    notFound();
  }

  const mainWebsiteUrl = process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL || 'http://localhost:3002';
  const publicArticleUrl = `${mainWebsiteUrl}/blogs/${blog.slug}`;

  return (
    <div className="min-h-screen bg-[#0b1219] text-slate-100 flex flex-col font-sans selection:bg-[#C5A059]/30 selection:text-white">
      {/* ──────────────── STICKY ADMIN PREVIEW BAR ──────────────── */}
      <header className="sticky top-0 z-50 bg-[#101b26]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#E5C178] text-[11px] font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
            <span>Article Preview Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#C5A059] hover:text-slate-950 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Edit article in admin dashboard"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Article</span>
          </Link>

          <a
            href={publicArticleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#d4b068] text-slate-950 text-xs font-bold transition shadow-sm"
            title="Open on live public website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open on Public Site</span>
          </a>
        </div>
      </header>

      {/* ──────────────── MAIN ARTICLE CONTAINER ──────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Category & Featured Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/30">
            {blog.category || 'Interior Design'}
          </span>
          {blog.featured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Featured Post
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
          {blog.title}
        </h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed border-l-2 border-[#C5A059] pl-4 italic bg-[#101b26]/50 py-3 rounded-r-lg">
            {blog.excerpt}
          </p>
        )}

        {/* Author & Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {blog.author?.avatar ? (
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-10 h-10 rounded-full object-cover border border-[#C5A059]/40 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[#C5A059] font-bold border border-slate-700">
                {blog.author?.name ? blog.author.name.charAt(0) : 'A'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {blog.author?.name || 'Anjani Infra Editorial Team'}
              </p>
              <p className="text-[11px] text-slate-400">
                {blog.author?.role || 'Turnkey Interiors Specialist'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[12px]">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
              {blog.formattedDate || blog.date || 'Recent'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              {blog.readTime || '5 min read'}
            </span>
          </div>
        </div>

        {/* Hero Featured Image */}
        {blog.image && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#101b26]">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Intro Paragraphs */}
        {Array.isArray(blog.introParagraphs) && blog.introParagraphs.length > 0 && (
          <div className="space-y-5 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            {blog.introParagraphs.map((para, idx) => (
              <p key={idx} className="text-slate-200 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Structured Sections */}
        {Array.isArray(blog.sections) && blog.sections.length > 0 && (
          <div className="space-y-12 pt-4">
            {blog.sections.map((section, sIdx) => (
              <section key={sIdx} className="space-y-5">
                {section.heading && (
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 rounded-full bg-[#C5A059]"></span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {section.heading}
                    </h2>
                  </div>
                )}

                {section.subheading && (
                  <h3 className="text-base sm:text-lg font-semibold text-[#E5C178]">
                    {section.subheading}
                  </h3>
                )}

                {Array.isArray(section.paragraphs) && (
                  <div className="space-y-4">
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-slate-300 leading-relaxed text-sm sm:text-base">
                        {p}
                      </p>
                    ))}
                  </div>
                )}

                {Array.isArray(section.bulletPoints) && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 pl-2 pt-2">
                    {section.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-sm sm:text-base text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-1" />
                        <span className="leading-relaxed">{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.image && (
                  <div className="pt-4">
                    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md">
                      <img
                        src={section.image}
                        alt={section.imageCaption || section.heading || 'Article visual'}
                        className="w-full max-h-[420px] object-cover"
                      />
                    </div>
                    {section.imageCaption && (
                      <p className="text-center text-xs text-slate-400 mt-2 italic">
                        {section.imageCaption}
                      </p>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Conclusion Card */}
        {blog.conclusion && (
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#121f2d] via-[#101b26] to-[#0d1620] border border-[#C5A059]/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#E5C178] text-sm font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Conclusion &amp; Key Takeaways</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm sm:text-base">
              {blog.conclusion}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#C5A059]" />
            <span>Return to Admin Dashboard</span>
          </Link>

          <a
            href={publicArticleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#d4b068] text-slate-950 text-xs font-bold transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Published on Public Site</span>
          </a>
        </div>
      </main>
    </div>
  );
}
