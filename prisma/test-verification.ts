import { db } from "../src/lib/db";
import { computeSkillGap } from "../src/lib/gap-engine";
import { generateStudentDocxReport } from "../src/lib/reports/docx-generator";

async function runVerification() {
  console.log("=================================================================");
  console.log("🔍 RUNNING AUTOMATED VERIFICATION FOR SKILL VERSE");
  console.log("=================================================================\n");

  // 1. Find Student Alex Kumar
  const studentUser = await db.user.findUnique({
    where: { email: "student@apex.edu" },
    include: {
      studentProfile: {
        include: {
          skills: { include: { skill: true } },
          achievements: true,
          projects: true,
          internships: true,
        },
      },
    },
  });

  if (!studentUser || !studentUser.studentProfile) {
    throw new Error("Student Alex Kumar not found in database.");
  }

  const student = studentUser.studentProfile;
  console.log(`👤 Student: ${studentUser.name} (${student.registerNumber})`);
  console.log(`🎓 Institution: Apex Institute of Technology | CGPA: ${student.cgpa}`);
  console.log(`📚 Current Skills in DB: ${student.skills.map((s) => s.skill.name).join(", ")}`);
  console.log(`🏆 Hackathons Logged: ${student.achievements.map((a) => `${a.eventName} [${a.participationStatus}]`).join(" | ")}`);

  // 2. Run Deterministic Skill Gap against "Data Analyst"
  const dataAnalystRole = await db.jobRole.findUnique({
    where: { slug: "data-analyst" },
  });

  if (!dataAnalystRole) {
    throw new Error("Data Analyst role not found");
  }

  console.log(`\n🎯 Running Skill-Gap Analysis for Role: [${dataAnalystRole.title}]...`);
  const gap = await computeSkillGap(student.id, dataAnalystRole.id);

  console.log("\n--- DETERMINISTIC GAP ANALYSIS RESULTS ---");
  console.log(`• Overall Weighted Match Rate: ${gap.matchPercentage}%`);
  console.log(`• Composite Career Readiness Score: ${gap.careerReadinessScore} / 100`);
  console.log(`• Matched Skills (${gap.matchedSkills.length}): ${gap.matchedSkills.map((s) => `${s.skillName} (${s.studentProficiency})`).join(", ")}`);
  console.log(`• Deficiency / Missing Skills (${gap.priorityGaps.length}):`);
  gap.priorityGaps.forEach((g) => {
    console.log(`   - [${g.priority} PRIORITY] ${g.skillName} (Req: ${g.requiredProficiency}, Status: ${g.status})`);
  });

  console.log(`\n• Curated Learning Recommendations (${gap.recommendedResources.length}):`);
  gap.recommendedResources.forEach((r) => {
    console.log(`   - [${r.provider}] ${r.title} (Skill: ${r.skillName})`);
  });

  console.log(`\n• Recommended Capstone Projects (${gap.recommendedProjects.length}):`);
  gap.recommendedProjects.forEach((p) => {
    console.log(`   - ${p.title} (Tech: ${p.keySkills})`);
  });

  console.log(`\n• Matched Industry Opportunities (${gap.industryOpportunities.length}):`);
  gap.industryOpportunities.forEach((o) => {
    console.log(`   - ${o.title} at ${o.companyName} (${o.matchScore}% Match, ${o.location})`);
  });

  // 3. Test Word Document Generation
  console.log("\n📄 Testing Official Student Dossier (.docx) Generation...");
  const docxBuffer = await generateStudentDocxReport(student.id);
  console.log(`✅ Word Document successfully generated! File buffer size: ${docxBuffer.length} bytes.`);

  console.log("\n=================================================================");
  console.log("🎉 ALL TESTS PASSED WITH 100% SUCCESS!");
  console.log("=================================================================");
}

runVerification()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
