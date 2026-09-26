import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Skill Verse database seeding...");

  // 1. Create Default Institution & Departments
  const institution = await prisma.institution.upsert({
    where: { code: "AIT-001" },
    update: {},
    create: {
      name: "Apex Institute of Technology",
      code: "AIT-001",
      address: "Tech Innovation Campus, Sector 4, Bangalore",
      website: "https://apex.edu",
      contactEmail: "contact@apex.edu",
      isVerified: true,
    },
  });

  const deptCSE = await prisma.department.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "CSE",
      },
    },
    update: {},
    create: {
      name: "Computer Science & Engineering",
      code: "CSE",
      institutionId: institution.id,
    },
  });

  const deptAIDS = await prisma.department.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "AIDS",
      },
    },
    update: {},
    create: {
      name: "Artificial Intelligence & Data Science",
      code: "AIDS",
      institutionId: institution.id,
    },
  });

  // 2. Master Skills Taxonomy
  const skillsData = [
    // Technical Skills
    { name: "Python", slug: "python", category: "TECHNICAL", description: "General-purpose programming language for data analysis, web dev, and AI" },
    { name: "SQL", slug: "sql", category: "TECHNICAL", description: "Structured Query Language for relational database querying and management" },
    { name: "Excel", slug: "excel", category: "TECHNICAL", description: "Spreadsheet tool for data analysis, pivot tables, and financial modeling" },
    { name: "Power BI", slug: "power-bi", category: "TECHNICAL", description: "Business analytics service by Microsoft for interactive visualizations" },
    { name: "Tableau", slug: "tableau", category: "TECHNICAL", description: "Visual analytics platform transforming data into actionable insights" },
    { name: "Statistics", slug: "statistics", category: "TECHNICAL", description: "Statistical methods, probability distributions, hypothesis testing" },
    { name: "HTML & CSS", slug: "html-css", category: "TECHNICAL", description: "Core technologies for building Web pages and styling user interfaces" },
    { name: "JavaScript", slug: "javascript", category: "TECHNICAL", description: "High-level programming language of the Web" },
    { name: "TypeScript", slug: "typescript", category: "TECHNICAL", description: "Typed superset of JavaScript that compiles to plain JavaScript" },
    { name: "React", slug: "react", category: "TECHNICAL", description: "Frontend JavaScript library for building user interfaces" },
    { name: "Next.js", slug: "nextjs", category: "TECHNICAL", description: "The React framework for the Web with SSR and full-stack capabilities" },
    { name: "Node.js", slug: "nodejs", category: "TECHNICAL", description: "JavaScript runtime built on Chrome's V8 JavaScript engine" },
    { name: "Express.js", slug: "express", category: "TECHNICAL", description: "Fast, unopinionated, minimalist web framework for Node.js" },
    { name: "PostgreSQL", slug: "postgresql", category: "TECHNICAL", description: "Advanced open source relational database system" },
    { name: "MongoDB", slug: "mongodb", category: "TECHNICAL", description: "Source-available, cross-platform, document-oriented database" },
    { name: "Docker", slug: "docker", category: "TECHNICAL", description: "Platform for developing, shipping, and running applications in containers" },
    { name: "Kubernetes", slug: "kubernetes", category: "TECHNICAL", description: "Open-source system for automating deployment and scaling of containers" },
    { name: "AWS Cloud", slug: "aws", category: "TECHNICAL", description: "Comprehensive, evolving cloud computing platform by Amazon" },
    { name: "Git & GitHub", slug: "git", category: "TECHNICAL", description: "Distributed version control system and collaboration platform" },
    { name: "Machine Learning", slug: "machine-learning", category: "TECHNICAL", description: "Algorithms that improve automatically through experience and data" },
    { name: "Deep Learning", slug: "deep-learning", category: "TECHNICAL", description: "Neural networks with multiple layers for complex representation learning" },
    { name: "PyTorch", slug: "pytorch", category: "TECHNICAL", description: "Open source machine learning framework based on the Torch library" },
    { name: "Data Structures & Algorithms", slug: "dsa", category: "TECHNICAL", description: "Core computer science fundamentals for efficient computation" },
    { name: "REST APIs", slug: "rest-apis", category: "TECHNICAL", description: "Architectural style for networked hypermedia applications" },

    // Soft Skills
    { name: "Communication", slug: "communication", category: "SOFT", description: "Verbal, written, and presentation skills for professional environments" },
    { name: "Problem Solving", slug: "problem-solving", category: "SOFT", description: "Analytical and systematic approach to resolving complex challenges" },
    { name: "Team Collaboration", slug: "team-collaboration", category: "SOFT", description: "Working constructively in cross-functional team settings" },
    { name: "Critical Thinking", slug: "critical-thinking", category: "SOFT", description: "Objective analysis and evaluation of an issue to form a judgement" },
    { name: "Time Management", slug: "time-management", category: "SOFT", description: "Planning and exercising conscious control over time spent on tasks" },

    // Aptitude Skills
    { name: "Quantitative Aptitude", slug: "quantitative-aptitude", category: "APTITUDE", description: "Numerical reasoning, arithmetic, algebra, and geometry problems" },
    { name: "Logical Reasoning", slug: "logical-reasoning", category: "APTITUDE", description: "Pattern identification, deduction, syllogisms, and sequence analysis" },
    { name: "Verbal Ability", slug: "verbal-ability", category: "APTITUDE", description: "Reading comprehension, grammar, vocabulary, and sentence correction" },
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
    skillMap.set(s.slug, skill.id);
  }

  // 3. Job Roles & Skill Requirements
  const dataAnalystRole = await prisma.jobRole.upsert({
    where: { slug: "data-analyst" },
    update: {},
    create: {
      title: "Data Analyst",
      slug: "data-analyst",
      category: "Data & AI",
      description: "Inspects, cleans, transforms, and models data with the goal of discovering useful information, informing conclusions, and supporting decision-making.",
      minExperienceYears: 0,
      icon: "BarChart3",
    },
  });

  const fullStackRole = await prisma.jobRole.upsert({
    where: { slug: "full-stack-developer" },
    update: {},
    create: {
      title: "Full-Stack Developer",
      slug: "full-stack-developer",
      category: "Software Development",
      description: "Designs and builds end-to-end web applications, encompassing frontend client interfaces, backend APIs, and database architecture.",
      minExperienceYears: 0,
      icon: "Code2",
    },
  });

  const cloudEngineerRole = await prisma.jobRole.upsert({
    where: { slug: "cloud-devops-engineer" },
    update: {},
    create: {
      title: "Cloud & DevOps Engineer",
      slug: "cloud-devops-engineer",
      category: "Cloud & DevOps",
      description: "Automates deployment pipelines, manages cloud infrastructure on AWS, and orchestrates containerized microservices.",
      minExperienceYears: 0,
      icon: "Cloud",
    },
  });

  // Data Analyst Requirements (exact match with user's explicit example):
  // Required: Python, SQL, Excel, Power BI, Statistics
  const dataAnalystReqs = [
    { slug: "python", importance: "MANDATORY", minProficiency: "INTERMEDIATE", weight: 3.0 },
    { slug: "sql", importance: "MANDATORY", minProficiency: "ADVANCED", weight: 3.0 },
    { slug: "excel", importance: "MANDATORY", minProficiency: "ADVANCED", weight: 3.0 },
    { slug: "power-bi", importance: "PREFERRED", minProficiency: "INTERMEDIATE", weight: 2.0 },
    { slug: "statistics", importance: "PREFERRED", minProficiency: "INTERMEDIATE", weight: 2.0 },
    { slug: "tableau", importance: "BONUS", minProficiency: "BEGINNER", weight: 1.0 },
    { slug: "communication", importance: "PREFERRED", minProficiency: "INTERMEDIATE", weight: 1.5 },
  ];

  for (const req of dataAnalystReqs) {
    const skillId = skillMap.get(req.slug);
    if (skillId) {
      await prisma.roleSkillRequirement.upsert({
        where: {
          jobRoleId_skillId: {
            jobRoleId: dataAnalystRole.id,
            skillId,
          },
        },
        update: {},
        create: {
          jobRoleId: dataAnalystRole.id,
          skillId,
          importance: req.importance,
          minProficiency: req.minProficiency,
          weight: req.weight,
        },
      });
    }
  }

  // Full-Stack Developer Requirements
  const fullStackReqs = [
    { slug: "javascript", importance: "MANDATORY", minProficiency: "ADVANCED", weight: 3.0 },
    { slug: "react", importance: "MANDATORY", minProficiency: "ADVANCED", weight: 3.0 },
    { slug: "nodejs", importance: "MANDATORY", minProficiency: "INTERMEDIATE", weight: 3.0 },
    { slug: "sql", importance: "PREFERRED", minProficiency: "INTERMEDIATE", weight: 2.0 },
    { slug: "typescript", importance: "PREFERRED", minProficiency: "INTERMEDIATE", weight: 2.0 },
    { slug: "git", importance: "MANDATORY", minProficiency: "INTERMEDIATE", weight: 2.5 },
    { slug: "docker", importance: "BONUS", minProficiency: "BEGINNER", weight: 1.0 },
  ];

  for (const req of fullStackReqs) {
    const skillId = skillMap.get(req.slug);
    if (skillId) {
      await prisma.roleSkillRequirement.upsert({
        where: {
          jobRoleId_skillId: {
            jobRoleId: fullStackRole.id,
            skillId,
          },
        },
        update: {},
        create: {
          jobRoleId: fullStackRole.id,
          skillId,
          importance: req.importance,
          minProficiency: req.minProficiency,
          weight: req.weight,
        },
      });
    }
  }

  // 4. Learning Resources for Skill Gaps
  const resources = [
    {
      title: "Microsoft Power BI Data Analyst Professional Certificate",
      provider: "Coursera",
      url: "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst",
      slug: "power-bi",
      type: "COURSE",
      durationHours: 40,
      difficultyLevel: "INTERMEDIATE",
    },
    {
      title: "Excel Skills for Business: Advanced",
      provider: "Coursera",
      url: "https://www.coursera.org/learn/excel-advanced",
      slug: "excel",
      type: "COURSE",
      durationHours: 25,
      difficultyLevel: "ADVANCED",
    },
    {
      title: "Statistics and Probability for Data Science",
      provider: "NPTEL",
      url: "https://nptel.ac.in/courses/111105090",
      slug: "statistics",
      type: "COURSE",
      durationHours: 30,
      difficultyLevel: "INTERMEDIATE",
    },
    {
      title: "The Complete SQL Bootcamp: Go from Zero to Hero",
      provider: "Udemy",
      url: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
      slug: "sql",
      type: "COURSE",
      durationHours: 20,
      difficultyLevel: "INTERMEDIATE",
    },
    {
      title: "Python for Data Science and Machine Learning Bootcamp",
      provider: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
      slug: "python",
      type: "TUTORIAL",
      durationHours: 12,
      difficultyLevel: "BEGINNER",
    },
  ];

  for (const res of resources) {
    const skillId = skillMap.get(res.slug);
    if (skillId) {
      await prisma.learningResource.upsert({
        where: { url: res.url },
        update: {},
        create: {
          title: res.title,
          provider: res.provider,
          url: res.url,
          skillId,
          type: res.type,
          durationHours: res.durationHours,
          difficultyLevel: res.difficultyLevel,
        },
      });
    }
  }

  // 5. Recommended Project Ideas
  await prisma.recommendedProjectIdea.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "E-Commerce Customer Churn & Cohort Analysis Dashboard",
        description: "Analyze transaction data using SQL and Python, then build an interactive Power BI dashboard tracking monthly churn rate, customer lifetime value, and cohort retention.",
        targetRoleId: dataAnalystRole.id,
        keySkills: "SQL, Python, Power BI, Excel, Statistics",
        difficultyLevel: "INTERMEDIATE",
      },
      {
        title: "Hospital Operations & Bed Occupancy Forecasting",
        description: "Model admissions data using exploratory data analysis in Python, calculate descriptive statistics in Excel, and generate automated executive KPI reports.",
        targetRoleId: dataAnalystRole.id,
        keySkills: "Python, Excel, Statistics, Power BI",
        difficultyLevel: "INTERMEDIATE",
      },
      {
        title: "Collaborative Real-time Kanban Workspace",
        description: "Build a responsive Next.js web application with optimistic UI updates, drag-and-drop task boards, PostgreSQL database, and role-based permissions.",
        targetRoleId: fullStackRole.id,
        keySkills: "React, TypeScript, Next.js, Node.js, PostgreSQL",
        difficultyLevel: "ADVANCED",
      },
    ],
  });

  // 6. Seed Accounts for All 4 Roles
  const defaultPassword = await bcrypt.hash("Password@123", 10);

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@apex.edu" },
    update: {},
    create: {
      email: "admin@apex.edu",
      name: "Dr. Arthur Vance (Dean/Admin)",
      passwordHash: defaultPassword,
      role: "ADMIN",
    },
  });

  // Academician
  const facultyUser = await prisma.user.upsert({
    where: { email: "faculty@apex.edu" },
    update: {},
    create: {
      email: "faculty@apex.edu",
      name: "Dr. Sarah Chen",
      passwordHash: defaultPassword,
      role: "ACADEMICIAN",
      academicianProfile: {
        create: {
          institutionId: institution.id,
          departmentId: deptCSE.id,
          designation: "Associate Professor & Placement Coordinator",
          employeeId: "FAC-CSE-094",
          specialization: "Data Science & Cloud Computing",
        },
      },
    },
    include: { academicianProfile: true },
  });

  // Industry Partner
  const industryUser = await prisma.user.upsert({
    where: { email: "recruiter@nexus.com" },
    update: {},
    create: {
      email: "recruiter@nexus.com",
      name: "Marcus Vance",
      passwordHash: defaultPassword,
      role: "INDUSTRY",
      industryProfile: {
        create: {
          companyName: "Nexus Analytics & Cloud Solutions",
          industryType: "Information Technology & Services",
          companySize: "500-1000 employees",
          website: "https://nexusanalytics.example.com",
          location: "Bangalore, India",
          description: "Leading enterprise analytics provider delivering AI-driven insights to Global 2000 companies.",
          isVerified: true,
        },
      },
    },
    include: { industryProfile: true },
  });

  // Create Industry Job & Internship Postings (skip if already seeded)
  if (industryUser.industryProfile) {
    const existingPostings = await prisma.industryPosting.count({
      where: { industryId: industryUser.industryProfile.id },
    });

    if (existingPostings === 0) {
      const jobPosting = await prisma.industryPosting.create({
        data: {
          industryId: industryUser.industryProfile.id,
          type: "JOB",
          title: "Junior Data Analyst",
          description: "Join our Business Intelligence squad to analyze cross-platform enterprise datasets, build executive dashboards, and translate business questions into quantitative insights.",
          location: "Bangalore (Hybrid)",
          locationType: "HYBRID",
          stipendOrSalary: "₹ 6.5 LPA - ₹ 8.5 LPA",
          vacancies: 3,
          status: "OPEN",
        },
      });

      const pythonId = skillMap.get("python");
      const sqlId = skillMap.get("sql");
      const powerBiId = skillMap.get("power-bi");
      const excelId = skillMap.get("excel");

      if (pythonId) await prisma.postingSkillRequirement.create({ data: { postingId: jobPosting.id, skillId: pythonId, importance: "MANDATORY", minProficiency: "INTERMEDIATE" } });
      if (sqlId) await prisma.postingSkillRequirement.create({ data: { postingId: jobPosting.id, skillId: sqlId, importance: "MANDATORY", minProficiency: "ADVANCED" } });
      if (powerBiId) await prisma.postingSkillRequirement.create({ data: { postingId: jobPosting.id, skillId: powerBiId, importance: "PREFERRED", minProficiency: "INTERMEDIATE" } });
      if (excelId) await prisma.postingSkillRequirement.create({ data: { postingId: jobPosting.id, skillId: excelId, importance: "MANDATORY", minProficiency: "ADVANCED" } });

      const internshipPosting = await prisma.industryPosting.create({
        data: {
          industryId: industryUser.industryProfile.id,
          type: "INTERNSHIP",
          title: "Full-Stack Engineering Intern",
          description: "Work directly with Senior Engineers to build customer-facing web apps with React, TypeScript, and Node.js.",
          location: "Remote",
          locationType: "REMOTE",
          stipendOrSalary: "₹ 25,000 / month",
          vacancies: 2,
          status: "OPEN",
        },
      });

      const jsId = skillMap.get("javascript");
      const reactId = skillMap.get("react");
      if (jsId) await prisma.postingSkillRequirement.create({ data: { postingId: internshipPosting.id, skillId: jsId, importance: "MANDATORY", minProficiency: "INTERMEDIATE" } });
      if (reactId) await prisma.postingSkillRequirement.create({ data: { postingId: internshipPosting.id, skillId: reactId, importance: "MANDATORY", minProficiency: "INTERMEDIATE" } });
    }
  }

  // Student (Matches user's explicit prompt example: Student skills: Python, SQL, HTML; Target role: Data Analyst)
  const studentUser = await prisma.user.upsert({
    where: { email: "student@apex.edu" },
    update: {},
    create: {
      email: "student@apex.edu",
      name: "Alex Kumar",
      passwordHash: defaultPassword,
      role: "STUDENT",
      studentProfile: {
        create: {
          institutionId: institution.id,
          departmentId: deptCSE.id,
          registerNumber: "2024CSE042",
          batchYear: 2026,
          semester: 6,
          cgpa: 8.75,
          bio: "Aspiring Data Analyst and Full-Stack builder passionate about solving real-world business problems through data-driven decisions.",
          phone: "+91 98765 43210",
          linkedinUrl: "https://linkedin.com/in/alexkumar-dev",
          githubUrl: "https://github.com/alexkumar-dev",
          targetRoleId: dataAnalystRole.id,
          careerReadinessScore: 68.5,
        },
      },
    },
    include: { studentProfile: true },
  });

  // Seed Alex Kumar's Student Skills (Python, SQL, HTML & CSS)
  if (studentUser.studentProfile) {
    const studentId = studentUser.studentProfile.id;
    const pythonId = skillMap.get("python");
    const sqlId = skillMap.get("sql");
    const htmlId = skillMap.get("html-css");

    if (pythonId) {
      await prisma.studentSkill.upsert({
        where: { studentId_skillId: { studentId, skillId: pythonId } },
        update: {},
        create: {
          studentId,
          skillId: pythonId,
          proficiencyLevel: "INTERMEDIATE",
          yearsOfExperience: 1.5,
          isVerified: true,
          verifiedById: facultyUser.academicianProfile?.id,
        },
      });
    }

    if (sqlId) {
      await prisma.studentSkill.upsert({
        where: { studentId_skillId: { studentId, skillId: sqlId } },
        update: {},
        create: {
          studentId,
          skillId: sqlId,
          proficiencyLevel: "ADVANCED",
          yearsOfExperience: 2.0,
          isVerified: true,
          verifiedById: facultyUser.academicianProfile?.id,
        },
      });
    }

    if (htmlId) {
      await prisma.studentSkill.upsert({
        where: { studentId_skillId: { studentId, skillId: htmlId } },
        update: {},
        create: {
          studentId,
          skillId: htmlId,
          proficiencyLevel: "ADVANCED",
          yearsOfExperience: 2.0,
          isVerified: true,
        },
      });
    }

    // Seed Alex's Achievements (skip if already seeded)
    const existingAchievements = await prisma.studentAchievement.count({ where: { studentId } });
    if (existingAchievements === 0) {
      await prisma.studentAchievement.create({
        data: {
          studentId,
          eventName: "Smart India Hackathon 2025 (State Finals)",
          eventType: "HACKATHON",
          organization: "Ministry of Education & AICTE",
          eventDate: new Date("2025-11-15"),
          participationStatus: "WINNER",
          prizeDetails: "1st Prize Gold Trophy & Certificate of Excellence",
          prizeAmount: 50000.0,
          skillsUsed: "Python, SQL, FastApi, Machine Learning",
          description: "Built an AI-driven automated grievance categorization and priority triage system for municipal corporations, reducing citizen turnaround time by 60%.",
          isVerified: true,
        },
      });

      await prisma.studentAchievement.create({
        data: {
          studentId,
          eventName: "CodeStorm 24-Hour National Collegiate Hackathon",
          eventType: "CODING_COMPETITION",
          organization: "IIT Madras TechFest",
          eventDate: new Date("2026-02-10"),
          participationStatus: "RUNNER_UP",
          prizeDetails: "2nd Prize Cash Award & Memento",
          prizeAmount: 25000.0,
          skillsUsed: "React, Node.js, Python, PostgreSQL",
          description: "Developed a distributed carbon footprint tracker for urban logistics fleets with real-time route optimization.",
          isVerified: true,
        },
      });
    }

    // Seed Student Project (skip if already seeded)
    const existingProjects = await prisma.studentProject.count({ where: { studentId } });
    if (existingProjects === 0) {
      await prisma.studentProject.create({
        data: {
          studentId,
          title: "FinTrack: Automated Financial Transaction Classifier",
          description: "Full-stack personal finance tracker parsing bank statements with Python, storing normalized records in SQL, and providing interactive spending charts.",
          role: "Lead Developer",
          repoUrl: "https://github.com/alexkumar-dev/fintrack",
          liveUrl: "https://fintrack-demo.example.com",
          skillsUsed: "Python, SQL, HTML & CSS, JavaScript",
          isOngoing: false,
        },
      });
    }

    // Seed Student Internship (skip if already seeded)
    const existingInternships = await prisma.studentInternship.count({ where: { studentId } });
    if (existingInternships === 0) {
      await prisma.studentInternship.create({
        data: {
          studentId,
          companyName: "DataMetrics Labs",
          role: "Data Engineering Intern",
          location: "Bangalore",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-08-31"),
          isCurrent: false,
          description: "Automated daily ETL pipelines for customer churn ingestion using Python scripts and SQL views, reducing ETL lag by 45%.",
          isVerified: true,
        },
      });
    }

    // Seed Faculty Mentorship Feedback (skip if already seeded)
    if (facultyUser.academicianProfile) {
      const existingFeedback = await prisma.academicianFeedback.count({
        where: { academicianId: facultyUser.academicianProfile.id, studentId },
      });
      if (existingFeedback === 0) {
        await prisma.academicianFeedback.create({
          data: {
            academicianId: facultyUser.academicianProfile.id,
            studentId,
            category: "SKILL_DEVELOPMENT",
            comments: "Alex demonstrates outstanding command over Python and relational SQL. To become fully industry-ready for top-tier Data Analyst roles, focus on mastering Power BI dashboard storytelling and advanced Excel statistical functions.",
            rating: 5,
          },
        });
      }
    }
  }

  console.log("✅ Skill Verse database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
