"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Users,
  Building2,
  MapPin,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";

export default function IndustryDashboard() {
  const [postings, setPostings] = useState<any[]>([]);
  const [taxonomy, setTaxonomy] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab: 'POSTINGS' or 'TALENT_SEARCH'
  const [activeTab, setActiveTab] = useState<"POSTINGS" | "TALENT_SEARCH">("POSTINGS");

  // Post new role modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("JOB");
  const [location, setLocation] = useState("Bangalore (Hybrid)");
  const [locationType, setLocationType] = useState("HYBRID");
  const [stipendOrSalary, setStipendOrSalary] = useState("₹ 7.0 LPA - ₹ 9.0 LPA");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<{ skillId: string; importance: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Talent search states
  const [searchSkillIds, setSearchSkillIds] = useState<string[]>([]);
  const [minCgpa, setMinCgpa] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchingCandidates, setSearchingCandidates] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [postRes, taxRes, meRes] = await Promise.all([
        fetch("/api/industry/postings"),
        fetch("/api/skills/taxonomy"),
        fetch("/api/auth/me"),
      ]);

      const pJson = await postRes.json();
      const tJson = await taxRes.json();
      const mJson = await meRes.json();

      if (pJson.success) setPostings(pJson.postings);
      if (tJson.success) setTaxonomy(tJson.skills);
      if (mJson.success) setUserProfile(mJson.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/industry/postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          description,
          location,
          locationType,
          stipendOrSalary,
          skills: selectedSkills,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTitle("");
        setDescription("");
        setSelectedSkills([]);
        setModalOpen(false);
        loadInitialData();
      } else {
        alert(data.error || "Failed to create opening");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleSkillTag = (skillId: string) => {
    if (selectedSkills.some((s) => s.skillId === skillId)) {
      setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    } else {
      setSelectedSkills((prev) => [...prev, { skillId, importance: "MANDATORY" }]);
    }
  };

  const handleTalentSearch = async () => {
    setSearchingCandidates(true);
    try {
      const res = await fetch("/api/industry/talent-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillIds: searchSkillIds,
          minCgpa: minCgpa ? parseFloat(minCgpa) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCandidates(data.students);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingCandidates(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading employer console...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={{
          name: userProfile?.name || "Industry Partner",
          email: userProfile?.email || "",
          role: "INDUSTRY",
        }}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
              <Building2 className="h-4 w-4" />
              Corporate Partner Portal
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {userProfile?.industryProfile?.companyName || "Nexus Analytics"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Publish skill-benchmarked job postings and discover verified student talent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700 transition"
            >
              <Plus className="h-4 w-4" />
              Post Job / Internship
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("POSTINGS")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === "POSTINGS"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Active Openings ({postings.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("TALENT_SEARCH");
              if (candidates.length === 0) handleTalentSearch();
            }}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === "TALENT_SEARCH"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Skill-Matched Talent Discovery
          </button>
        </div>

        {/* Tab 1: Postings */}
        {activeTab === "POSTINGS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {postings.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 hover:border-slate-300 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-800 uppercase">
                      {p.type}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{p.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {p.location} ({p.locationType})
                    </div>
                  </div>

                  <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                    {p.stipendOrSalary || "Competitive"}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3">{p.description}</p>

                {/* Tagged skills */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Required Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.requirements?.map((req: any) => (
                      <span
                        key={req.id}
                        className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium"
                      >
                        {req.skill.name} ({req.minProficiency})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                  <span>Vacancies: {p.vacancies}</span>
                  <span className="font-bold text-purple-700">
                    {p._count?.applications || 0} Applicants
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Talent Search */}
        {activeTab === "TALENT_SEARCH" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-4 w-4 text-purple-600" />
                Filter Verified Student Talent by Competency
              </h2>

              <div className="flex flex-wrap gap-2">
                {taxonomy.slice(0, 15).map((sk) => {
                  const active = searchSkillIds.includes(sk.id);
                  return (
                    <button
                      key={sk.id}
                      onClick={() => {
                        if (active) setSearchSkillIds((p) => p.filter((x) => x !== sk.id));
                        else setSearchSkillIds((p) => [...p, sk.id]);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {sk.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    placeholder="e.g. 8.0"
                    className="mt-1 block rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                  />
                </div>

                <button
                  onClick={handleTalentSearch}
                  disabled={searchingCandidates}
                  className="mt-5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
                >
                  {searchingCandidates ? "Searching..." : "Apply Filters"}
                </button>
              </div>
            </div>

            {/* Candidates Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 hover:border-purple-300 transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{cand.name}</h3>
                      <div className="text-xs text-slate-500">
                        {cand.department} • CGPA: {cand.cgpa}
                      </div>
                    </div>
                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-black text-emerald-800">
                      {cand.matchPercent}% Match
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Verified Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cand.skills.map((s: any, idx: number) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-xs"
                        >
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-amber-800 font-semibold flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {cand.achievementsCount} Hackathons
                    </span>
                    <a
                      href={`/portfolio/${cand.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-600 font-bold hover:underline"
                    >
                      View Digital Portfolio ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Create Posting */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Post New Industry Opening</h2>

              <form onSubmit={handleCreatePosting} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700">Role Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Cloud Engineer"
                      className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700">Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    >
                      <option value="JOB">Full-Time Job</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700">Location *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Bangalore, Remote, etc."
                      className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700">Compensation</label>
                    <input
                      type="text"
                      value={stipendOrSalary}
                      onChange={(e) => setStipendOrSalary(e.target.value)}
                      placeholder="₹ 25,000 / month or ₹ 8 LPA"
                      className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700">Job Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe role responsibilities, tech stack, and ideal background..."
                    className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </div>

                {/* Skill selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Tag Required Skills (Click to toggle)
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                    {taxonomy.map((sk) => {
                      const selected = selectedSkills.some((s) => s.skillId === sk.id);
                      return (
                        <button
                          type="button"
                          key={sk.id}
                          onClick={() => toggleSkillTag(sk.id)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            selected
                              ? "bg-purple-600 text-white"
                              : "bg-white text-slate-700 border border-slate-200"
                          }`}
                        >
                          {sk.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-purple-600 px-6 py-2 text-sm font-bold text-white hover:bg-purple-700 shadow transition"
                  >
                    {saving ? "Publishing..." : "Publish Opening"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
