import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  Packer,
} from "docx";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ACADEMICIAN" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "ALL").toUpperCase();
    const eventName = searchParams.get("eventName") || searchParams.get("query") || "";
    const departmentId = searchParams.get("departmentId") || session.departmentId;

    const studentWhere: any = {};
    if (departmentId && session.role !== "ADMIN") {
      studentWhere.departmentId = departmentId;
    }

    const achievements = await db.studentAchievement.findMany({
      where: {
        student: studentWhere,
        ...(eventName
          ? {
              OR: [
                { eventName: { contains: eventName } },
                { organization: { contains: eventName } },
                { skillsUsed: { contains: eventName } },
              ],
            }
          : {}),
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { eventDate: "desc" },
    });

    const internships = await db.studentInternship.findMany({
      where: { student: studentWhere },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const projects = await db.studentProject.findMany({
      where: { student: studentWhere },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute totals
    const totalCashWon = achievements.reduce((acc, a) => acc + (a.prizeAmount || 0), 0);
    const totalWinners = achievements.filter((a) => a.participationStatus === "WINNER").length;

    // Table rows
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Student (Reg No)", bold: true })] })], width: { size: 22, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Category", bold: true })] })], width: { size: 14, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Event / Project Title", bold: true })] })], width: { size: 28, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rank / Outcome", bold: true })] })], width: { size: 16, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Prize (₹)", bold: true })] })], width: { size: 10, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })], width: { size: 10, type: WidthType.PERCENTAGE } }),
        ],
      }),
    ];

    // Add Achievements
    if (type === "ALL" || type === "HACKATHON") {
      for (const a of achievements) {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(`${a.student.user.name}\n(${a.student.registerNumber})`)] }),
              new TableCell({ children: [new Paragraph("Hackathon / Event")] }),
              new TableCell({ children: [new Paragraph(`${a.eventName}\n[${a.organization}]`)] }),
              new TableCell({ children: [new Paragraph(a.participationStatus)] }),
              new TableCell({ children: [new Paragraph(a.prizeAmount ? `₹${a.prizeAmount.toLocaleString("en-IN")}` : "-")] }),
              new TableCell({ children: [new Paragraph(a.isVerified ? "Verified" : "Pending")] }),
            ],
          })
        );
      }
    }

    // Add Internships
    if (type === "ALL" || type === "INTERNSHIP") {
      for (const i of internships) {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(`${i.student.user.name}\n(${i.student.registerNumber})`)] }),
              new TableCell({ children: [new Paragraph("Internship")] }),
              new TableCell({ children: [new Paragraph(`${i.role}\n[${i.companyName}]`)] }),
              new TableCell({ children: [new Paragraph(i.isCurrent ? "Active" : "Completed")] }),
              new TableCell({ children: [new Paragraph("-")] }),
              new TableCell({ children: [new Paragraph(i.isVerified ? "Verified" : "Submitted")] }),
            ],
          })
        );
      }
    }

    // Add Projects
    if (type === "ALL" || type === "PROJECT") {
      for (const p of projects) {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(`${p.student.user.name}\n(${p.student.registerNumber})`)] }),
              new TableCell({ children: [new Paragraph("Capstone Project")] }),
              new TableCell({ children: [new Paragraph(`${p.title}\n[Tech: ${p.skillsUsed}]`)] }),
              new TableCell({ children: [new Paragraph(p.isOngoing ? "Ongoing" : "Completed")] }),
              new TableCell({ children: [new Paragraph("-")] }),
              new TableCell({ children: [new Paragraph("Logged")] }),
            ],
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "APEX INSTITUTE OF TECHNOLOGY",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
              alignment: AlignmentType.CENTER,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "OFFICIAL CONSOLIDATED CLASS & EVENT PARTICIPATION REPORT",
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: "Subtitle",
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Generated: `, bold: true }),
                new TextRun(new Date().toLocaleDateString("en-IN", { dateStyle: "long" })),
                new TextRun({ text: `  |  Filter Scope: `, bold: true }),
                new TextRun(`${type}  |  Total Entries: ${tableRows.length - 1}`),
              ],
              spacing: { after: 150 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Department Metrics: `, bold: true }),
                new TextRun(`Total Cash Awards Won: ₹${totalCashWon.toLocaleString("en-IN")}  •  Total Hackathon 1st Place Wins: ${totalWinners}`),
              ],
              spacing: { after: 250 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Head of Department (HOD) Signature: __________________     Date: ______________",
                  bold: true,
                }),
              ],
              spacing: { before: 300 },
            }),
          ],
        },
      ],
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const filename = `Consolidated_Class_Report_${type}_${Date.now().toString().slice(-6)}.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Consolidated report docx error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
