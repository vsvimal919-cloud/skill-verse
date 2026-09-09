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

  const internships = await db.studentInternship.findMany({
    where: { studentId: student.id },
    include: { certificateFile: true },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ success: true, internships });
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
    const { companyName, role, location, startDate, endDate, isCurrent, description, certificateFileId } = body;

    if (!companyName || !role || !startDate) {
      return NextResponse.json({ success: false, error: "Company, role, and start date are required" }, { status: 400 });
    }

    const internship = await db.studentInternship.create({
      data: {
        studentId: student.id,
        companyName,
        role,
        location: location || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: Boolean(isCurrent),
        description: description || null,
        certificateFileId: certificateFileId || null,
      },
      include: { certificateFile: true },
    });

    return NextResponse.json({ success: true, internship });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
