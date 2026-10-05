"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  User,
  Building2,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function StudentSettingsPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [semester, setSemester] = useState<number>(6);
  const [cgpa, setCgpa] = useState<number>(8.5);
  const [bio, setBio] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, deptRes] = await Promise.all([
        fetch("/api/student/profile"),
        fetch("/api/departments"),
      ]);

      const profJson = await profileRes.json();
      const deptJson = await deptRes.json();

      if (deptJson.success) {
        setDepartments(deptJson.departments || []);
      }

      if (profJson.success && profJson.profile) {
        const p = profJson.profile;
        setUserProfile(p);
        setSelectedDeptId(p.departmentId || "");
        setSelectedMentorId(p.mentorId || "");
        setSemester(p.semester || 6);
        setCgpa(p.cgpa || 8.0);
        setBio(p.bio || "");
        setPhone(p.phone || "");
      }
    } catch (err: any) {
      console.error("Failed to load settings data:", err);
      setErrorMsg("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const currentDepartment = departments.find((d) => d.id === selectedDeptId);
  const availableMentors = currentDepartment?.faculty || [];
  const selectedMentor = availableMentors.find(
    (f: any) => f.id === selectedMentorId
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          mentorId: selectedMentorId || null,
          semester: Number(semester),
          cgpa: Number(cgpa),
          bio,
          phone,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setUserProfile(json.profile);
        setSuccessMsg("Academic settings & faculty mentor updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(json.error || "Failed to save profile changes.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={
          userProfile?.user
            ? {
                name: userProfile.user.name,
                email: userProfile.user.email,
                role: "STUDENT",
                profileId: userProfile.id,
              }
            : null
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Academic Onboarding & Department Settings
              </h1>
              <p className="text-sm text-slate-500">
                Configure your 3-Tier Hierarchy: Institution → Department → Faculty Mentor
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-sm font-medium">Loading department & mentor options...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 Cols: Form */}
            <form onSubmit={handleSave} className="space-y-6 lg:col-span-2">
              {/* Institution Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Tier 1: Institution Details
                </h2>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Enrolled Institution
                    </span>
                    <p className="font-bold text-slate-900 text-base">
                      {userProfile?.institution?.name || "Apex Institute of Technology"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Institution
                  </span>
                </div>
              </div>

              {/* Department & Mentor Selection */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  Tier 2 & 3: Department & Faculty Mentor
                </h2>

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Academic Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setSelectedMentorId(""); // Reset mentor when department changes
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select your Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Supports CSE, IT, AI & DS, ECE, EEE, and Mechanical Engineering.
                  </p>
                </div>

                {/* Faculty Mentor Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Faculty Mentor / Academic Advisor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    disabled={!selectedDeptId}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {selectedDeptId
                        ? availableMentors.length > 0
                          ? "Select a faculty mentor"
                          : "No faculty currently assigned to this department"
                        : "Select a department first"}
                    </option>
                    {availableMentors.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.user?.name} — {m.designation || "Faculty Advisor"} ({m.user?.email})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Your assigned mentor reviews your achievements and provides personalized feedback.
                  </p>
                </div>
              </div>

              {/* Academic Progress */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-700" />
                  Student Academic Progress
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Current Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      CGPA (Cumulative)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Student Bio / Career Aspirations
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your faculty mentor and recruiters about your engineering journey..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving Changes..." : "Save Settings"}
                </button>
              </div>
            </form>

            {/* Right Col: Mentor Card & Hierarchy Preview */}
            <div className="space-y-6">
              {/* Active Mentor Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Assigned Faculty Mentor
                </h3>

                {selectedMentor || userProfile?.mentor ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-500/20">
                        {(selectedMentor?.user?.name || userProfile?.mentor?.user?.name || "F")[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {selectedMentor?.user?.name || userProfile?.mentor?.user?.name}
                        </h4>
                        <p className="text-xs text-indigo-700 font-medium">
                          {selectedMentor?.designation || userProfile?.mentor?.designation || "Faculty Mentor"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-indigo-100 text-xs text-slate-600 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-indigo-500" />
                        <span>
                          {selectedMentor?.user?.email || userProfile?.mentor?.user?.email}
                        </span>
                      </div>
                      {(selectedMentor?.specialization || userProfile?.mentor?.specialization) && (
                        <div className="flex items-center gap-2">
                          <Award className="h-3.5 w-3.5 text-indigo-500" />
                          <span>
                            {selectedMentor?.specialization || userProfile?.mentor?.specialization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                    <User className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-xs font-medium">No faculty mentor mapped yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Select your department and choose a faculty advisor.
                    </p>
                  </div>
                )}
              </div>

              {/* Hierarchy Tree Visual */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Your 3-Tier Hierarchy
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200/60">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      1
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase text-slate-400">
                        Institution
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {userProfile?.institution?.name || "Apex Institute of Technology"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200/60 ml-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      2
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase text-slate-400">
                        Department
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {currentDepartment?.name || userProfile?.department?.name || "Select Department"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 border border-blue-200 ml-8">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                      3
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase text-blue-600 font-bold">
                        Student (You)
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {userProfile?.user?.name} ({userProfile?.registerNumber || "Enrolled"})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
