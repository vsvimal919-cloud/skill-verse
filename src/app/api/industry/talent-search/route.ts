import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "INDUSTRY" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { skillIds, minCgpa, batchYear } = await req.json();

    const students = await db.studentProfile.findMany({
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        department: true,
        targetRole: true,
        skills: { include: { skill: true } },
        achievements: true,
        projects: true,
      },
    });

    const targetSkillSet = new Set(Array.isArray(skillIds) ? skillIds : []);

    const results = students
      .map((s) => {
        let matchCount = 0;
        for (const sk of s.skills) {
          if (targetSkillSet.has(sk.skillId)) {
            matchCount++;
          }
        }

        const matchPercent =
          targetSkillSet.size > 0
            ? Math.round((matchCount / targetSkillSet.size) * 100)
            : 100;

        return {
          id: s.id,
          name: s.user.name,
          email: s.user.email,
          department: s.department.name,
          batchYear: s.batchYear,
          cgpa: s.cgpa,
          targetRole: s.targetRole?.title || "General",
          readinessScore: s.careerReadinessScore,
          skills: s.skills.map((sk) => ({
            name: sk.skill.name,
            level: sk.proficiencyLevel,
            isVerified: sk.isVerified,
          })),
          matchPercent,
          achievementsCount: s.achievements.length,
          projectsCount: s.projects.length,
        };
      })
      .filter((s) => {
        if (minCgpa && s.cgpa < Number(minCgpa)) return false;
        if (batchYear && s.batchYear !== Number(batchYear)) return false;
        return true;
      })
      .sort((a, b) => b.matchPercent - a.matchPercent || b.readinessScore - a.readinessScore);

    return NextResponse.json({ success: true, students: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
