"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from "lucide-react";

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState<"MENTEES" | "DEPARTMENT">("MENTEES");
  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  const [mentees, setMentees] = useState<any[]>([]);
  const [deptStudents, setDeptStudents] = useState<any[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<any[]>([]);
  const [unverifiedAchievements, setUnverifiedAchievements] = useState<any[]>([]);

  const [searchFilter, setSearchFilter] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>("");

  useEffect(() => {
    loadDashboardData();
  }, [selectedDeptId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const url = selectedDeptId
        ? `/api/faculty/dashboard?departmentId=${selectedDeptId}`
        : "/api/faculty/dashboard";
      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setFacultyProfile(json.facultyProfile);
        setDepartments(json.departments || []);
        setMentees(json.mentees || []);
        setDeptStudents(json.deptStudents || []);
        setSkillDistribution(json.skillDistribution || []);
        setUnverifiedAchievements(json.unverifiedAchievements || []);

        if (!selectedDeptId && json.facultyProfile?.departmentId) {
          setSelectedDeptId(json.facultyProfile.departmentId);
        }
      }
    } catch (err) {
      console.error("Failed to load faculty dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAchievement = async (achievementId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setProcessingId(achievementId);
      setActionMessage("");
      const res = await fetch("/api/faculty/achievements/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId, status }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(
          status === "APPROVED"
            ? "Achievement successfully verified and credited!"
            : "Achievement rejected."
        );
        // Refresh data
        loadDashboardData();
        setTimeout(() => setActionMessage(""), 4000);
      }
    } catch (err) {
      console.error("Verification failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredMentees = mentees.filter((m) =>
    searchFilter
      ? m.user?.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.registerNumber?.toLowerCase().includes(searchFilter.toLowerCase())
      : true
  );

  const filteredDeptStudents = deptStudents.filter((s) =>
    searchFilter
      ? s.user?.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.registerNumber?.toLowerCase().includes(searchFilter.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={
          facultyProfile?.user
            ? {
                name: facultyProfile.user.name,
                email: facultyProfile.user.email,
                role: "ACADEMICIAN",
              }
            : null
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <GraduationCap className="h-3.5 w-3.5" />
                Faculty & Department Portal
              </span>
              {facultyProfile?.department && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  {facultyProfile.department.name} ({facultyProfile.department.code})
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Faculty Mentorship & Department View
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your direct mentees, verify credentials, and monitor department-wide career readiness scores.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center min-w-[110px]">
              <div className="text-2xl font-bold text-indigo-600">{mentees.length}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                My Mentees
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center min-w-[110px]">
              <div className="text-2xl font-bold text-amber-600">
                {unverifiedAchievements.length}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pending Proofs
              </div>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            {actionMessage}
          </div>
        )}

        {/* Tab Buttons & Department Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("MENTEES")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === "MENTEES"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Users className="h-4 w-4" />
              My Mentees ({mentees.length})
            </button>
            <button
              onClick={() => setActiveTab("DEPARTMENT")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === "DEPARTMENT"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Layers className="h-4 w-4" />
              Department View ({deptStudents.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Department Filter dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Filter Dept:</span>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All / Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-48 sm:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-sm font-medium">Loading department & mentee data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: MY MENTEES VIEW */}
            {activeTab === "MENTEES" && (
              <div className="space-y-8">
                {/* Pending Verification Requests for Mentees */}
                {unverifiedAchievements.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-600" />
                        <h2 className="text-base font-bold text-slate-900">
                          Unverified Certificates & Achievements Awaiting Review
                        </h2>
                      </div>
                      <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                        {unverifiedAchievements.length} Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unverifiedAchievements.map((ach) => (
                        <div
                          key={ach.id}
                          className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                                  {ach.eventType}
                                </span>
                                <h3 className="font-bold text-slate-900 mt-1">{ach.eventName}</h3>
                                <p className="text-xs text-slate-500">{ach.organization}</p>
                              </div>
                              <span className="text-xs font-semibold text-slate-400">
                                {ach.student?.user?.name}
                              </span>
                            </div>

                            {ach.description && (
                              <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                                {ach.description}
                              </p>
                            )}

                            {ach.certificateUrl && (
                              <div className="mt-2">
                                <a
                                  href={ach.certificateUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View Submitted Proof Document
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerifyAchievement(ach.id, "REJECTED")}
                              disabled={processingId === ach.id}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleVerifyAchievement(ach.id, "APPROVED")}
                              disabled={processingId === ach.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {processingId === ach.id ? "Verifying..." : "Approve & Verify"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentee List Table */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Directly Assigned Mentees</h2>
                    <p className="text-xs text-slate-500">
                      Students who have selected you as their official Faculty Mentor.
                    </p>
                  </div>

                  {filteredMentees.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Users className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm font-medium">No mentees found matching criteria</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredMentees.map((m) => (
                        <div key={m.id} className="p-6 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg">
                              {(m.user?.name || "S")[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base">{m.user?.name}</h3>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                  {m.registerNumber}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {m.department?.name} • Semester {m.semester} • CGPA: {m.cgpa || "N/A"}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {m.skills?.slice(0, 4).map((s: any) => (
                                  <span
                                    key={s.id}
                                    className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100"
                                  >
                                    {s.skill?.name}
                                  </span>
                                ))}
                                {m.skills?.length > 4 && (
                                  <span className="text-[11px] font-semibold text-slate-400 self-center">
                                    +{m.skills.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 self-end md:self-center">
                            <div className="text-right">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Career Readiness
                              </span>
                              <div className="text-xl font-black text-indigo-600">
                                {m.careerReadinessScore ? `${m.careerReadinessScore}%` : "65.0%"}
                              </div>
                            </div>

                            <a
                              href={`/portfolio/${m.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                            >
                              Portfolio
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DEPARTMENT VIEW */}
            {activeTab === "DEPARTMENT" && (
              <div className="space-y-8">
                {/* Skill Distribution Across Department */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      Department Skill Distribution
                    </h2>
                    <span className="text-xs text-slate-400">
                      Aggregated across {deptStudents.length} students
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {skillDistribution.slice(0, 12).map((sk) => (
                      <div
                        key={sk.name}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center"
                      >
                        <div className="text-xs font-bold text-slate-700 truncate">{sk.name}</div>
                        <div className="mt-1 text-lg font-black text-indigo-600">{sk.count}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{sk.category}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Department Student Roster */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">
                      Department Student Roster
                    </h2>
                    <p className="text-xs text-slate-500">
                      Filter and review all enrolled students and mentor mappings in this department.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3">Student Name</th>
                          <th className="px-6 py-3">Register No</th>
                          <th className="px-6 py-3">Target Role</th>
                          <th className="px-6 py-3">Assigned Mentor</th>
                          <th className="px-6 py-3 text-center">Readiness Score</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDeptStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-6 py-4 font-bold text-slate-900">
                              {s.user?.name}
                              <div className="text-xs font-normal text-slate-400">{s.user?.email}</div>
                            </td>
                            <td className="px-6 py-4 font-medium">{s.registerNumber}</td>
                            <td className="px-6 py-4">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {s.targetRole?.title || "Data Analyst"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {s.mentor ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  {s.mentor.user?.name}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-slate-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
                                {s.careerReadinessScore ? `${s.careerReadinessScore}%` : "65.0%"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <a
                                href={`/portfolio/${s.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                              >
                                View ↗
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
