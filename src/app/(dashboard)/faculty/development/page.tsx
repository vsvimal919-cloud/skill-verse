"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  Filter,
  Flame,
  Lightbulb,
  X,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function FacultyDevelopmentPage() {
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<any>(null);
  const [developments, setDevelopments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalRecords: 0,
    totalDays: 0,
    totalHours: 0,
    totalCredits: 0,
    researchPapersCount: 0,
    nptelCount: 0,
  });

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Form State
  const [formData, setFormData] = useState({
    type: "FDP",
    title: "",
    organizer: "",
    startDate: "",
    endDate: "",
    durationDays: "5",
    scoreCreditPoints: "2.0",
    certUrl: "",
    publicationDoi: "",
    description: "",
    status: "COMPLETED",
  });

  useEffect(() => {
    loadDevelopments();
  }, [typeFilter]);

  const loadDevelopments = async () => {
    try {
      setLoading(true);
      const url =
        typeFilter === "ALL"
          ? "/api/faculty/development"
          : `/api/faculty/development?type=${typeFilter}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setFaculty(json.faculty);
        setDevelopments(json.developments || []);
        if (json.metrics) setMetrics(json.metrics);
      }
    } catch (e) {
      console.error("Failed to load development records", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (newType: string) => {
    let defaultDays = "5";
    let defaultCredits = "2.0";

    if (newType === "WORKSHOP") {
      defaultDays = "2";
      defaultCredits = "1.0";
    } else if (newType === "RESEARCH_PAPER") {
      defaultDays = "1";
      defaultCredits = "3.0";
    } else if (newType === "PATENT") {
      defaultDays = "1";
      defaultCredits = "4.0";
    } else if (newType === "NPTEL_SWAYAM") {
      defaultDays = "12";
      defaultCredits = "3.0";
    } else if (newType === "GUEST_LECTURE") {
      defaultDays = "1";
      defaultCredits = "1.0";
    }

    setFormData((prev) => ({
      ...prev,
      type: newType,
      durationDays: defaultDays,
      scoreCreditPoints: defaultCredits,
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.organizer || !formData.startDate) {
      setErrorMsg("Please fill in the title, organizer, and start date.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      const res = await fetch("/api/faculty/development", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        setIsModalOpen(false);
        // Reset form
        setFormData({
          type: "FDP",
          title: "",
          organizer: "",
          startDate: "",
          endDate: "",
          durationDays: "5",
          scoreCreditPoints: "2.0",
          certUrl: "",
          publicationDoi: "",
          description: "",
          status: "COMPLETED",
        });
        loadDevelopments();
      } else {
        setErrorMsg(json.error || "Failed to save record");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this development record?")) return;
    try {
      const res = await fetch(`/api/faculty/development?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        loadDevelopments();
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "FDP":
        return { label: "Faculty Dev Program", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "WORKSHOP":
        return { label: "Hands-on Workshop", bg: "bg-blue-100 text-blue-800 border-blue-300" };
      case "RESEARCH_PAPER":
        return { label: "Research Paper (Scopus/IEEE)", bg: "bg-purple-100 text-purple-800 border-purple-300" };
      case "PATENT":
        return { label: "Patent Filed / Published", bg: "bg-amber-100 text-amber-900 border-amber-300" };
      case "NPTEL_SWAYAM":
        return { label: "NPTEL / SWAYAM / Coursera", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" };
      case "GUEST_LECTURE":
        return { label: "Resource Person / Lecture", bg: "bg-rose-100 text-rose-800 border-rose-300" };
      default:
        return { label: type, bg: "bg-slate-100 text-slate-800 border-slate-300" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={{
          name: faculty?.user?.name || "Faculty Member",
          email: faculty?.user?.email || "",
          role: "ACADEMICIAN",
        }}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <GraduationCap className="h-4 w-4" />
              Faculty Continuous Professional Development (CPD)
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              My FDPs, Research & Upskilling
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track annual AICTE/UGC credit points, FDP certifications, Scopus/IEEE research publications, and NPTEL courses.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition self-start sm:self-center"
          >
            <Plus className="h-4 w-4" />
            Add FDP / Research Paper
          </button>
        </div>

        {/* Annual AICTE / UGC Credit Point Summary Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                AICTE / UGC Credits
              </span>
              <div className="text-3xl font-black mt-2 text-white">
                {metrics.totalCredits} <span className="text-base font-semibold text-emerald-300">pts</span>
              </div>
              <p className="text-xs text-emerald-200 mt-1 font-medium">
                Annual Appraisal Target: ≥ 10.0 pts
              </p>
            </div>
            <Flame className="absolute -bottom-4 -right-4 h-24 w-24 text-emerald-500/10" />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
              CPD Training Hours
            </span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {metrics.totalHours} <span className="text-base font-semibold text-slate-400">hrs</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Equivalent to {metrics.totalDays} full program days
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-purple-500" />
              Research & Patents
            </span>
            <div className="text-3xl font-black text-purple-900 mt-2">
              {metrics.researchPapersCount}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Scopus/UGC papers & patent disclosures
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-amber-500" />
              NPTEL / Certifications
            </span>
            <div className="text-3xl font-black text-amber-700 mt-2">
              {metrics.nptelCount}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              National & global online credentials
            </p>
          </div>
        </div>

        {/* Filter and Table Container */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Filter Activity Type:
              </span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All CPD Activities ({metrics.totalRecords})</option>
                <option value="FDP">Faculty Development Programs (FDP)</option>
                <option value="WORKSHOP">Hands-on Workshops</option>
                <option value="RESEARCH_PAPER">Research Papers & Publications</option>
                <option value="PATENT">Patents</option>
                <option value="NPTEL_SWAYAM">NPTEL / SWAYAM Courses</option>
                <option value="GUEST_LECTURE">Guest Lectures & Keynotes</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-semibold">
              Showing {developments.length} record{developments.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-semibold">Loading development portfolio...</p>
            </div>
          ) : developments.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No FDP or Research Records Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click &ldquo;Add FDP / Research Paper&rdquo; above to record your attended workshops, NPTEL courses, and published manuscripts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Activity & Title</th>
                    <th className="px-6 py-3.5">Host / Organizer</th>
                    <th className="px-6 py-3.5">Duration & Dates</th>
                    <th className="px-6 py-3.5 text-center">Credit Points</th>
                    <th className="px-6 py-3.5">Evidence / Links</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {developments.map((d) => {
                    const badge = getTypeBadge(d.type);
                    const formattedStart = d.startDate
                      ? new Date(d.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A";

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2.5">
                            <div>
                              <span
                                className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                              <h4 className="font-bold text-slate-900 mt-1 text-sm">{d.title}</h4>
                              {d.description && (
                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                  {d.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                            <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {d.organizer}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-700 font-semibold">{formattedStart}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {d.durationDays} Day{d.durationDays > 1 ? "s" : ""} ({d.durationDays * 6} hrs)
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-black text-emerald-800">
                            +{d.scoreCreditPoints} pts
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {d.certUrl && (
                              <a
                                href={d.certUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Certificate Doc
                              </a>
                            )}
                            {d.publicationDoi && (
                              <div className="text-[11px] text-purple-700 font-mono">
                                DOI: {d.publicationDoi}
                              </div>
                            )}
                            {!d.certUrl && !d.publicationDoi && (
                              <span className="text-xs text-slate-400 italic">Self-declared</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD FDP / RESEARCH PAPER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Record Faculty FDP / Research
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Activity Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
                >
                  <option value="FDP">Faculty Development Program (FDP - 1 to 2 Weeks)</option>
                  <option value="WORKSHOP">Hands-on Technical Workshop</option>
                  <option value="RESEARCH_PAPER">Research Publication (Scopus / IEEE / UGC CARE)</option>
                  <option value="PATENT">Patent Filed / Granted</option>
                  <option value="NPTEL_SWAYAM">NPTEL / SWAYAM / Coursera Course</option>
                  <option value="GUEST_LECTURE">Resource Person / Keynote Speaker</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Title of Program / Research Paper / Course *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AICTE ATAL FDP on Deep Learning or IEEE Trans. Paper Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Organizer / Journal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Host Institution / Sponsoring Body / Journal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT Madras, ATAL Academy, IEEE Xplore, NPTEL"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Dates & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    AICTE Credit Pts
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.scoreCreditPoints}
                    onChange={(e) => setFormData({ ...formData, scoreCreditPoints: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Proof / DOI Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Certificate / Proof URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or cert link"
                    value={formData.certUrl}
                    onChange={(e) => setFormData({ ...formData, certUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Publication DOI / Patent No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10.1109/ACCESS.2024.123456"
                    value={formData.publicationDoi}
                    onChange={(e) => setFormData({ ...formData, publicationDoi: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Key Learnings / Outcomes
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of tools acquired (e.g. PyTorch, Cloud Architecture) or research findings..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Save to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
