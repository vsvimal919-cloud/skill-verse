import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeSkillGap } from "@/lib/gap-engine";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId") || undefined;
    const studentIdParam = searchParams.get("studentId");

    let studentId = "";

    if (session.role === "STUDENT") {
      const student = await db.studentProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!student) {
        return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
      }
      studentId = student.id;
    } else if (session.role === "ACADEMICIAN" || session.role === "ADMIN") {
      if (!studentIdParam) {
        return NextResponse.json({ success: false, error: "studentId query parameter is required" }, { status: 400 });
      }
      studentId = studentIdParam;
    } else {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const gapResult = await computeSkillGap(studentId, roleId);

    // Also get all available job roles so the UI can let user switch target roles
    const availableRoles = await db.jobRole.findMany({
      select: { id: true, title: true, slug: true, category: true, description: true },
    });

    return NextResponse.json({
      success: true,
      data: gapResult,
      availableRoles,
    });
  } catch (error: any) {
    console.error("Skill gap computation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
