"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { GraduationCap, LogOut, Briefcase, Award, BarChart3, User, Search, Layers } from "lucide-react";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
    profileId?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "STUDENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACADEMICIAN":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "INDUSTRY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Skill<span className="text-blue-600">Verse</span>
              </span>
              <span className="hidden text-[10px] uppercase tracking-wider text-slate-400 sm:block">
                Academia • Industry Bridge
              </span>
            </div>
          </Link>

          {/* Navigation Links for Authenticated Roles */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {user.role === "STUDENT" && (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/student/dashboard"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/student/skills"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/student/skills"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    My Skills
                  </Link>
                  <Link
                    href="/student/achievements"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/student/achievements"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Hackathons & Prizes
                  </Link>
                  <Link
                    href="/student/skill-gap"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/student/skill-gap"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Skill Gap Analysis
                  </Link>
                  <Link
                    href="/student/assessment"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/student/assessment"
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Coding Assessment
                  </Link>
                  <Link
                    href="/student/settings"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/student/settings"
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Dept & Mentor
                  </Link>
                  {user.profileId && (
                    <Link
                      href={`/portfolio/${user.profileId}`}
                      target="_blank"
                      className="rounded-lg px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      Public Portfolio ↗
                    </Link>
                  )}
                </>
              )}

              {(user.role === "ACADEMICIAN" || user.role === "ADMIN") && (
                <>
                  <Link
                    href="/faculty/dashboard"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/faculty/dashboard"
                        ? "bg-emerald-50 text-emerald-700 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Faculty Mentorship
                  </Link>
                  <Link
                    href="/academician/dashboard"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/academician/dashboard"
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Student Roster
                  </Link>
                  <Link
                    href="/institution/dashboard"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/institution/dashboard"
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Institution View
                  </Link>
                </>
              )}

              {user.role === "INDUSTRY" && (
                <>
                  <Link
                    href="/industry/dashboard"
                    className={`rounded-lg px-3 py-1.5 transition ${
                      pathname === "/industry/dashboard"
                        ? "bg-purple-50 text-purple-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Job Postings & Talent Search
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Right side Profile / Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
