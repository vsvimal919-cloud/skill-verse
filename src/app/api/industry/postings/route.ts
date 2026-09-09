import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "INDUSTRY" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const industry = await db.industryProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!industry) {
      return NextResponse.json({ success: false, error: "Industry profile not found" }, { status: 404 });
    }

    const postings = await db.industryPosting.findMany({
      where: { industryId: industry.id },
      include: {
        requirements: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, postings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "INDUSTRY") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const industry = await db.industryProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!industry) {
      return NextResponse.json({ success: false, error: "Industry profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, type, description, location, locationType, stipendOrSalary, vacancies, skills } = body;

    if (!title || !type || !description || !location) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const posting = await db.industryPosting.create({
      data: {
        industryId: industry.id,
        title,
        type: type || "JOB",
        description,
        location,
        locationType: locationType || "ONSITE",
        stipendOrSalary: stipendOrSalary || null,
        vacancies: Number(vacancies) || 1,
        status: "OPEN",
      },
    });

    // Add required skills
    if (Array.isArray(skills)) {
      for (const s of skills) {
        if (s.skillId) {
          await db.postingSkillRequirement.create({
            data: {
              postingId: posting.id,
              skillId: s.skillId,
              importance: s.importance || "MANDATORY",
              minProficiency: s.minProficiency || "INTERMEDIATE",
            },
          });
        }
      }
    }

    const completePosting = await db.industryPosting.findUnique({
      where: { id: posting.id },
      include: { requirements: { include: { skill: true } } },
    });

    return NextResponse.json({ success: true, posting: completePosting });
  } catch (error: any) {
    console.error("Create posting error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
