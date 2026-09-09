import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const student = await db.studentProfile.findFirst({
      where: {
        OR: [{ id }, { registerNumber: id }],
      },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        institution: { select: { name: true, code: true } },
        department: { select: { name: true, code: true } },
        targetRole: { select: { title: true, category: true } },
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
        internships: { orderBy: { startDate: "desc" } },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
