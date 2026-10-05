import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { achievementId, status, rejectionReason } = await req.json();

    if (!achievementId) {
      return NextResponse.json({ success: false, error: "Achievement ID required" }, { status: 400 });
    }

    const isApprove = status !== "REJECTED";

    const updated = await db.studentAchievement.update({
      where: { id: achievementId },
      data: {
        isVerified: isApprove,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      achievement: updated,
      message: isApprove ? "Certificate successfully verified" : "Certificate rejected",
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
