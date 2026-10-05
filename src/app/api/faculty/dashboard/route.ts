import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const departmentFilter = searchParams.get("departmentId") || "";

    // 1. Get faculty user and academician profile
    const facultyUser = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        academicianProfile: {
          include: {
            department: true,
            institution: true,
          },
        },
      },
    });

    const facultyProfile = facultyUser?.academicianProfile;

    // 2. Fetch all departments for filtering
    const rawDepartments = await db.department.findMany({
      include: {
        _count: {
          select: { students: true, academicians: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const departments = rawDepartments.map((d) => ({
      ...d,
      _count: {
        students: d._count.students,
        faculty: d._count.academicians,
      },
    }));

    // 3. Fetch Directly Assigned Mentees
    let mentees: any[] = [];
    if (facultyProfile) {
      mentees = await db.studentProfile.findMany({
        where: { mentorId: facultyProfile.id },
        include: {
          user: { select: { name: true, email: true, avatarUrl: true } },
          department: true,
          targetRole: true,
          skills: {
            include: { skill: true },
          },
          achievements: {
            orderBy: { createdAt: "desc" },
          },
          projects: true,
          internships: true,
        },
        orderBy: { careerReadinessScore: "desc" },
      });
    }

    // 4. Fetch Department Roster & Students
    const deptWhereClause: any = {};
    if (departmentFilter) {
      deptWhereClause.departmentId = departmentFilter;
    } else if (facultyProfile?.departmentId && session.role !== "ADMIN") {
      deptWhereClause.departmentId = facultyProfile.departmentId;
    }

    const deptStudents = await db.studentProfile.findMany({
      where: deptWhereClause,
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

    // 5. Aggregate Department Skill Distribution
    const skillCounts: Record<string, { name: string; count: number; category: string }> = {};
    for (const student of deptStudents) {
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

    // 6. Aggregate Unverified Achievements in Selected Department
    const unverifiedAchievements = await db.studentAchievement.findMany({
      where: {
        isVerified: false,
        student: deptWhereClause,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: true,
          },
        },
        certificateFile: true,
        proofPhotoFile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 7. Aggregate Category Metrics across department students
    const categoryCounts: Record<string, number> = {
      HACKATHON: 0,
      PAPER_PRESENTATION: 0,
      WORKSHOP: 0,
      WEBINAR: 0,
    };

    for (const student of deptStudents) {
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
      facultyProfile,
      departments,
      mentees,
      deptStudents,
      skillDistribution,
      unverifiedAchievements,
      categoryCounts,
    });
  } catch (error: any) {
    console.error("Faculty dashboard API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
