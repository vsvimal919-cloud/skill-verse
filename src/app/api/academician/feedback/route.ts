import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const academician = await db.academicianProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!academician) {
      return NextResponse.json({ success: false, error: "Academician profile not found" }, { status: 404 });
    }

    const { studentId, category, comments, rating } = await req.json();

    if (!studentId || !comments) {
      return NextResponse.json({ success: false, error: "Student ID and comments are required" }, { status: 400 });
    }

    const feedback = await db.academicianFeedback.create({
      data: {
        academicianId: academician.id,
        studentId,
        category: category || "SKILL_DEVELOPMENT",
        comments,
        rating: Number(rating) || 5,
      },
      include: {
        academician: { include: { user: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
