import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rawDepartments = await db.department.findMany({
      include: {
        academicians: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const departments = rawDepartments.map((d) => ({
      ...d,
      faculty: d.academicians,
    }));

    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
