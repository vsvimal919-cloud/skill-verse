import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
} from "docx";
import { db } from "../db";
import { computeSkillGap } from "../gap-engine";

export async function generateStudentDocxReport(studentId: string): Promise<Buffer> {
  const student = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      institution: true,
      department: true,
      targetRole: true,
      skills: {
        include: { skill: true },
      },
      achievements: true,
      projects: true,
      internships: true,
      certifications: true,
      feedbacks: {
        include: {
          academician: {
            include: { user: true },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  // Compute live skill gap for student
  const gapAnalysis = await computeSkillGap(student.id, student.targetRoleId || undefined);

  // Build Word Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: student.institution.name.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Department of ${student.department.name}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: "OFFICIAL STUDENT SKILL & CAREER READINESS DOSSIER",
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            style: "Subtitle",
          }),

          // Student Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Student Name:", bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(student.user.name)],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Register No:", bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(student.registerNumber)],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Email / Phone:", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph(`${student.user.email} | ${student.phone || "N/A"}`)],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Batch / CGPA:", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph(`Batch ${student.batchYear} (Sem ${student.semester}) | CGPA: ${student.cgpa}`)],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Target Career Role:", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph(gapAnalysis.jobRoleTitle)],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Career Readiness Score:", bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph(`${gapAnalysis.careerReadinessScore} / 100 (${gapAnalysis.matchPercentage}% Skill Match)`)],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Section 1: Verified Skills Inventory
          new Paragraph({
            text: "1. Verified Skills Inventory",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Skill Name", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Category", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Proficiency Level", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Experience", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Verification", bold: true })] })] }),
                ],
              }),
              ...student.skills.map(
                (s) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(s.skill.name)] }),
                      new TableCell({ children: [new Paragraph(s.skill.category)] }),
                      new TableCell({ children: [new Paragraph(s.proficiencyLevel)] }),
                      new TableCell({ children: [new Paragraph(`${s.yearsOfExperience} yrs`)] }),
                      new TableCell({ children: [new Paragraph(s.isVerified ? "Verified (Faculty)" : "Self-Reported")] }),
                    ],
                  })
              ),
            ],
          }),

          // Section 2: Skill Gap Analysis
          new Paragraph({
            text: `2. Skill-Gap Analysis for [${gapAnalysis.jobRoleTitle}]`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Target Benchmark: `, bold: true }),
              new TextRun(`${gapAnalysis.totalRequiredSkills} Required Skills | Match Rate: ${gapAnalysis.matchPercentage}%`),
            ],
            spacing: { after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Skill", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Required Level", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Current Level", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gap Status", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Action Priority", bold: true })] })] }),
                ],
              }),
              ...[...gapAnalysis.matchedSkills, ...gapAnalysis.priorityGaps].map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(item.skillName)] }),
                      new TableCell({ children: [new Paragraph(item.requiredProficiency)] }),
                      new TableCell({ children: [new Paragraph(item.studentProficiency || "None")] }),
                      new TableCell({ children: [new Paragraph(item.status.replace("_", " "))] }),
                      new TableCell({ children: [new Paragraph(item.priority)] }),
                    ],
                  })
              ),
            ],
          }),

          // Section 3: Hackathons & Competitive Achievements
          new Paragraph({
            text: "3. Hackathons, Events & Competitions",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          ...(student.achievements.length > 0
            ? [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Event Name", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Host Org", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Outcome", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Prize", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Skills Used", bold: true })] })] }),
                      ],
                    }),
                    ...student.achievements.map(
                      (a) =>
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph(a.eventName)] }),
                            new TableCell({ children: [new Paragraph(a.organization)] }),
                            new TableCell({ children: [new Paragraph(a.participationStatus)] }),
                            new TableCell({ children: [new Paragraph(a.prizeDetails ? `${a.prizeDetails} (₹${a.prizeAmount || 0})` : "N/A")] }),
                            new TableCell({ children: [new Paragraph(a.skillsUsed)] }),
                          ],
                        })
                    ),
                  ],
                }),
              ]
            : [new Paragraph("No hackathon or competition records logged.")]),

          // Section 4: Projects & Internships
          new Paragraph({
            text: "4. Capstone Projects & Industrial Internships",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          ...student.projects.map(
            (p) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `• Project: ${p.title} (${p.role || "Developer"}) - `, bold: true }),
                  new TextRun(`${p.description} [Tech: ${p.skillsUsed}]`),
                ],
                spacing: { after: 50 },
              })
          ),
          ...student.internships.map(
            (i) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `• Internship: ${i.companyName} (${i.role}) - `, bold: true }),
                  new TextRun(i.description || "Industry internship completed successfully."),
                ],
                spacing: { after: 50 },
              })
          ),

          // Section 5: Academician Recommendations & Faculty Sign-off
          new Paragraph({
            text: "5. Faculty Mentorship Remarks & Endorsement",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          ...(student.feedbacks.length > 0
            ? student.feedbacks.map(
                (f) =>
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${f.academician.user.name} (${f.academician.designation}): `, bold: true }),
                      new TextRun(`"${f.comments}"`),
                    ],
                    spacing: { after: 100 },
                  })
              )
            : [
                new Paragraph({
                  text: "Student is actively pursuing recommended courses to bridge identified skill gaps.",
                  spacing: { after: 100 },
                }),
              ]),

          new Paragraph({ text: "", spacing: { after: 400 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Faculty Mentor Signature: ______________________      Date: ______________", bold: true }),
            ],
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
