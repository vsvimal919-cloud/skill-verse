import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch all FDPs, research papers, and upskilling entries for the logged-in faculty
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const academician = await db.academicianProfile.findUnique({
      where: { userId: session.userId },
      include: {
        department: true,
        institution: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!academician) {
      return NextResponse.json({ success: false, error: "Faculty profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");

    const whereClause: any = { facultyId: academician.id };
    if (typeFilter && typeFilter !== "ALL") {
      whereClause.type = typeFilter;
    }

    const developments = await db.facultyDevelopment.findMany({
      where: whereClause,
      orderBy: { startDate: "desc" },
    });

    // Summary calculations
    const totalDays = developments.reduce((acc, d) => acc + (d.durationDays || 0), 0);
    const totalHours = totalDays * 6; // Standard 6 credit hours per day for FDP/Workshops
    const totalCredits = developments.reduce((acc, d) => acc + (d.scoreCreditPoints || 0), 0);
    const researchPapersCount = developments.filter((d) => d.type === "RESEARCH_PAPER" || d.type === "PATENT").length;
    const nptelCount = developments.filter((d) => d.type === "NPTEL_SWAYAM").length;

    return NextResponse.json({
      success: true,
      faculty: academician,
      developments,
      metrics: {
        totalRecords: developments.length,
        totalDays,
        totalHours,
        totalCredits: Math.round(totalCredits * 10) / 10,
        researchPapersCount,
        nptelCount,
      },
    });
  } catch (error: any) {
    console.error("GET faculty development error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new FDP, Workshop, Research Paper, or Certification
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const academician = await db.academicianProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!academician) {
      return NextResponse.json({ success: false, error: "Faculty profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      type,
      title,
      organizer,
      startDate,
      endDate,
      durationDays,
      scoreCreditPoints,
      certUrl,
      publicationDoi,
      description,
      status,
    } = body;

    if (!type || !title || !organizer || !startDate) {
      return NextResponse.json(
        { success: false, error: "Type, Title, Host Organizer, and Start Date are required" },
        { status: 400 }
      );
    }

    // Auto calculate recommended AICTE / UGC credit points if not explicitly passed
    let calculatedCredits = Number(scoreCreditPoints) || 0;
    const days = parseInt(durationDays) || 1;
    if (calculatedCredits === 0) {
      if (type === "FDP") calculatedCredits = days >= 5 ? 2.0 : 1.0;
      else if (type === "WORKSHOP") calculatedCredits = days * 0.5;
      else if (type === "RESEARCH_PAPER") calculatedCredits = 3.0; // UGC CARE / Scopus standard credit
      else if (type === "PATENT") calculatedCredits = 4.0;
      else if (type === "NPTEL_SWAYAM") calculatedCredits = 2.0;
      else if (type === "GUEST_LECTURE") calculatedCredits = 1.0;
    }

    const record = await db.facultyDevelopment.create({
      data: {
        facultyId: academician.id,
        type,
        title,
        organizer,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        durationDays: days,
        scoreCreditPoints: calculatedCredits,
        certUrl: certUrl || null,
        publicationDoi: publicationDoi || null,
        description: description || null,
        status: status || "COMPLETED",
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("POST faculty development error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an FDP / Research record
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Record ID is required" }, { status: 400 });
    }

    const academician = await db.academicianProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!academician) {
      return NextResponse.json({ success: false, error: "Faculty profile not found" }, { status: 404 });
    }

    await db.facultyDevelopment.deleteMany({
      where: {
        id,
        facultyId: academician.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE faculty development error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
