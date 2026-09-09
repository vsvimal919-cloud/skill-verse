import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateStudentDocxReport } from "@/lib/reports/docx-generator";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const student = await db.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const docxBuffer = await generateStudentDocxReport(id);

    const safeRegNo = student.registerNumber.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `SkillVerse_Dossier_${safeRegNo}.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Docx generation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
