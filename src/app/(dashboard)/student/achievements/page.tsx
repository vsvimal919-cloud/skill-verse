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
  FileText,
  BookOpen,
  Video,
  Clock,
  Wrench,
  User,
  Filter,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentAchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter tab
  const [filterType, setFilterType] = useState<string>("ALL");

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("HACKATHON");
  const [organization, setOrganization] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [participationStatus, setParticipationStatus] = useState("WINNER");
  const [skillsUsed, setSkillsUsed] = useState("");
  const [description, setDescription] = useState("");

  // Category specific fields
  const [prizeDetails, setPrizeDetails] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [paperTitle, setPaperTitle] = useState("");
  const [conferenceName, setConferenceName] = useState("");
  const [publicationUrl, setPublicationUrl] = useState("");
  const [workshopDuration, setWorkshopDuration] = useState("");
  const [toolsLearned, setToolsLearned] = useState("");
  const [speakerName, setSpeakerName] = useState("");

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
          skillsUsed,
          description,
          certificateFileId,
          proofPhotoFileId,
          // Dynamic fields
          prizeDetails: eventType === "HACKATHON" ? prizeDetails : null,
          prizeAmount: eventType === "HACKATHON" ? prizeAmount : null,
          paperTitle: eventType === "PAPER_PRESENTATION" ? paperTitle : null,
          conferenceName: eventType === "PAPER_PRESENTATION" ? conferenceName : null,
          publicationUrl: eventType === "PAPER_PRESENTATION" ? publicationUrl : null,
          workshopDuration: eventType === "WORKSHOP" ? workshopDuration : null,
          toolsLearned: eventType === "WORKSHOP" ? toolsLearned : null,
          speakerName: eventType === "WEBINAR" ? speakerName : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const primarySkill = (skillsUsed || "Python").split(/[,;]/)[0].trim() || "Python";
        const savedAchievementId = data.achievement.id;
        const currentEventName = eventName;

        // Reset form
        setEventName("");
        setOrganization("");
        setEventDate("");
        setPrizeDetails("");
        setPrizeAmount("");
        setPaperTitle("");
        setConferenceName("");
        setPublicationUrl("");
        setWorkshopDuration("");
        setToolsLearned("");
        setSpeakerName("");
        setSkillsUsed("");
        setDescription("");
        setCertFile(null);
        setPhotoFile(null);
        setFormOpen(false);

        // Redirect to assessment verification quiz
        router.push(
          `/student/assessment?skill=${encodeURIComponent(primarySkill)}&achievementId=${savedAchievementId}&name=${encodeURIComponent(currentEventName)}`
        );
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

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case "HACKATHON":
        return {
          label: "Hackathon",
          bg: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Trophy,
        };
      case "PAPER_PRESENTATION":
        return {
          label: "Paper Presentation",
          bg: "bg-blue-100 text-blue-800 border-blue-200",
          icon: FileText,
        };
      case "WORKSHOP":
        return {
          label: "Workshop / Bootcamp",
          bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: BookOpen,
        };
      case "WEBINAR":
        return {
          label: "Webinar",
          bg: "bg-rose-100 text-rose-800 border-rose-200",
          icon: Video,
        };
      default:
        return {
          label: type.replace("_", " "),
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          icon: Award,
        };
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filterType === "ALL") return true;
    return a.eventType === filterType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading achievements and events...
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
              Achievements & Events
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Showcase your hackathon wins, research paper presentations, technical workshops, and industry webinars.
            </p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            {formOpen ? "Cancel" : "Log Event / Achievement"}
          </button>
        </div>

        {/* Dynamic Entry Form */}
        {formOpen && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-blue-100 space-y-5 animate-in fade-in duration-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Log New Academic or Competitive Event
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder={
                      eventType === "HACKATHON"
                        ? "e.g. Smart India Hackathon 2026 (Grand Finale)"
                        : eventType === "PAPER_PRESENTATION"
                        ? "e.g. IEEE International Conference on AI & IoT"
                        : eventType === "WORKSHOP"
                        ? "e.g. Kubernetes & Cloud-Native Bootcamp"
                        : "e.g. Future of Generative AI & LLMs in Production"
                    }
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event Category *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-semibold text-blue-900"
                  >
                    <option value="HACKATHON">🏆 Hackathon</option>
                    <option value="PAPER_PRESENTATION">📄 Paper Presentation</option>
                    <option value="WORKSHOP">🛠️ Workshop / Bootcamp</option>
                    <option value="WEBINAR">🎙️ Webinar</option>
                  </select>
                </div>
              </div>

              {/* Host Organization, Date & Status */}
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
                    placeholder="e.g. IIT Madras / IEEE / AICTE"
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
                    <option value="PARTICIPANT">Participant / Attendee</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC FIELDS: 1. HACKATHON */}
              {eventType === "HACKATHON" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-900">
                      Prize Details / Trophy Title
                    </label>
                    <input
                      type="text"
                      value={prizeDetails}
                      onChange={(e) => setPrizeDetails(e.target.value)}
                      placeholder="e.g. 1st Place Gold Trophy & Memento"
                      className="mt-1 block w-full rounded-xl border border-purple-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-900">
                      Prize Cash Award (₹)
                    </label>
                    <input
                      type="number"
                      value={prizeAmount}
                      onChange={(e) => setPrizeAmount(e.target.value)}
                      placeholder="50000"
                      className="mt-1 block w-full rounded-xl border border-purple-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: 2. PAPER PRESENTATION */}
              {eventType === "PAPER_PRESENTATION" && (
                <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-blue-900">
                        Paper Title *
                      </label>
                      <input
                        type="text"
                        value={paperTitle}
                        onChange={(e) => setPaperTitle(e.target.value)}
                        placeholder="e.g. Optimized Deep Neural Networks for Edge Devices"
                        className="mt-1 block w-full rounded-xl border border-blue-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-blue-900">
                        Conference / Journal Name
                      </label>
                      <input
                        type="text"
                        value={conferenceName}
                        onChange={(e) => setConferenceName(e.target.value)}
                        placeholder="e.g. IEEE Transactions / Springer Scopus"
                        className="mt-1 block w-full rounded-xl border border-blue-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-900">
                      Publication / DOI Link (URL)
                    </label>
                    <input
                      type="url"
                      value={publicationUrl}
                      onChange={(e) => setPublicationUrl(e.target.value)}
                      placeholder="https://ieeexplore.ieee.org/document/..."
                      className="mt-1 block w-full rounded-xl border border-blue-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: 3. WORKSHOP / BOOTCAMP */}
              {eventType === "WORKSHOP" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Workshop Duration
                    </label>
                    <input
                      type="text"
                      value={workshopDuration}
                      onChange={(e) => setWorkshopDuration(e.target.value)}
                      placeholder="e.g. 3 Days Intensive (24 Hours)"
                      className="mt-1 block w-full rounded-xl border border-emerald-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Tools & Frameworks Hands-On
                    </label>
                    <input
                      type="text"
                      value={toolsLearned}
                      onChange={(e) => setToolsLearned(e.target.value)}
                      placeholder="e.g. Docker, Kubernetes, Helm, CI/CD"
                      className="mt-1 block w-full rounded-xl border border-emerald-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: 4. WEBINAR */}
              {eventType === "WEBINAR" && (
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-rose-900">
                    Guest Speaker / Industry Host Name
                  </label>
                  <input
                    type="text"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    placeholder="e.g. Dr. Andrew Ng (Founder, DeepLearning.AI)"
                    className="mt-1 block w-full rounded-xl border border-rose-200 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Skills Used */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Primary Skills Demonstrated (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={skillsUsed}
                  onChange={(e) => setSkillsUsed(e.target.value)}
                  placeholder="e.g. Python, SQL, React, Machine Learning, Cloud"
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description & Key Takeaways *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize your role, project, research findings, or learnings..."
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Proof Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    Certificate / Attendance Document
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
                    Event Photo / Evidence
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
                  {uploadingFiles ? "Uploading Proof..." : saving ? "Saving Record..." : "Save & Verify via Quiz"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Category:
          </span>
          {[
            { id: "ALL", label: `All (${achievements.length})` },
            {
              id: "HACKATHON",
              label: `🏆 Hackathons (${achievements.filter((a) => a.eventType === "HACKATHON").length})`,
            },
            {
              id: "PAPER_PRESENTATION",
              label: `📄 Paper Presentations (${achievements.filter((a) => a.eventType === "PAPER_PRESENTATION").length})`,
            },
            {
              id: "WORKSHOP",
              label: `🛠️ Workshops (${achievements.filter((a) => a.eventType === "WORKSHOP").length})`,
            },
            {
              id: "WEBINAR",
              label: `🎙️ Webinars (${achievements.filter((a) => a.eventType === "WEBINAR").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                filterType === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        <div className="space-y-6">
          {filteredAchievements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
              <Award className="mx-auto h-10 w-10 mb-2 opacity-60" />
              <p className="text-sm font-semibold">No records found for this category</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &ldquo;Log Event / Achievement&rdquo; above to add your first entry.
              </p>
            </div>
          ) : (
            filteredAchievements.map((item) => {
              const catBadge = getCategoryBadge(item.eventType);
              const CatIcon = catBadge.icon;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 hover:border-slate-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${catBadge.bg}`}
                        >
                          <CatIcon className="h-3.5 w-3.5" />
                          {catBadge.label}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${getStatusBadge(
                            item.participationStatus
                          )}`}
                        >
                          <Trophy className="h-3 w-3" />
                          {item.participationStatus}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                            item.isVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {item.isVerified ? "✓ Verified Proof" : "Unverified"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 pt-1">{item.eventName}</h3>
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
                      {!item.isVerified && (
                        <Link
                          href={`/student/assessment?skill=${encodeURIComponent(
                            (item.skillsUsed || "Python").split(/[,;]/)[0].trim() || "Python"
                          )}&achievementId=${item.id}&name=${encodeURIComponent(item.eventName)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-bold transition shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Verify via Quiz ↗
                        </Link>
                      )}
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

                  {/* Dynamic Category Badges & Details */}
                  {item.eventType === "HACKATHON" && item.prizeDetails && (
                    <div className="text-sm font-semibold text-purple-900 bg-purple-50/60 border border-purple-200/60 rounded-xl px-3.5 py-1.5 inline-block">
                      🏆 Prize: {item.prizeDetails}
                    </div>
                  )}

                  {item.eventType === "PAPER_PRESENTATION" && (item.paperTitle || item.conferenceName) && (
                    <div className="rounded-xl bg-blue-50/60 border border-blue-200/60 p-3 text-xs space-y-1">
                      {item.paperTitle && (
                        <div className="font-bold text-blue-900">
                          📄 Paper: {item.paperTitle}
                        </div>
                      )}
                      {item.conferenceName && (
                        <div className="text-blue-700">
                          🏛️ Conference: {item.conferenceName}
                        </div>
                      )}
                      {item.publicationUrl && (
                        <div>
                          <a
                            href={item.publicationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Published Article
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {item.eventType === "WORKSHOP" && (item.workshopDuration || item.toolsLearned) && (
                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/60 p-3 text-xs flex flex-wrap gap-4 text-emerald-900 font-semibold">
                      {item.workshopDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-emerald-600" />
                          Duration: {item.workshopDuration}
                        </div>
                      )}
                      {item.toolsLearned && (
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3.5 w-3.5 text-emerald-600" />
                          Tools: {item.toolsLearned}
                        </div>
                      )}
                    </div>
                  )}

                  {item.eventType === "WEBINAR" && item.speakerName && (
                    <div className="rounded-xl bg-rose-50/60 border border-rose-200/60 p-3 text-xs text-rose-900 font-semibold flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-rose-600" />
                      Guest Speaker: {item.speakerName}
                    </div>
                  )}

                  <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>

                  {item.skillsUsed && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.skillsUsed.split(/[,;]/).map((s: string, idx: number) => (
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
                          View Event Photo Evidence
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
