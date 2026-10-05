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

  const achievements = await db.studentAchievement.findMany({
    where: { studentId: student.id },
    include: {
      certificateFile: true,
      proofPhotoFile: true,
    },
    orderBy: { eventDate: "desc" },
  });

  return NextResponse.json({ success: true, achievements });
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
    const {
      eventName,
      eventType,
      organization,
      eventDate,
      participationStatus,
      prizeDetails,
      prizeAmount,
      skillsUsed,
      description,
      certificateFileId,
      proofPhotoFileId,
      // Dynamic category specific fields
      paperTitle,
      conferenceName,
      publicationUrl,
      workshopDuration,
      toolsLearned,
      speakerName,
    } = body;

    if (!eventName || !organization || !eventDate || !description) {
      return NextResponse.json(
        { success: false, error: "Event name, organization, date, and description are required" },
        { status: 400 }
      );
    }

    const achievement = await db.studentAchievement.create({
      data: {
        studentId: student.id,
        eventName,
        eventType: eventType || "HACKATHON",
        organization,
        eventDate: new Date(eventDate),
        participationStatus: participationStatus || "PARTICIPANT",
        prizeDetails: prizeDetails || null,
        prizeAmount: prizeAmount ? parseFloat(prizeAmount) : null,
        skillsUsed: skillsUsed || "",
        description,
        certificateFileId: certificateFileId || null,
        proofPhotoFileId: proofPhotoFileId || null,
        paperTitle: paperTitle || null,
        conferenceName: conferenceName || null,
        publicationUrl: publicationUrl || null,
        workshopDuration: workshopDuration || null,
        toolsLearned: toolsLearned || null,
        speakerName: speakerName || null,
      },
      include: {
        certificateFile: true,
        proofPhotoFile: true,
      },
    });

    return NextResponse.json({ success: true, achievement });
  } catch (error: any) {
    console.error("Create achievement error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
