"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Award,
  Plus,
  Trash2,
  Trophy,
  Calendar,
  Building2,
  FileCheck,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function StudentAchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("HACKATHON");
  const [organization, setOrganization] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [participationStatus, setParticipationStatus] = useState("WINNER");
  const [prizeDetails, setPrizeDetails] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [skillsUsed, setSkillsUsed] = useState("");
  const [description, setDescription] = useState("");

  // File upload states
  const [certFile, setCertFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achRes, profRes] = await Promise.all([
        fetch("/api/student/achievements"),
        fetch("/api/student/profile"),
      ]);

      const aJson = await achRes.json();
      const pJson = await profRes.json();

      if (aJson.success) setAchievements(aJson.achievements);
      if (pJson.success) setProfile(pJson.profile);
    } catch (e) {
      console.error("Failed to load achievements", e);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileHelper = async (file: File, type: "CERTIFICATE" | "ACHIEVEMENT_PHOTO") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", type);
    formData.append("isPublic", type === "ACHIEVEMENT_PHOTO" ? "true" : "false");

    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "File upload failed");
    return data.file.fileId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let certificateFileId = null;
      let proofPhotoFileId = null;

      if (certFile || photoFile) {
        setUploadingFiles(true);
        if (certFile) {
          certificateFileId = await uploadFileHelper(certFile, "CERTIFICATE");
        }
        if (photoFile) {
          proofPhotoFileId = await uploadFileHelper(photoFile, "ACHIEVEMENT_PHOTO");
        }
        setUploadingFiles(false);
      }

      const res = await fetch("/api/student/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventType,
          organization,
          eventDate,
          participationStatus,
          prizeDetails,
          prizeAmount,
          skillsUsed,
          description,
          certificateFileId,
          proofPhotoFileId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Reset form
        setEventName("");
        setOrganization("");
        setEventDate("");
        setPrizeDetails("");
        setPrizeAmount("");
        setSkillsUsed("");
        setDescription("");
        setCertFile(null);
        setPhotoFile(null);
        setFormOpen(false);
        loadData();
      } else {
        alert(data.error || "Failed to save achievement");
      }
    } catch (err: any) {
      alert(err.message || "Error submitting achievement");
    } finally {
      setSaving(false);
      setUploadingFiles(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this achievement record?")) return;
    try {
      const res = await fetch(`/api/student/achievements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAchievements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WINNER":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "RUNNER_UP":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case "FINALIST":
        return "bg-blue-100 text-blue-900 border-blue-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading achievements and awards...
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Hackathons, Events & Prize Evidence
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Showcase competitive hackathon wins, prizes, and certificates with verified photo proofs.
            </p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            {formOpen ? "Cancel" : "Log Event / Hackathon"}
          </button>
        </div>

        {/* Add Achievement Form */}
        {formOpen && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-blue-100 space-y-5 animate-in fade-in duration-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Add Hackathon or Competition Record
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event / Hackathon Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Smart India Hackathon 2026 (Grand Finale)"
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event Type *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="HACKATHON">Hackathon</option>
                    <option value="CODING_COMPETITION">Coding Competition</option>
                    <option value="PAPER_PRESENTATION">Paper Presentation</option>
                    <option value="PROJECT_EXPO">Project Expo / Showcase</option>
                    <option value="OTHER">Other Tech Symposium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Host Organization / College *
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. IIT Bombay / AICTE"
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Participation Status *
                  </label>
                  <select
                    value={participationStatus}
                    onChange={(e) => setParticipationStatus(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="WINNER">Winner (1st Place)</option>
                    <option value="RUNNER_UP">Runner-Up (2nd/3rd Place)</option>
                    <option value="FINALIST">Finalist</option>
                    <option value="PARTICIPANT">Participant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Prize Details (if applicable)
                  </label>
                  <input
                    type="text"
                    value={prizeDetails}
                    onChange={(e) => setPrizeDetails(e.target.value)}
                    placeholder="e.g. 1st Place Gold Trophy & Memento"
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Prize Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={prizeAmount}
                    onChange={(e) => setPrizeAmount(e.target.value)}
                    placeholder="50000"
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Skills Used (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsUsed}
                  onChange={(e) => setSkillsUsed(e.target.value)}
                  placeholder="e.g. Python, FastApi, PostgreSQL, React, Machine Learning"
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description of Project & Contribution *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what problem you tackled, your role, and the technical architecture..."
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    Certificate Document (PDF/Image)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-emerald-600" />
                    Prize / Winning Photo Proof
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingFiles}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadingFiles ? "Uploading Proof..." : saving ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Achievements List */}
        <div className="space-y-6">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 hover:border-slate-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${getStatusBadge(
                        item.participationStatus
                      )}`}
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      {item.participationStatus}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {item.eventType.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.eventName}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {item.organization}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(item.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.prizeAmount && (
                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm font-black text-emerald-800">
                      ₹ {item.prizeAmount.toLocaleString("en-IN")}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete record"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {item.prizeDetails && (
                <div className="text-sm font-semibold text-amber-800 bg-amber-50/60 border border-amber-200/60 rounded-xl px-3.5 py-1.5 inline-block">
                  Prize: {item.prizeDetails}
                </div>
              )}

              <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>

              {item.skillsUsed && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.skillsUsed.split(",").map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Evidence attachments */}
              {(item.certificateFile || item.proofPhotoFile) && (
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
                  {item.certificateFile && (
                    <a
                      href={`/api/files/${item.certificateFile.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      View Certificate ({item.certificateFile.originalFilename})
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {item.proofPhotoFile && (
                    <a
                      href={`/api/files/${item.proofPhotoFile.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      View Winning Photo Evidence
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
