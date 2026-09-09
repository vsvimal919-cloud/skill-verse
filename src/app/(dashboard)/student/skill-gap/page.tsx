"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BookOpen,
  Briefcase,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FolderGit2,
} from "lucide-react";

export default function SkillGapPage() {
  const [gapData, setGapData] = useState<any>(null);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (roleId?: string) => {
    if (roleId) setCalculating(true);
    else setLoading(true);

    try {
      const url = roleId ? `/api/student/skill-gap?roleId=${roleId}` : "/api/student/skill-gap";
      const [gapRes, profRes] = await Promise.all([fetch(url), fetch("/api/student/profile")]);

      const gapJson = await gapRes.json();
      const profJson = await profRes.json();

      if (gapJson.success) {
        setGapData(gapJson.data);
        setAvailableRoles(gapJson.availableRoles || []);
        setSelectedRoleId(gapJson.data.jobRoleId);
      }
      if (profJson.success) setProfile(profJson.profile);
    } catch (e) {
      console.error("Failed to load skill gap", e);
    } finally {
      setLoading(false);
      setCalculating(false);
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    loadData(roleId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Computing deterministic skill gap matrix...
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
        {/* Header & Role Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="h-4 w-4" />
              Rule-Based Mathematical Gap Engine
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Skill Gap & Industry Readiness Analysis
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Comparing your verified profile competencies against benchmark industry job role standards.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-2">
              Target Role:
            </span>
            <select
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50"
            >
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {calculating && (
          <div className="text-center py-2 text-xs font-semibold text-blue-600 animate-pulse">
            Recalculating match weights and recommendations...
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Match Rate Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overall Skill Match
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {gapData?.matchPercentage}%
                </span>
                <span className="text-sm font-medium text-slate-500">Weighted Match</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${gapData?.matchPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{gapData?.matchedCount} Matched</span>
              <span>{gapData?.proficiencyGapCount} Deficit</span>
              <span className="text-red-600 font-bold">{gapData?.missingCount} Missing</span>
            </div>
          </div>

          {/* Career Readiness Score */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Career Readiness Index
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <BarChart3 className="h-4 w-4" />
              </span>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {gapData?.careerReadinessScore}
                </span>
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${gapData?.careerReadinessScore}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Includes hackathon wins (15%), projects (20%), and internships (15%)
            </div>
          </div>

          {/* Priority Status Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Actionable Gap Urgency
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <div className="my-4 space-y-1.5">
              <div className="text-sm font-semibold text-slate-800">
                Target Role: <span className="text-blue-600">{gapData?.jobRoleTitle}</span>
              </div>
              <p className="text-xs text-slate-500">
                You have {gapData?.priorityGaps?.length} priority gap(s) to bridge to qualify for top-tier opportunities.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-700 bg-amber-50 rounded-lg p-2.5">
              Focus next on: {gapData?.priorityGaps?.[0]?.skillName || "None - Fully Matched!"}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown: Matched vs Deficit vs Missing */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Competency Breakdown for [{gapData?.jobRoleTitle}]
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched Skills */}
            <div className="rounded-2xl bg-white p-5 border border-emerald-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Matched Competencies
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">
                  {gapData?.matchedSkills?.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {gapData?.matchedSkills?.map((s: any) => (
                  <div key={s.skillId} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                      <span>{s.skillName}</span>
                      <span className="text-xs text-emerald-700 font-semibold">✓ Verified</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Required: {s.requiredProficiency} • Your Level: {s.studentProficiency}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proficiency Deficits */}
            <div className="rounded-2xl bg-white p-5 border border-amber-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Proficiency Deficits
                </div>
                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
                  {gapData?.proficiencyGapSkills?.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {gapData?.proficiencyGapSkills?.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">No proficiency deficits</div>
                ) : (
                  gapData?.proficiencyGapSkills?.map((s: any) => (
                    <div key={s.skillId} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                      <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                        <span>{s.skillName}</span>
                        <span className="text-xs text-amber-700 font-bold">{s.priority} Priority</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Required: <span className="font-semibold text-slate-800">{s.requiredProficiency}</span> • Current: {s.studentProficiency}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div className="rounded-2xl bg-white p-5 border border-red-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-red-800">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Missing Skills
                </div>
                <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs font-bold">
                  {gapData?.missingSkills?.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {gapData?.missingSkills?.map((s: any) => (
                  <div key={s.skillId} className="p-3 rounded-xl bg-red-50/40 border border-red-100">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                      <span>{s.skillName}</span>
                      <span className="text-xs text-red-700 font-bold uppercase">{s.importance}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Required Level: <span className="font-semibold text-slate-800">{s.requiredProficiency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Curated Courses for Gaps */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Learning Courses
              </h2>
            </div>

            <div className="space-y-3">
              {gapData?.recommendedResources?.map((r: any) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-sm transition group"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      <span>{r.provider}</span>
                      <span>•</span>
                      <span>Skill: {r.skillName}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{r.title}</div>
                    <div className="text-xs text-slate-500">
                      Level: {r.difficultyLevel} {r.durationHours ? `• ~${r.durationHours} hrs` : ""}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                </a>
              ))}
            </div>
          </div>

          {/* Recommended Projects */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <FolderGit2 className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Capstone Projects
              </h2>
            </div>

            <div className="space-y-3">
              {gapData?.recommendedProjects?.map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                    <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-800">
                      {p.difficultyLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                  <div className="text-xs font-medium text-slate-500">
                    Tech Stack: <span className="font-semibold text-slate-700">{p.keySkills}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Matched Industry Opportunities */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Matched Industry Opportunities
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Direct campus & partner openings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gapData?.industryOpportunities?.map((opp: any) => (
              <div
                key={opp.id}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-bold text-purple-800">
                      {opp.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {opp.matchScore}% Match
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                  <div className="text-xs text-slate-600 font-semibold">{opp.companyName}</div>
                  <div className="text-xs text-slate-500">
                    {opp.location} {opp.stipendOrSalary ? `• ${opp.stipendOrSalary}` : ""}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Applied to ${opp.title} at ${opp.companyName}! Profile shared.`)}
                  className="w-full rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-sm transition"
                >
                  Quick Apply with Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
