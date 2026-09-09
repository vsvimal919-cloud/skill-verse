import { db } from "./db";

export type ProficiencyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export const PROFICIENCY_NUMERIC: Record<ProficiencyLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

export const IMPORTANCE_WEIGHTS: Record<string, number> = {
  MANDATORY: 3.0,
  PREFERRED: 2.0,
  BONUS: 1.0,
};

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  importance: "MANDATORY" | "PREFERRED" | "BONUS";
  requiredProficiency: ProficiencyLevel;
  studentProficiency?: ProficiencyLevel;
  status: "MATCHED" | "PROFICIENCY_GAP" | "MISSING";
  deficit: number; // 0 if matched, 1-4 if gap/missing
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface SkillGapResult {
  jobRoleId: string;
  jobRoleTitle: string;
  matchPercentage: number;
  careerReadinessScore: number;
  totalRequiredSkills: number;
  matchedCount: number;
  proficiencyGapCount: number;
  missingCount: number;
  matchedSkills: SkillGapItem[];
  proficiencyGapSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  priorityGaps: SkillGapItem[];
  recommendedResources: Array<{
    id: string;
    title: string;
    provider: string;
    url: string;
    skillName: string;
    type: string;
    durationHours?: number | null;
    difficultyLevel: string;
  }>;
  recommendedProjects: Array<{
    id: string;
    title: string;
    description: string;
    keySkills: string;
    difficultyLevel: string;
  }>;
  industryOpportunities: Array<{
    id: string;
    companyName: string;
    title: string;
    type: string;
    location: string;
    stipendOrSalary?: string | null;
    matchScore: number;
  }>;
}

