import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        studentProfile: true,
        academicianProfile: true,
        industryProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Determine profile and institutional context
    let profileId: string | undefined;
    let institutionId: string | undefined;
    let departmentId: string | undefined;

    if (user.role === "STUDENT" && user.studentProfile) {
      profileId = user.studentProfile.id;
      institutionId = user.studentProfile.institutionId;
      departmentId = user.studentProfile.departmentId;
    } else if (user.role === "ACADEMICIAN" && user.academicianProfile) {
      profileId = user.academicianProfile.id;
      institutionId = user.academicianProfile.institutionId;
      departmentId = user.academicianProfile.departmentId;
    } else if (user.role === "INDUSTRY" && user.industryProfile) {
      profileId = user.industryProfile.id;
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role as "STUDENT" | "ACADEMICIAN" | "INDUSTRY" | "ADMIN",
      name: user.name,
      profileId,
      institutionId,
      departmentId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
