import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentProfile: user.studentProfile,
      academicianProfile: user.academicianProfile,
      industryProfile: user.industryProfile,
    },
  });
}
