"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  FolderGit2,
  Briefcase,
  ExternalLink,
  Calendar,
  Building2,
  Trophy,
  Share2,
  Sparkles,
} from "lucide-react";

export default function PublicPortfolioPage() {
  const params = useParams();
  const id = params?.id as string;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function loadPortfolio() {
      try {
        const res = await fetch(`/api/portfolio/${id}`);
        const data = await res.json();
        if (data.success) {
          setStudent(data.student);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading digital verified portfolio...
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-slate-900">Portfolio Not Found</h1>
        <p className="text-sm text-slate-500 mt-1">
          The requested student portfolio could not be located.
        </p>
        <Link href="/" className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">
          Return to SkillVerse Home
        </Link>
      </div>
    );
  }

  const technicalSkills = student.skills.filter((s: any) => s.skill.category === "TECHNICAL");
  const softSkills = student.skills.filter((s: any) => s.skill.category === "SOFT");

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Top Floating Badge */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            Skill<span className="text-blue-600">Verse</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified Institutional Profile
          </span>
        </div>

        {/* Hero Profile Card */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-800 uppercase">
                {student.targetRole?.title || "Aspiring Software Engineer"}
              </span>
              <h1 className="text-3xl font-black text-slate-900">{student.user.name}</h1>
              <div className="text-sm text-slate-600">
                {student.institution.name} • {student.department.name} (Batch of {student.batchYear})
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Reg: <strong className="text-slate-800">{student.registerNumber}</strong></span>
                <span>•</span>
                <span>CGPA: <strong className="text-emerald-700">{student.cgpa} / 10.0</strong></span>
                <span>•</span>
                <span>Sem: <strong className="text-slate-800">{student.semester}</strong></span>
              </div>
            </div>

            {/* Career Readiness Badge */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200 text-center min-w-[160px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                Readiness Score
              </span>
              <div className="text-4xl font-black text-blue-900 my-1">
                {student.careerReadinessScore}
                <span className="text-base font-normal text-blue-400">/100</span>
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">
                Industry Evaluated
              </span>
            </div>
          </div>

          {student.bio && (
            <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
              {student.bio}
            </p>
          )}

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {student.githubUrl && (
              <a
                href={student.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                GitHub Profile <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={student.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-blue-200 bg-blue-50/50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5"
              >
                LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Competencies Section */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Verified Technical & Domain Competencies
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {technicalSkills.map((item: any) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">{item.skill.name}</div>
                  <div className="text-xs text-slate-500">{item.proficiencyLevel}</div>
                </div>
                {item.isVerified && (
                  <span title="Verified by Faculty" className="text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {softSkills.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Soft & Interpersonal Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {softSkills.map((item: any) => (
                  <span
                    key={item.id}
                    className="rounded-lg bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold"
                  >
                    {item.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hackathons, Competitions & Prize Proofs */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Hackathon Awards & Competitive Proofs
            </h2>
            <span className="rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-xs font-bold">
              {student.achievements.length} Wins / Finalists
            </span>
          </div>

          <div className="space-y-5">
            {student.achievements.map((ach: any) => (
              <div
                key={ach.id}
                className="p-5 rounded-2xl border border-slate-200 space-y-3 hover:border-amber-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-xs font-black uppercase">
                      {ach.participationStatus}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{ach.eventName}</h3>
                    <div className="text-xs text-slate-500">
                      {ach.organization} • {new Date(ach.eventDate).toLocaleDateString()}
                    </div>
                  </div>

                  {ach.prizeAmount && (
                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm font-black text-emerald-800">
                      ₹ {ach.prizeAmount.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {ach.prizeDetails && (
                  <div className="text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg inline-block">
                    Award: {ach.prizeDetails}
                  </div>
                )}

                <p className="text-sm text-slate-600 leading-relaxed">{ach.description}</p>

                {ach.skillsUsed && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ach.skillsUsed.split(",").map((sk: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-xs"
                      >
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Proof Links */}
                {(ach.certificateFile || ach.proofPhotoFile) && (
                  <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                    {ach.certificateFile && (
                      <a
                        href={`/api/files/${ach.certificateFile.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Official Certificate ↗
                      </a>
                    )}
                    {ach.proofPhotoFile && (
                      <a
                        href={`/api/files/${ach.proofPhotoFile.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        Winning Evidence Photo ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Projects & Internships */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Projects */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-indigo-600" />
              Verified Projects
            </h2>

            <div className="space-y-4">
              {student.projects.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Tech: {p.skillsUsed}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internships */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Industry Internships
            </h2>

            <div className="space-y-4">
              {student.internships.map((i: any) => (
                <div key={i.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{i.role}</h3>
                    <span className="text-xs font-bold text-purple-700">{i.companyName}</span>
                  </div>
                  <div className="text-xs text-slate-500">{i.location || "Onsite"}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{i.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
