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
    const search = searchParams.get("search")?.toLowerCase() || "";
    const departmentId = searchParams.get("departmentId") || session.departmentId;

    const whereClause: any = {};
    if (departmentId && session.role !== "ADMIN") {
      whereClause.departmentId = departmentId;
    }

    const students = await db.studentProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        department: true,
        targetRole: true,
        skills: {
          include: { skill: true },
        },
        achievements: true,
        _count: {
          select: {
            skills: true,
            achievements: true,
            projects: true,
            internships: true,
          },
        },
      },
      orderBy: { careerReadinessScore: "desc" },
    });

    // Optional text filter
    const filtered = search
      ? students.filter(
          (s) =>
            s.user.name.toLowerCase().includes(search) ||
            s.registerNumber.toLowerCase().includes(search) ||
            s.user.email.toLowerCase().includes(search)
        )
      : students;

    return NextResponse.json({ success: true, students: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
