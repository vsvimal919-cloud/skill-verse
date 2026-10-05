"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Code2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Brain,
  MessageSquare,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentSkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<any[]>([]);
  const [taxonomy, setTaxonomy] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [customSkillName, setCustomSkillName] = useState("");
  const [category, setCategory] = useState("TECHNICAL");
  const [proficiencyLevel, setProficiencyLevel] = useState("INTERMEDIATE");
  const [yearsOfExperience, setYearsOfExperience] = useState("1.0");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const [skillsRes, taxRes, profRes] = await Promise.all([
        fetch("/api/student/skills"),
        fetch("/api/skills/taxonomy"),
        fetch("/api/student/profile"),
      ]);

      const sJson = await skillsRes.json();
      const tJson = await taxRes.json();
      const pJson = await profRes.json();

      if (sJson.success) setSkills(sJson.skills);
      if (tJson.success) setTaxonomy(tJson.skills);
      if (pJson.success) setProfile(pJson.profile);
    } catch (e) {
      console.error("Failed to load skills", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/student/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: selectedSkillId || undefined,
          skillName: customSkillName || undefined,
          category,
          proficiencyLevel,
          yearsOfExperience: parseFloat(yearsOfExperience),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const addedSkillName = data.studentSkill?.skill?.name || customSkillName || "Skill";
        const addedSkillId = data.studentSkill?.skill?.id || "";

        setSelectedSkillId("");
        setCustomSkillName("");
        setFormOpen(false);

        // Redirect directly to verification test workflow
        router.push(
          `/student/assessment?skill=${encodeURIComponent(addedSkillName)}&skillId=${addedSkillId}`
        );
      } else {
        alert(data.error || "Failed to add skill");
      }
    } catch (err) {
      console.error("Add skill error", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Are you sure you want to remove this skill?")) return;
    try {
      const res = await fetch(`/api/student/skills/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const technicalSkills = skills.filter((s) => s.skill.category === "TECHNICAL");
  const softSkills = skills.filter((s) => s.skill.category === "SOFT");
  const aptitudeSkills = skills.filter((s) => s.skill.category === "APTITUDE");

  const getLevelColor = (level: string) => {
    switch (level) {
      case "EXPERT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADVANCED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "INTERMEDIATE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading verified skills...
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
              Skills Inventory & Proficiency
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Document your technical, soft, and aptitude competencies for automated gap matching.
            </p>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            {formOpen ? "Cancel" : "Add Competency"}
          </button>
        </div>

        {/* Add Skill Panel */}
        {formOpen && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-blue-100 space-y-5 animate-in fade-in duration-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Add Skill or Certification Competency
            </h2>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Standard Skill
                  </label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) => {
                      setSelectedSkillId(e.target.value);
                      if (e.target.value) setCustomSkillName("");
                    }}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">-- Choose from standard catalog --</option>
                    {taxonomy.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Or Enter Custom Skill
                  </label>
                  <input
                    type="text"
                    value={customSkillName}
                    disabled={Boolean(selectedSkillId)}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    placeholder="e.g. FastAPI, OpenCV"
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="TECHNICAL">Technical Skill</option>
                    <option value="SOFT">Soft Skill</option>
                    <option value="APTITUDE">Aptitude Competency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Self-Assessed Proficiency
                  </label>
                  <select
                    value={proficiencyLevel}
                    onChange={(e) => setProficiencyLevel(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner (Foundational)</option>
                    <option value="INTERMEDIATE">Intermediate (Independent Projects)</option>
                    <option value="ADVANCED">Advanced (Production / Competitions)</option>
                    <option value="EXPERT">Expert (Mastery / Research)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Years of Practical Experience
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
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
                  disabled={saving || (!selectedSkillId && !customSkillName)}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add to Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Section 1: Technical Skills */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Technical Skills</h2>
            <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-bold">
              {technicalSkills.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicalSkills.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.skill.name}</span>
                    {item.isVerified ? (
                      <span
                        title="Verified Skill"
                        className="inline-flex items-center text-emerald-600"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    ) : (
                      <Link
                        href={`/student/assessment?skill=${encodeURIComponent(item.skill.name)}&skillId=${item.skill.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg transition"
                        title="Take Diagnostic Quiz to verify this skill"
                      >
                        <Sparkles className="h-3 w-3" />
                        Verify ↗
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getLevelColor(
                        item.proficiencyLevel
                      )}`}
                    >
                      {item.proficiencyLevel}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.yearsOfExperience} yrs exp
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSkill(item.id)}
                  title="Remove skill"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Soft Skills & Aptitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Soft Skills */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Soft Skills</h2>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-bold">
                {softSkills.length}
              </span>
            </div>

            <div className="space-y-3">
              {softSkills.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm"
                >
                  <span className="font-semibold text-slate-800">{item.skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      {item.proficiencyLevel}
                    </span>
                    <button
                      onClick={() => handleDeleteSkill(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aptitude Skills */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Aptitude & Analytical</h2>
              <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-bold">
                {aptitudeSkills.length}
              </span>
            </div>

            <div className="space-y-3">
              {aptitudeSkills.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm"
                >
                  <span className="font-semibold text-slate-800">{item.skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-800">
                      {item.proficiencyLevel}
                    </span>
                    <button
                      onClick={() => handleDeleteSkill(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
