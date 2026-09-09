import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const skills = await db.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const roles = await db.jobRole.findMany({
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      success: true,
      skills,
      roles,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
