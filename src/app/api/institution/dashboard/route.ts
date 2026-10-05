import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "ACADEMICIAN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId") || "";

    // 1. Fetch institution (first or user-associated)
    const institution = await db.institution.findFirst({
      include: {
        departments: {
          include: {
            academicians: {
              include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                _count: { select: { mentees: true } },
              },
            },
            _count: {
              select: { students: true, academicians: true },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!institution) {
      return NextResponse.json({ success: false, error: "Institution not found" }, { status: 404 });
    }

    // 2. Fetch all students or department-specific students
    const studentFilter: any = { institutionId: institution.id };
    if (departmentId) {
      studentFilter.departmentId = departmentId;
    }

    const students = await db.studentProfile.findMany({
      where: studentFilter,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        department: true,
        targetRole: true,
        mentor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        skills: {
          include: { skill: true },
        },
        achievements: true,
      },
      orderBy: { careerReadinessScore: "desc" },
    });

    // 3. Department aggregates
    const departmentStats = institution.departments.map((dept) => {
      const deptStudents = students.filter((s) => s.departmentId === dept.id);
      const avgScore =
        deptStudents.length > 0
          ? deptStudents.reduce((acc, s) => acc + (s.careerReadinessScore || 0), 0) / deptStudents.length
          : 0;

      const unverifiedCount = deptStudents.reduce(
        (acc, s) => acc + s.achievements.filter((a) => !a.isVerified).length,
        0
      );

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        studentCount: deptStudents.length,
        facultyCount: dept.academicians.length,
        avgReadinessScore: Math.round(avgScore * 10) / 10,
        unverifiedAchievements: unverifiedCount,
        faculty: dept.academicians,
      };
    });

    // 4. Overall Skill Distribution
    const skillCounts: Record<string, { name: string; count: number; category: string }> = {};
    for (const student of students) {
      for (const s of student.skills) {
        if (!skillCounts[s.skill.slug]) {
          skillCounts[s.skill.slug] = {
            name: s.skill.name,
            count: 0,
            category: s.skill.category,
          };
        }
        skillCounts[s.skill.slug].count++;
      }
    }
    const skillDistribution = Object.values(skillCounts).sort((a, b) => b.count - a.count);

    // 5. Category breakdown across institution
    const categoryCounts: Record<string, number> = {
      HACKATHON: 0,
      PAPER_PRESENTATION: 0,
      WORKSHOP: 0,
      WEBINAR: 0,
    };

    for (const student of students) {
      for (const ach of student.achievements) {
        if (categoryCounts[ach.eventType] !== undefined) {
          categoryCounts[ach.eventType]++;
        } else {
          categoryCounts[ach.eventType] = (categoryCounts[ach.eventType] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      institution: {
        id: institution.id,
        name: institution.name,
        code: institution.code,
      },
      departmentStats,
      students,
      skillDistribution,
      categoryCounts,
    });
  } catch (error: any) {
    console.error("Institution dashboard error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
