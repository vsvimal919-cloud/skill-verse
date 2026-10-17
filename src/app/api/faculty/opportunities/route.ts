import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FACULTY_OPPORTUNITIES, FacultyOpportunity } from "@/lib/facultyOpportunities";

// GET: Filter and retrieve opportunities, plus check which ones the faculty has already logged/applied for
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type") || "ALL";
    const providerFilter = searchParams.get("provider") || "ALL";
    const search = (searchParams.get("search") || "").toLowerCase();

    // Check existing applications / logged entries for current faculty
    const academician = await db.academicianProfile.findUnique({
      where: { userId: session.userId },
      include: {
        developments: true,
      },
    });

    const loggedTitles = new Set(
      academician?.developments.map((d) => d.title.toLowerCase().trim()) || []
    );

    let filtered = FACULTY_OPPORTUNITIES.filter((opp) => {
      const matchType = typeFilter === "ALL" || opp.type === typeFilter;
      const matchProvider = providerFilter === "ALL" || opp.providerCategory === providerFilter;
      const matchSearch =
        !search ||
        opp.title.toLowerCase().includes(search) ||
        opp.provider.toLowerCase().includes(search) ||
        opp.description.toLowerCase().includes(search) ||
        opp.keySkills.some((s) => s.toLowerCase().includes(search));

      return matchType && matchProvider && matchSearch;
    });

    const items = filtered.map((opp) => ({
      ...opp,
      isApplied: loggedTitles.has(opp.title.toLowerCase().trim()),
    }));

    return NextResponse.json({
      success: true,
      opportunities: items,
      totalCount: items.length,
    });
  } catch (error: any) {
    console.error("GET faculty opportunities error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Apply / Register for an opportunity and auto-log it into FacultyDevelopment
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
    const { opportunityId } = body;

    const opp = FACULTY_OPPORTUNITIES.find((o) => o.id === opportunityId);
    if (!opp) {
      return NextResponse.json({ success: false, error: "Opportunity not found" }, { status: 404 });
    }

    // Map opportunity type to FacultyDevelopment schema type
    let mappedType = "FDP";
    if (opp.type === "RESEARCH_COLLAB") mappedType = "RESEARCH_PAPER";
    else if (opp.type === "INDUSTRY_SABBATICAL") mappedType = "WORKSHOP";
    else if (opp.type === "CONSULTANCY") mappedType = "GUEST_LECTURE";

    // Check if already registered
    const existing = await db.facultyDevelopment.findFirst({
      where: {
        facultyId: academician.id,
        title: opp.title,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyApplied: true,
        record: existing,
        redirectUrl: opp.externalUrl,
        message: "You have already logged this opportunity in your portfolio.",
      });
    }

    const record = await db.facultyDevelopment.create({
      data: {
        facultyId: academician.id,
        type: mappedType,
        title: opp.title,
        organizer: opp.provider,
        startDate: new Date(opp.startDate),
        durationDays: opp.durationDays,
        scoreCreditPoints: opp.creditPoints,
        certUrl: opp.externalUrl,
        description: `Applied via SkillVerse Faculty Hub: ${opp.sponsorship}. Format: ${opp.format}.`,
        status: "ONGOING", // Marked as ongoing active application
      },
    });

    return NextResponse.json({
      success: true,
      record,
      redirectUrl: opp.externalUrl,
      message: `Successfully registered and auto-logged "${opp.title}" into your FDP & CPD portfolio tracker!`,
    });
  } catch (error: any) {
    console.error("POST faculty apply error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
