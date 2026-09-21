import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Student filter scoping
    const studentWhere: any = {};
    if (departmentId && session.role !== "ADMIN") {
      studentWhere.departmentId = departmentId;
    }

    const items: Array<{
      id: string;
      category: "HACKATHON" | "INTERNSHIP" | "PROJECT" | "CERTIFICATION";
      studentId: string;
      studentName: string;
      studentEmail: string;
      registerNumber: string;
      department: string;
      batchYear: number;
      semester: number;
      title: string;
      subTitle: string;
      date: string | null;
      outcome: string;
      prizeDetails?: string | null;
      prizeAmount?: number | null;
      skillsUsed?: string | null;
      description?: string | null;
      isVerified: boolean;
      proofUrl?: string | null;
      proofType?: string | null;
    }> = [];

    // 1. Fetch Achievements / Hackathons
    if (type === "ALL" || type === "HACKATHON") {
      const achievements = await db.studentAchievement.findMany({
        where: {
          student: studentWhere,
          ...(eventName
            ? {
                OR: [
                  { eventName: { contains: eventName } },
                  { organization: { contains: eventName } },
                  { skillsUsed: { contains: eventName } },
                  { description: { contains: eventName } },
                ],
              }
            : {}),
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } },
            },
          },
          certificateFile: true,
          proofPhotoFile: true,
        },
        orderBy: { eventDate: "desc" },
      });

      for (const a of achievements) {
        let proofUrl = null;
        let proofType = null;
        if (a.proofPhotoFile) {
          proofUrl = `/api/files/${a.proofPhotoFile.id}`;
          proofType = "Photo Proof";
        } else if (a.certificateFile) {
          proofUrl = `/api/files/${a.certificateFile.id}`;
          proofType = "Certificate Doc";
        }

        items.push({
          id: a.id,
          category: "HACKATHON",
          studentId: a.studentId,
          studentName: a.student.user.name,
          studentEmail: a.student.user.email,
          registerNumber: a.student.registerNumber,
          department: a.student.department.name,
          batchYear: a.student.batchYear,
          semester: a.student.semester,
          title: a.eventName,
          subTitle: `${a.organization} • ${a.eventType.replace("_", " ")}`,
          date: a.eventDate.toISOString().split("T")[0],
          outcome: a.participationStatus,
          prizeDetails: a.prizeDetails,
          prizeAmount: a.prizeAmount,
          skillsUsed: a.skillsUsed,
          description: a.description,
          isVerified: a.isVerified,
          proofUrl,
          proofType,
        });
      }
    }

    // 2. Fetch Internships
    if (type === "ALL" || type === "INTERNSHIP") {
      const internships = await db.studentInternship.findMany({
        where: {
          student: studentWhere,
          ...(eventName
            ? {
                OR: [
                  { companyName: { contains: eventName } },
                  { role: { contains: eventName } },
                  { description: { contains: eventName } },
                ],
              }
            : {}),
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } },
            },
          },
          certificateFile: true,
        },
        orderBy: { startDate: "desc" },
      });

      for (const i of internships) {
        items.push({
          id: i.id,
          category: "INTERNSHIP",
          studentId: i.studentId,
          studentName: i.student.user.name,
          studentEmail: i.student.user.email,
          registerNumber: i.student.registerNumber,
          department: i.student.department.name,
          batchYear: i.student.batchYear,
          semester: i.student.semester,
          title: `${i.role} at ${i.companyName}`,
          subTitle: i.location || "Onsite",
          date: i.startDate.toISOString().split("T")[0],
          outcome: i.isCurrent ? "Active Internship" : "Completed",
          description: i.description,
          isVerified: i.isVerified,
          proofUrl: i.certificateFile ? `/api/files/${i.certificateFile.id}` : null,
          proofType: i.certificateFile ? "Completion Cert" : null,
        });
      }
    }

    // 3. Fetch Capstone Projects
    if (type === "ALL" || type === "PROJECT") {
      const projects = await db.studentProject.findMany({
        where: {
          student: studentWhere,
          ...(eventName
            ? {
                OR: [
                  { title: { contains: eventName } },
                  { description: { contains: eventName } },
                  { skillsUsed: { contains: eventName } },
                ],
              }
            : {}),
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      for (const p of projects) {
        items.push({
          id: p.id,
          category: "PROJECT",
          studentId: p.studentId,
          studentName: p.student.user.name,
          studentEmail: p.student.user.email,
          registerNumber: p.student.registerNumber,
          department: p.student.department.name,
          batchYear: p.student.batchYear,
          semester: p.student.semester,
          title: p.title,
          subTitle: p.role || "Lead Developer",
          date: p.createdAt.toISOString().split("T")[0],
          outcome: p.isOngoing ? "In Development" : "Completed",
          skillsUsed: p.skillsUsed,
          description: p.description,
          isVerified: true,
          proofUrl: p.repoUrl || p.liveUrl || null,
          proofType: p.repoUrl ? "Repository Link" : p.liveUrl ? "Live Demo" : null,
        });
      }
    }

    // 4. Fetch Certifications
    if (type === "ALL" || type === "CERTIFICATION") {
      const certs = await db.studentCertification.findMany({
        where: {
          student: studentWhere,
          ...(eventName
            ? {
                OR: [
                  { title: { contains: eventName } },
                  { issuingOrg: { contains: eventName } },
                ],
              }
            : {}),
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } },
            },
          },
          file: true,
        },
        orderBy: { issueDate: "desc" },
      });

      for (const c of certs) {
        items.push({
          id: c.id,
          category: "CERTIFICATION",
          studentId: c.studentId,
          studentName: c.student.user.name,
          studentEmail: c.student.user.email,
          registerNumber: c.student.registerNumber,
          department: c.student.department.name,
          batchYear: c.student.batchYear,
          semester: c.student.semester,
          title: c.title,
          subTitle: c.issuingOrg,
          date: c.issueDate.toISOString().split("T")[0],
          outcome: c.credentialId ? `ID: ${c.credentialId}` : "Certified",
          isVerified: c.isVerified,
          proofUrl: c.file ? `/api/files/${c.file.id}` : c.credentialUrl || null,
          proofType: c.file ? "Certificate Doc" : c.credentialUrl ? "Verify Link" : null,
        });
      }
    }

    // Sort all records by date descending
    items.sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      return dateB.localeCompare(dateA);
    });

    return NextResponse.json({
      success: true,
      totalCount: items.length,
      items,
    });
  } catch (error: any) {
    console.error("Consolidated report error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
