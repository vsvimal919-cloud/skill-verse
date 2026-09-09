import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentSkillId, isVerified } = await req.json();

    const academician = await db.academicianProfile.findUnique({
      where: { userId: session.userId },
    });

    const updated = await db.studentSkill.update({
      where: { id: studentSkillId },
      data: {
        isVerified: Boolean(isVerified),
        verifiedById: isVerified ? academician?.id : null,
      },
      include: {
        skill: true,
        verifiedBy: { include: { user: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ success: true, skill: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
