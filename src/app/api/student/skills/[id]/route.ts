import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const student = await db.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    await db.studentSkill.deleteMany({
      where: {
        id,
        studentId: student.id,
      },
    });

    return NextResponse.json({ success: true, message: "Skill removed" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