export async function computeSkillGap(
  studentId: string,
  targetRoleId?: string
): Promise<SkillGapResult> {
  // 1. Fetch student with skills, projects, achievements, internships, certs
  const student = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      skills: {
        include: { skill: true },
      },
      achievements: true,
      projects: true,
      internships: true,
      certifications: true,
      targetRole: true,
    },
  });

  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  // 2. Determine target job role
  const effectiveRoleId = targetRoleId || student.targetRoleId;
  let jobRole = null;

  if (effectiveRoleId) {
    jobRole = await db.jobRole.findUnique({
      where: { id: effectiveRoleId },
      include: {
        requirements: {
          include: { skill: true },
        },
        projectIdeas: true,
      },
    });
  }

  // Fallback to first role if not set
  if (!jobRole) {
    jobRole = await db.jobRole.findFirst({
      include: {
        requirements: {
          include: { skill: true },
        },
        projectIdeas: true,
      },
    });
  }

  if (!jobRole) {
    throw new Error("No job roles configured in database. Please run seed script.");
  }

  // 3. Map student skills for fast lookup
  const studentSkillMap = new Map<
    string,
    { proficiency: ProficiencyLevel; isVerified: boolean }
  >();
  for (const s of student.skills) {
    studentSkillMap.set(s.skillId, {
      proficiency: s.proficiencyLevel as ProficiencyLevel,
      isVerified: s.isVerified,
    });
  }

  // 4. Compare requirements
  const matchedSkills: SkillGapItem[] = [];
  const proficiencyGapSkills: SkillGapItem[] = [];
  const missingSkills: SkillGapItem[] = [];

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const req of jobRole.requirements) {
    const weight = IMPORTANCE_WEIGHTS[req.importance] ?? req.weight ?? 1.0;
    totalWeight += weight;

    const reqProf = req.minProficiency as ProficiencyLevel;
    const reqNum = PROFICIENCY_NUMERIC[reqProf] || 2;
    const stu = studentSkillMap.get(req.skillId);

    if (stu) {
      const stuNum = PROFICIENCY_NUMERIC[stu.proficiency] || 1;

      if (stuNum >= reqNum) {
        // Matched
        earnedWeight += weight;
        matchedSkills.push({
          skillId: req.skillId,
          skillName: req.skill.name,
          category: req.skill.category,
          importance: req.importance as "MANDATORY" | "PREFERRED" | "BONUS",
          requiredProficiency: reqProf,
          studentProficiency: stu.proficiency,
          status: "MATCHED",
          deficit: 0,
          priority: "LOW",
        });
      } else {
        // Proficiency Gap
        const deficit = reqNum - stuNum;
        earnedWeight += weight * (stuNum / reqNum);

        const priority: "HIGH" | "MEDIUM" | "LOW" =
          req.importance === "MANDATORY" ? "HIGH" : "MEDIUM";

        proficiencyGapSkills.push({
          skillId: req.skillId,
          skillName: req.skill.name,
          category: req.skill.category,
          importance: req.importance as "MANDATORY" | "PREFERRED" | "BONUS",
          requiredProficiency: reqProf,
          studentProficiency: stu.proficiency,
          status: "PROFICIENCY_GAP",
          deficit,
          priority,
        });
      }
    } else {
      // Missing Skill
      const priority: "HIGH" | "MEDIUM" | "LOW" =
        req.importance === "MANDATORY"
          ? "HIGH"
          : req.importance === "PREFERRED"
          ? "MEDIUM"
          : "LOW";

      missingSkills.push({
        skillId: req.skillId,
        skillName: req.skill.name,
        category: req.skill.category,
        importance: req.importance as "MANDATORY" | "PREFERRED" | "BONUS",
        requiredProficiency: reqProf,
        status: "MISSING",
        deficit: reqNum,
        priority,
      });
    }
  }

  // 5. Match Percentage calculation
  const matchPercentage =
    totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100 * 10) / 10 : 0;

  // 6. Priority Gaps: Ranked list of missing and deficit skills
  const priorityGaps = [...missingSkills, ...proficiencyGapSkills].sort((a, b) => {
    const pRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (pRank[b.priority] !== pRank[a.priority]) {
      return pRank[b.priority] - pRank[a.priority];
    }
    return b.deficit - a.deficit;
  });

  // 7. Multi-factor Career Readiness Score (0 to 100)
  // - Role Match Percentage: 40 pts max
  const roleMatchPts = (matchPercentage / 100) * 40;

  // - Projects: 20 pts max (4 pts per project, bonus for repo & live links)
  let projectPts = 0;
  for (const p of student.projects) {
    let pScore = 3;
    if (p.repoUrl) pScore += 1;
    if (p.liveUrl) pScore += 1;
    projectPts += pScore;
  }
  projectPts = Math.min(20, projectPts);

  // - Hackathons & Achievements: 15 pts max
  let achievementPts = 0;
  for (const a of student.achievements) {
    if (a.participationStatus === "WINNER") achievementPts += 8;
    else if (a.participationStatus === "RUNNER_UP") achievementPts += 6;
    else if (a.participationStatus === "FINALIST") achievementPts += 4;
    else achievementPts += 2;
  }
  achievementPts = Math.min(15, achievementPts);

  // - Internships: 15 pts max (8 pts for 1st, 7 pts for 2nd+)
  const internshipPts = Math.min(15, student.internships.length * 8);

  // - Certifications & Academics: 10 pts max
  const certPts = Math.min(5, student.certifications.length * 2.5);
  const gpaPts = Math.min(5, (student.cgpa / 10) * 5);
  const academicPts = certPts + gpaPts;

  const careerReadinessScore = Math.round(
    roleMatchPts + projectPts + achievementPts + internshipPts + academicPts
  );

  // 8. Pull targeted Learning Resources for priority gap skills
  const gapSkillIds = priorityGaps.map((g) => g.skillId);
  const resources = await db.learningResource.findMany({
    where: {
      skillId: { in: gapSkillIds },
    },
    include: { skill: true },
    take: 6,
  });

  const recommendedResources = resources.map((r) => ({
    id: r.id,
    title: r.title,
    provider: r.provider,
    url: r.url,
    skillName: r.skill.name,
    type: r.type,
    durationHours: r.durationHours,
    difficultyLevel: r.difficultyLevel,
  }));

  // 9. Recommended Projects
  const recommendedProjects = jobRole.projectIdeas.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    keySkills: p.keySkills,
    difficultyLevel: p.difficultyLevel,
  }));

  // 10. Industry Opportunities (matched jobs & internships)
  const openPostings = await db.industryPosting.findMany({
    where: { status: "OPEN" },
    include: {
      industry: true,
      requirements: {
        include: { skill: true },
      },
    },
    take: 5,
  });

  const industryOpportunities = openPostings.map((p) => {
    // Quick match against student skills
    let pMatch = 0;
    if (p.requirements.length > 0) {
      let matchedReqs = 0;
      for (const req of p.requirements) {
        if (studentSkillMap.has(req.skillId)) matchedReqs++;
      }
      pMatch = Math.round((matchedReqs / p.requirements.length) * 100);
    }
    return {
      id: p.id,
      companyName: p.industry.companyName,
      title: p.title,
      type: p.type,
      location: p.location,
      stipendOrSalary: p.stipendOrSalary,
      matchScore: pMatch,
    };
  });

  // 11. Async snapshot update
  await db.studentProfile.update({
    where: { id: studentId },
    data: {
      careerReadinessScore,
      targetRoleId: jobRole.id,
    },
  });

  return {
    jobRoleId: jobRole.id,
    jobRoleTitle: jobRole.title,
    matchPercentage,
    careerReadinessScore,
    totalRequiredSkills: jobRole.requirements.length,
    matchedCount: matchedSkills.length,
    proficiencyGapCount: proficiencyGapSkills.length,
    missingCount: missingSkills.length,
    matchedSkills,
    proficiencyGapSkills,
    missingSkills,
    priorityGaps,
    recommendedResources,
    recommendedProjects,
    industryOpportunities,
  };
}
