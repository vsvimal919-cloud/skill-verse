# 🎓 Skill Verse
### AI-Driven Skill Gap Analysis & Industry Opportunity Platform

Skill Verse connects **Students**, **Academicians/Faculty**, and **Industries**. The platform analyzes a student's current competencies, compares them against industry job-role requirements using a deterministic rule-based matching engine, calculates career readiness scores, curates personalized learning roadmaps, and links students with verified opportunities.

---

## 🌟 Key Features

### 👨‍🎓 For Students
- **Profile & Education Management**: Track CGPA, semester, batch year, and target career role.
- **Skills Inventory**: Document technical, soft, and aptitude skills with self-assessed proficiency levels (Beginner to Expert).
- **Hackathons, Events & Prize Evidence**: Log competitive hackathon wins, prize ranks, cash awards (₹), descriptions, and upload official certificates and winning photo proofs.
- **Deterministic Skill-Gap Analysis**: Real-time comparison against benchmark job roles (Data Analyst, Full-Stack Developer, Cloud Engineer) with weighted match percentages and priority gap ranking.
- **Actionable Recommendations**: Curated course recommendations (Coursera, NPTEL, FreeCodeCamp) and capstone project prompts mapped to missing skills.
- **Career Readiness Score**: Multi-factor 0–100 index factoring skills match, completed projects, hackathon achievements, internships, and academics.
- **Public Digital Portfolio**: Verifiable, shareable student portfolio with verified badges and photo proofs.

### 👩‍🏫 For Academicians & Faculty
- **Department Student Roster**: Monitor student competency progression, batch-level readiness, and at-risk students.
- **Skill Endorsement**: 1-click verification of student-reported skills and hackathon achievements.
- **Official Word (.docx) Dossier Generation**: Server-side generation of formal Microsoft Word reports with faculty signature blocks.
- **Mentorship Remarks**: Submit feedback and ratings recorded directly into student dossiers.

### 🏢 For Industry & Employers
- **Job & Internship Postings**: Publish openings with tagged mandatory and preferred skill requirements.
- **Competency-Filtered Talent Discovery**: Filter verified student talent by exact skill tags and minimum CGPA.
- **Applicant Pipeline**: Review match scores and verified portfolios.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Route Handlers (`/api/...`), Zod Validation
- **Database & ORM**: Prisma ORM, SQLite (local) / PostgreSQL (production compatible)
- **Authentication**: JWT Session (`jose`) with HttpOnly Secure Cookies & Role-Based Middleware
- **File Storage**: Secure local disk driver with authenticated streaming routes
- **Reporting**: Server-side Microsoft Word (`docx`) report generator

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 24 LTS recommended)
- npm or yarn or pnpm

### 2. Installation & Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/skill-verse.git
cd skill-verse

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Push database schema & generate Prisma client
npx prisma db push

# Seed master skills, job roles, and demo accounts
npx prisma db seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@apex.edu` | `Password@123` |
| **Faculty / Academician** | `faculty@apex.edu` | `Password@123` |
| **Industry Partner** | `recruiter@nexus.com` | `Password@123` |
| **Institution Admin** | `admin@apex.edu` | `Password@123` |

---

## 📄 License
MIT License. Built for Academia-Industry Collaboration.
