import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  BarChart3,
  Award,
  Briefcase,
  UserCheck,
  Building2,
  FileCheck,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Skill<span className="text-blue-600">Verse</span>
              </span>
              <span className="hidden text-[10px] uppercase tracking-wider text-slate-400 sm:block">
                Academia • Industry Bridge
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative overflow-hidden py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI-Driven Skill Gap Analysis & Industry Placement Platform
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Bridge the Gap Between{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Classroom Learning
              </span>{" "}
              and Industry Careers.
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
              Analyze student competencies against live industry requirements, calculate deterministic career readiness scores, curate personalized learning paths, and connect top talent with verified employers.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/login"
                className="rounded-2xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition flex items-center gap-2"
              >
                Launch Platform
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="rounded-2xl bg-white border border-slate-300 px-7 py-3.5 text-base font-bold text-slate-800 hover:bg-slate-50 transition"
              >
                Create Free Account
              </Link>
            </div>

            {/* Quick Demo Credentials Info Banner */}
            <div className="mx-auto max-w-2xl p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-left text-xs space-y-1">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Pre-loaded Demo Accounts (Password: Password@123):
              </div>
              <div className="text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
                <div>• Student: <strong>student@apex.edu</strong></div>
                <div>• Faculty: <strong>faculty@apex.edu</strong></div>
                <div>• Industry: <strong>recruiter@nexus.com</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Skill Verse */}
        <div className="py-16 bg-white border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Multi-Stakeholder Collaboration
              </h2>
              <p className="text-3xl font-black text-slate-900">
                Engineered for Students, Academicians & Industries
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Student Pillar */}
              <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200/80 space-y-4 hover:border-blue-300 transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Students</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Log technical, soft, and aptitude competencies. Run live skill gap analysis against benchmark career roles, track hackathon awards with photographic evidence, and showcase a verified digital portfolio.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Explore Student Console →
                  </Link>
                </div>
              </div>

              {/* Faculty Pillar */}
              <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Academicians & Faculty</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Monitor department skill health, verify student project credentials, provide official mentorship guidance, and generate printable institutional Word (.docx) & PDF reports with 1 click.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Faculty Mentorship Roster →
                  </Link>
                </div>
              </div>

              {/* Industry Pillar */}
              <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200/80 space-y-4 hover:border-purple-300 transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Industry & Recruiters</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Post internships and campus jobs with weighted skill prerequisites. Search verified student talent with deterministic match algorithms and manage applicants efficiently.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    Industry Hiring Dashboard →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Core Innovations
              </h2>
              <p className="text-3xl font-black text-slate-900">
                Why Skill Verse Is Different
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h3 className="font-bold text-slate-900">Deterministic Gap Engine</h3>
                <p className="text-xs text-slate-600">
                  No black-box hallucinated scores. Computes exact weighted matches, missing skills, and proficiency deficits mathematically.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <Award className="h-6 w-6 text-amber-600" />
                <h3 className="font-bold text-slate-900">Hackathon & Prize Proofs</h3>
                <p className="text-xs text-slate-600">
                  Store hackathon wins, prize amounts, and physical photos of trophies and certificates in secure relational storage.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <FileCheck className="h-6 w-6 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Official Word Reports</h3>
                <p className="text-xs text-slate-600">
                  Server-side generation of editable .docx files featuring complete student dossiers, verified skills, and faculty endorsements.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
                <h3 className="font-bold text-slate-900">Private File Access</h3>
                <p className="text-xs text-slate-600">
                  Student resumes and academic credentials protected behind authenticated streaming endpoints with strict RBAC rules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© 2026 Skill Verse. Built with Next.js, TypeScript, Tailwind CSS, and Prisma ORM.</p>
      </footer>
    </div>
  );
}
