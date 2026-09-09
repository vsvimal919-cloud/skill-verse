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
  });

  if (!student) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }

  const projects = await db.studentProject.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, projects });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await db.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, role, repoUrl, liveUrl, skillsUsed } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 });
    }

    const project = await db.studentProject.create({
      data: {
        studentId: student.id,
        title,
        description,
        role: role || "Developer",
        repoUrl: repoUrl || null,
        liveUrl: liveUrl || null,
        skillsUsed: skillsUsed || "",
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
