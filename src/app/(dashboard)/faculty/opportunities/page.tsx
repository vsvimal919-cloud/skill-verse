"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  Building,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  DollarSign,
  BookmarkCheck,
  Compass,
  Zap,
  ArrowRight,
  ShieldCheck,
  Loader2,
  BookOpen,
} from "lucide-react";

export default function FacultyOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  useEffect(() => {
    loadOpportunities();
  }, [typeFilter, providerFilter, search]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: typeFilter,
        provider: providerFilter,
        search,
      });
      const res = await fetch(`/api/faculty/opportunities?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOpportunities(json.opportunities || []);
      }
    } catch (e) {
      console.error("Failed to load opportunities", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAndLog = async (opp: any) => {
    try {
      setApplyingId(opp.id);
      // Auto-log into faculty CPD portfolio tracker
      const res = await fetch("/api/faculty/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opp.id }),
      });
      const json = await res.json();

      if (json.success) {
        setToastMessage(json.message || `Auto-logged "${opp.title}" to your CPD tracker!`);
        // Open official registration URL in new tab
        window.open(opp.externalUrl, "_blank", "noopener,noreferrer");
        // Update local status
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opp.id ? { ...o, isApplied: true } : o))
        );
        setTimeout(() => setToastMessage(""), 5000);
      }
    } catch (err: any) {
      alert("Error applying: " + err.message);
    } finally {
      setApplyingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "FDP":
        return { label: "FDP / STTP", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "INDUSTRY_SABBATICAL":
        return { label: "Industry Sabbatical", bg: "bg-purple-100 text-purple-800 border-purple-300" };
      case "RESEARCH_COLLAB":
        return { label: "Research Grant & Collab", bg: "bg-blue-100 text-blue-800 border-blue-300" };
      case "CONSULTANCY":
        return { label: "Tech Consultancy & Fellowship", bg: "bg-amber-100 text-amber-900 border-amber-300" };
      default:
        return { label: type, bg: "bg-slate-100 text-slate-800 border-slate-300" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={{
          name: "Faculty Member",
          email: "",
          role: "ACADEMICIAN",
        }}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <Compass className="h-4 w-4" />
              Faculty Upskilling, Sabbaticals & Research Grants
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Faculty Opportunities & FDP Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Curated national FDPs, sponsored industry sabbaticals, funded research grants, and university-industry tech collaborations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/faculty/development"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <BookmarkCheck className="h-4 w-4 text-emerald-600" />
              View My CPD Portfolio Tracker
            </Link>
          </div>
        </div>

        {/* Action Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 text-emerald-100 border border-emerald-500 text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <Link
              href="/faculty/development"
              className="underline text-emerald-300 font-bold hover:text-white"
            >
              Review in CPD Tracker →
            </Link>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold uppercase text-slate-500">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Opportunity Types</option>
                <option value="FDP">Industrial Training & FDP</option>
                <option value="INDUSTRY_SABBATICAL">Industry Sabbaticals</option>
                <option value="RESEARCH_COLLAB">Research Grants & Collaborations</option>
                <option value="CONSULTANCY">Tech Consultancy & Fellowships</option>
              </select>
            </div>

            {/* Provider Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase text-slate-500">Provider:</span>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Providers</option>
                <option value="AICTE_ATAL">AICTE ATAL Academy</option>
                <option value="NPTEL_IIT">NPTEL & IITs</option>
                <option value="INDUSTRY">Industry Partners (Google, IBM, TI)</option>
                <option value="RESEARCH_LAB">Govt Research Labs (SERB/DST)</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, skill, IIT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="text-sm font-semibold">Loading FDP and Research Directory...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-16 text-center text-slate-400 rounded-3xl bg-white border border-slate-200">
            <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No matching opportunities found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your Type or Provider filters to explore other professional listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => {
              const badge = getTypeBadge(opp.type);

              return (
                <div
                  key={opp.id}
                  className={`rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between transition hover:shadow-md hover:border-slate-300 relative ${
                    opp.isFeatured ? "border-emerald-300/80 ring-1 ring-emerald-500/20" : "border-slate-200"
                  }`}
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      {opp.isApplied && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Tracked
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-black text-slate-900 text-base mt-2.5 leading-snug">
                      {opp.title}
                    </h3>

                    {/* Provider & Format */}
                    <div className="mt-2 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{opp.provider}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>
                        {opp.duration} • <span className="text-slate-600 font-bold">{opp.format}</span>
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Sponsorship / Grant Info Banner */}
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{opp.sponsorship}</span>
                      </div>
                      {opp.stipendOrGrant && (
                        <div className="text-[11px] text-purple-800 font-semibold flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span>{opp.stipendOrGrant}</span>
                        </div>
                      )}
                    </div>

                    {/* Eligibility */}
                    <div className="mt-3 text-[11px] text-slate-500 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                      <strong className="text-amber-900 font-bold">Eligibility: </strong>
                      {opp.eligibility}
                    </div>

                    {/* Key Competencies / Skills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {opp.keySkills.map((sk: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Direct Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Credit Points
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        +{opp.creditPoints} AICTE pts
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyAndLog(opp)}
                      disabled={applyingId === opp.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50"
                    >
                      {applyingId === opp.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      {opp.isApplied ? "Re-open Portal" : "Apply & Auto-Log"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
