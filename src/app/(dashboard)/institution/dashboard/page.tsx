"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  BarChart3,
  CheckCircle2,
  Filter,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function InstitutionDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadInstitutionData();
  }, [selectedDeptId]);

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      const url = selectedDeptId
        ? `/api/institution/dashboard?departmentId=${selectedDeptId}`
        : "/api/institution/dashboard";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load institution data", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = (data?.students || []).filter((s: any) =>
    searchQuery
      ? s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registerNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={{
          name: "Institution Dean / Admin",
          email: "admin@apex.edu",
          role: "ADMIN",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                <Building2 className="h-3.5 w-3.5" />
                Tier 1: Central Institutional Management
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                {data?.institution?.name || "Apex Institute of Technology"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              3-Tier Hierarchy: Institution → Department → Student
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of all 6 engineering departments, faculty mentor allocation, and student career readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center min-w-[120px]">
              <div className="text-2xl font-bold text-blue-600">
                {data?.departmentStats?.length || 6}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Departments
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center min-w-[120px]">
              <div className="text-2xl font-bold text-emerald-600">
                {data?.students?.length || 0}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Students
              </div>
            </div>
          </div>
        </div>

        {/* Department Overview Cards (Tier 2) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Department Breakdown & Mentorship Coverage
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Department:</span>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All 6 Departments</option>
                {data?.departmentStats?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.departmentStats?.map((dept: any) => (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptId(selectedDeptId === dept.id ? "" : dept.id)}
                className={`cursor-pointer rounded-2xl border p-5 transition shadow-sm ${
                  selectedDeptId === dept.id
                    ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      {dept.code}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-2 text-base">{dept.name}</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {dept.studentCount} Students
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Faculty Mentors
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {dept.facultyCount} Assigned
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Avg Readiness
                    </span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {dept.avgReadinessScore}%
                    </span>
                  </div>
                </div>

                {dept.faculty?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Department Mentors:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.faculty.map((f: any) => (
                        <span
                          key={f.id}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {f.user?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Institution Skill Distribution */}
        {data?.skillDistribution?.length > 0 && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Institution-Wide Skill Distribution
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {data.skillDistribution.slice(0, 12).map((sk: any) => (
                <div
                  key={sk.name}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center"
                >
                  <div className="text-xs font-bold text-slate-700 truncate">{sk.name}</div>
                  <div className="mt-1 text-lg font-black text-blue-600">{sk.count}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{sk.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Roster with Mentor Mapping (Tier 3) */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Institutional Student Registry & Mentor Status
              </h2>
              <p className="text-xs text-slate-500">
                Verify students, their assigned department, and mapped faculty mentor.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students or register no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Register No</th>
                  <th className="px-6 py-3">Assigned Faculty Mentor</th>
                  <th className="px-6 py-3 text-center">Readiness</th>
                  <th className="px-6 py-3 text-right">Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {s.user?.name}
                      <div className="text-xs font-normal text-slate-400">{s.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {s.department?.name || "CSE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{s.registerNumber}</td>
                    <td className="px-6 py-4">
                      {s.mentor ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          {s.mentor.user?.name}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Mentor Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
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
    </div>
  );
}
