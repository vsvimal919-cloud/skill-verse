import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const student = await db.studentProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: {
        select: { name: true, email: true, avatarUrl: true },
      },
      institution: true,
      department: true,
      targetRole: true,
      resumeFile: true,
      mentor: {
        include: {
          user: {
            select: { name: true, email: true, avatarUrl: true },
          },
          department: true,
        },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, profile: student });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      bio,
      phone,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      targetRoleId,
      semester,
      cgpa,
      resumeFileId,
      departmentId,
      mentorId,
    } = body;

    const updated = await db.studentProfile.update({
      where: { userId: session.userId },
      data: {
        bio,
        phone,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        targetRoleId: targetRoleId || undefined,
        semester: semester !== undefined ? Number(semester) : undefined,
        cgpa: cgpa !== undefined ? Number(cgpa) : undefined,
        resumeFileId: resumeFileId || undefined,
        departmentId: departmentId || undefined,
        mentorId: mentorId !== undefined ? (mentorId ? mentorId : null) : undefined,
      },
      include: {
        targetRole: true,
        institution: true,
        department: true,
        resumeFile: true,
        mentor: {
          include: {
            user: {
              select: { name: true, email: true, avatarUrl: true },
            },
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
