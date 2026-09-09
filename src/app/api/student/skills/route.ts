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

  const skills = await db.studentSkill.findMany({
    where: { studentId: student.id },
    include: {
      skill: true,
      verifiedBy: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, skills });
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
    const { skillId, skillName, category, proficiencyLevel, yearsOfExperience } = body;

    let targetSkillId = skillId;

    // Allow adding a new skill if not in predefined list
    if (!targetSkillId && skillName) {
      const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = await db.skill.findFirst({
        where: { OR: [{ slug }, { name: { equals: skillName } }] },
      });

      if (existing) {
        targetSkillId = existing.id;
      } else {
        const created = await db.skill.create({
          data: {
            name: skillName.trim(),
            slug,
            category: category || "TECHNICAL",
            description: "User submitted skill",
            isVerified: false,
          },
        });
        targetSkillId = created.id;
      }
    }

    if (!targetSkillId) {
      return NextResponse.json({ success: false, error: "Skill is required" }, { status: 400 });
    }

    // Upsert student skill
    const studentSkill = await db.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId: student.id,
          skillId: targetSkillId,
        },
      },
      update: {
        proficiencyLevel: proficiencyLevel || "BEGINNER",
        yearsOfExperience: Number(yearsOfExperience) || 0.5,
      },
      create: {
        studentId: student.id,
        skillId: targetSkillId,
        proficiencyLevel: proficiencyLevel || "BEGINNER",
        yearsOfExperience: Number(yearsOfExperience) || 0.5,
      },
      include: { skill: true },
    });

    return NextResponse.json({ success: true, studentSkill });
  } catch (error: any) {
    console.error("Add skill error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
