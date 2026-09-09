"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  UserCheck,
  Search,
  Download,
  CheckCircle2,
  Trophy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  BarChart3,
  BookOpen,
  GraduationCap,
  X,
  FileText,
} from "lucide-react";

export default function AcademicianDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Feedback form
  const [feedbackCategory, setFeedbackCategory] = useState("SKILL_DEVELOPMENT");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      const [studRes, meRes] = await Promise.all([
        fetch(`/api/academician/students?search=${encodeURIComponent(search)}`),
        fetch("/api/auth/me"),
      ]);

      const sJson = await studRes.json();
      const mJson = await meRes.json();

      if (sJson.success) setStudents(sJson.students);
      if (mJson.success) setUserProfile(mJson.user);
    } catch (e) {
      console.error("Failed to load faculty dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/academician/students/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedStudent(data.student);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifySkill = async (studentSkillId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/academician/students/${selectedStudent.id}/verify-skill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentSkillId,
          isVerified: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh selected student
        viewStudentDetails(selectedStudent.id);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComments) return;
    setSubmittingFeedback(true);

    try {
      const res = await fetch("/api/academician/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          category: feedbackCategory,
          comments: feedbackComments,
          rating: parseInt(feedbackRating),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackComments("");
        viewStudentDetails(selectedStudent.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const avgReadiness =
    students.length > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.careerReadinessScore || 0), 0) /
            students.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={{
          name: userProfile?.name || "Faculty",
          email: userProfile?.email || "",
          role: "ACADEMICIAN",
        }}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <UserCheck className="h-4 w-4" />
              Faculty Mentorship & Verification Portal
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Department Student Roster
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor student competency progression, endorse skill credentials, and export official dossiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, reg no..."
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Quick Dept Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Monitored Students
            </span>
            <div className="text-4xl font-black text-slate-900 mt-2">{students.length}</div>
            <span className="text-xs text-slate-400 mt-1 block">
              Department of Computer Science & Engineering
            </span>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Career Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-emerald-600">{avgReadiness}</span>
              <span className="text-sm font-medium text-slate-400">/ 100</span>
            </div>
            <span className="text-xs text-emerald-700 font-medium mt-1 block">
              Based on live hackathons & verified competencies
            </span>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reporting Standard
            </span>
            <div className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Word (.docx) & Dossier Exports
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Official institutional format with faculty signature blocks
            </span>
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Enrolled Students</h2>
            <span className="text-xs text-slate-500">{students.length} results</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Reg Number</th>
                  <th className="py-3 px-6">Sem / CGPA</th>
                  <th className="py-3 px-6">Target Role</th>
                  <th className="py-3 px-6">Readiness</th>
                  <th className="py-3 px-6">Competencies</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{s.user.name}</div>
                      <div className="text-xs text-slate-400">{s.user.email}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-700">
                      {s.registerNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">Sem {s.semester}</div>
                      <div className="text-xs text-emerald-600 font-bold">{s.cgpa} CGPA</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-800">
                        {s.targetRole?.title || "Data Analyst"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">
                          {s.careerReadinessScore}
                        </span>
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${s.careerReadinessScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div>{s._count.skills} skills</div>
                      <div className="text-amber-700 font-semibold">{s._count.achievements} hackathons</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewStudentDetails(s.id)}
                          className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                        >
                          Review & Verify
                        </button>
                        <a
                          href={`/api/academician/reports/${s.id}/docx`}
                          download
                          className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition flex items-center gap-1"
                          title="Download Word Dossier"
                        >
                          <Download className="h-3.5 w-3.5" />
                          DOCX
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student 360 Review Drawer / Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-3xl bg-white min-h-screen p-8 shadow-2xl space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Comprehensive Dossier Review
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedStudent.user.name}
                  </h2>
                  <div className="text-xs text-slate-500">
                    Reg: {selectedStudent.registerNumber} • CGPA: {selectedStudent.cgpa} • Batch {selectedStudent.batchYear}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`/api/academician/reports/${selectedStudent.id}/docx`}
                    download
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow transition"
                  >
                    <Download className="h-4 w-4" />
                    Download Official Dossier (.docx)
                  </a>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Skills Verification Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Student Skills & Faculty Endorsement
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedStudent.skills.map((sk: any) => (
                    <div
                      key={sk.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{sk.skill.name}</div>
                        <div className="text-xs text-slate-500">
                          {sk.proficiencyLevel} • {sk.yearsOfExperience} yrs
                        </div>
                      </div>

                      <button
                        onClick={() => handleVerifySkill(sk.id, sk.isVerified)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                          sk.isVerified
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {sk.isVerified ? "Verified" : "Verify"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hackathons & Achievements */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Hackathons & Competitions ({selectedStudent.achievements.length})
                </h3>
                <div className="space-y-3">
                  {selectedStudent.achievements.map((ach: any) => (
                    <div key={ach.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-slate-900">{ach.eventName}</div>
                        <span className="rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-xs font-black">
                          {ach.participationStatus}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {ach.organization} • {ach.prizeDetails} {ach.prizeAmount ? `(₹${ach.prizeAmount})` : ""}
                      </div>
                      <p className="text-xs text-slate-600">{ach.description}</p>
                      {(ach.certificateFile || ach.proofPhotoFile) && (
                        <div className="flex gap-3 pt-1">
                          {ach.certificateFile && (
                            <a
                              href={`/api/files/${ach.certificateFile.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 font-semibold underline flex items-center gap-1"
                            >
                              Certificate Doc ↗
                            </a>
                          )}
                          {ach.proofPhotoFile && (
                            <a
                              href={`/api/files/${ach.proofPhotoFile.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-600 font-semibold underline flex items-center gap-1"
                            >
                              Prize Photo Evidence ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentorship Feedback Form */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Add Faculty Mentorship Feedback
                </h3>
                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Category</label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                      >
                        <option value="SKILL_DEVELOPMENT">Skill Gap Development</option>
                        <option value="ACADEMIC">Academic Progress</option>
                        <option value="CAREER_GUIDANCE">Career & Placement Guidance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600">Rating (1-5)</label>
                      <select
                        value={feedbackRating}
                        onChange={(e) => setFeedbackRating(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                      >
                        <option value="5">5 - Excellent Potential</option>
                        <option value="4">4 - Good Progress</option>
                        <option value="3">3 - Needs Skill Improvement</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Provide constructive feedback for student dossier..."
                    className="block w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900"
                  />

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    {submittingFeedback ? "Submitting..." : "Post Official Remark"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
