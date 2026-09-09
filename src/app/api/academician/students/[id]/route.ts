import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const student = await db.studentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        institution: true,
        department: true,
        targetRole: true,
        resumeFile: true,
        skills: {
          include: {
            skill: true,
            verifiedBy: { include: { user: { select: { name: true } } } },
          },
          orderBy: { proficiencyLevel: "desc" },
        },
        achievements: {
          include: {
            certificateFile: true,
            proofPhotoFile: true,
          },
          orderBy: { eventDate: "desc" },
        },
        projects: { orderBy: { createdAt: "desc" } },
        internships: {
          include: { certificateFile: true },
          orderBy: { startDate: "desc" },
        },
        certifications: {
          include: { file: true },
          orderBy: { issueDate: "desc" },
        },
        feedbacks: {
          include: {
            academician: { include: { user: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
