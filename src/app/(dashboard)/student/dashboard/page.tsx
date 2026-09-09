"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  GraduationCap,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code2,
} from "lucide-react";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, gapRes] = await Promise.all([
          fetch("/api/student/profile"),
          fetch("/api/student/skill-gap"),
        ]);

        const profJson = await profRes.json();
        const gapJson = await gapRes.json();

        if (profJson.success) setProfile(profJson.profile);
        if (gapJson.success) setGapData(gapJson.data);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading student workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={{
          name: profile?.user?.name || "Student",
          email: profile?.user?.email || "",
          role: "STUDENT",
          profileId: profile?.id,
        }}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {profile?.institution?.name || "Apex Institute of Technology"}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Welcome back, {profile?.user?.name}!
              </h1>
              <p className="text-sm text-blue-100 max-w-xl">
                Target Role:{" "}
                <span className="font-semibold text-white">
                  {gapData?.jobRoleTitle || "Data Analyst"}
                </span>{" "}
                • {profile?.department?.name} • Reg: {profile?.registerNumber}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/student/skill-gap"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-md hover:bg-blue-50 transition flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analyze Skill Gap
              </Link>
              {profile?.id && (
                <Link
                  href={`/portfolio/${profile.id}`}
                  target="_blank"
                  className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25 transition flex items-center gap-2"
                >
                  View Digital Portfolio
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Top Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Career Readiness Score */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Career Readiness
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <GraduationCap className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">
                  {gapData?.careerReadinessScore || 65}
                </span>
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${gapData?.careerReadinessScore || 65}%` }}
                />
              </div>
            </div>
            <span className="mt-3 text-xs text-slate-500">
              Evaluated across skills, projects, hackathons & internships
            </span>
          </div>

          {/* Role Skill Match */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Role Skill Match
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">
                  {gapData?.matchPercentage || 0}%
                </span>
                <span className="text-sm font-medium text-emerald-600">
                  {gapData?.matchedCount || 0} / {gapData?.totalRequiredSkills || 0} skills
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${gapData?.matchPercentage || 0}%` }}
                />
              </div>
            </div>
            <span className="mt-3 text-xs text-slate-500">
              Target: {gapData?.jobRoleTitle || "Data Analyst"}
            </span>
          </div>

          {/* Priority Skill Gaps */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Priority Gaps
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-black text-slate-900">
                {gapData?.priorityGaps?.length || 0}
              </span>
              <span className="block text-xs font-medium text-amber-700 mt-1">
                {gapData?.priorityGaps?.filter((g: any) => g.priority === "HIGH").length || 0} High Priority
              </span>
            </div>
            <Link
              href="/student/skill-gap"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View learning path <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Academic & CGPA */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Academic Record
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <BookOpen className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">
                  {profile?.cgpa || 8.75}
                </span>
                <span className="text-sm font-medium text-slate-400">CGPA</span>
              </div>
              <span className="block text-xs text-slate-500 mt-1">
                Semester {profile?.semester || 6} • Batch of {profile?.batchYear || 2026}
              </span>
            </div>
            <span className="mt-3 text-xs text-emerald-600 font-medium">
              Verified Academic Standing
            </span>
          </div>
        </div>

        {/* Priority Gaps and Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Priority Skill Gaps */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recommended Skill Roadmap
                </h2>
                <p className="text-xs text-slate-500">
                  Bridging these gaps brings your readiness score above 85%
                </p>
              </div>
              <Link
                href="/student/skill-gap"
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View Full Analysis →
              </Link>
            </div>

            <div className="space-y-3">
              {gapData?.priorityGaps?.slice(0, 4).map((gap: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        gap.priority === "HIGH"
                          ? "bg-red-500"
                          : gap.priority === "MEDIUM"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {gap.skillName}
                      </div>
                      <div className="text-xs text-slate-500">
                        Required: <span className="font-semibold">{gap.requiredProficiency}</span> • Status:{" "}
                        <span className="text-amber-700 font-medium">
                          {gap.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      gap.priority === "HIGH"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {gap.priority} Priority
                  </span>
                </div>
              ))}
            </div>

            {/* Curated Course Picks */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Curated Recommended Courses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gapData?.recommendedResources?.slice(0, 2).map((res: any) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition group"
                  >
                    <div className="text-xs font-bold text-blue-600 mb-1 flex items-center justify-between">
                      <span>{res.provider}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {res.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Skill: {res.skillName} • {res.difficultyLevel}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Hub Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Digital Portfolio Hub
              </h2>
              <div className="space-y-2.5">
                <Link
                  href="/student/skills"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition text-sm font-semibold text-slate-800"
                >
                  <span className="flex items-center gap-2.5">
                    <Code2 className="h-4 w-4 text-blue-600" />
                    Manage Skills & Levels
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  href="/student/achievements"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition text-sm font-semibold text-slate-800"
                >
                  <span className="flex items-center gap-2.5">
                    <Award className="h-4 w-4 text-amber-600" />
                    Hackathons & Winning Proof
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  href="/student/skill-gap"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition text-sm font-semibold text-slate-800"
                >
                  <span className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    Live Skill Gap Engine
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Matched Opportunities Preview */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-md space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Industry Opportunities
              </span>
              <h3 className="text-lg font-bold">
                Junior Data Analyst @ Nexus
              </h3>
              <p className="text-xs text-slate-300">
                Bangalore (Hybrid) • ₹ 6.5 LPA - ₹ 8.5 LPA
              </p>
              <div className="pt-2">
                <Link
                  href="/student/skill-gap"
                  className="block text-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  View Matched Jobs & Apply
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
