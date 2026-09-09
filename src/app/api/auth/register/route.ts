import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, ...extra } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Get default institution and dept
    let institution = await db.institution.findFirst();
    if (!institution) {
      institution = await db.institution.create({
        data: {
          name: "Apex Institute of Technology",
          code: "AIT-001",
        },
      });
    }

    let department = await db.department.findFirst({
      where: { institutionId: institution.id },
    });
    if (!department) {
      department = await db.department.create({
        data: {
          institutionId: institution.id,
          name: "Computer Science & Engineering",
          code: "CSE",
        },
      });
    }

    let user;
    let profileId: string | undefined;

    if (role === "STUDENT") {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name,
          role: "STUDENT",
          studentProfile: {
            create: {
              institutionId: institution.id,
              departmentId: department.id,
              registerNumber: extra.registerNumber || `REG-${Date.now().toString().slice(-6)}`,
              batchYear: Number(extra.batchYear) || 2026,
              semester: Number(extra.semester) || 1,
              cgpa: Number(extra.cgpa) || 7.5,
              phone: extra.phone || null,
            },
          },
        },
        include: { studentProfile: true },
      });
      profileId = user.studentProfile?.id;
    } else if (role === "ACADEMICIAN") {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name,
          role: "ACADEMICIAN",
          academicianProfile: {
            create: {
              institutionId: institution.id,
              departmentId: department.id,
              designation: extra.designation || "Assistant Professor",
              employeeId: extra.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
              specialization: extra.specialization || "Computer Science",
            },
          },
        },
        include: { academicianProfile: true },
      });
      profileId = user.academicianProfile?.id;
    } else if (role === "INDUSTRY") {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name,
          role: "INDUSTRY",
          industryProfile: {
            create: {
              companyName: extra.companyName || name,
              industryType: extra.industryType || "Software & Technology",
              location: extra.location || "Bangalore, India",
              website: extra.website || null,
              isVerified: true,
            },
          },
        },
        include: { industryProfile: true },
      });
      profileId = user.industryProfile?.id;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
      profileId,
      institutionId: institution.id,
      departmentId: department.id,
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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
