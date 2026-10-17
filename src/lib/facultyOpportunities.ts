export interface FacultyOpportunity {
  id: string;
  title: string;
  type: "FDP" | "INDUSTRY_SABBATICAL" | "RESEARCH_COLLAB" | "CONSULTANCY";
  provider: string;
  providerCategory: "AICTE_ATAL" | "NPTEL_IIT" | "INDUSTRY" | "RESEARCH_LAB";
  format: "Online (Virtual)" | "Onsite (Campus)" | "Hybrid";
  location: string;
  duration: string;
  durationDays: number;
  creditPoints: number;
  dates: string;
  startDate: string; // ISO date string for auto-logging
  sponsorship: string;
  stipendOrGrant?: string;
  description: string;
  eligibility: string;
  keySkills: string[];
  externalUrl: string;
  isFeatured?: boolean;
}

export const FACULTY_OPPORTUNITIES: FacultyOpportunity[] = [
  {
    id: "opp-aicte-atal-cloud",
    title: "AICTE ATAL FDP: Scalable Cloud Architecture, Microservices & Kubernetes",
    type: "FDP",
    provider: "AICTE ATAL Academy & IIT Hyderabad",
    providerCategory: "AICTE_ATAL",
    format: "Hybrid",
    location: "IIT Hyderabad & Online WebEx",
    duration: "5 Days (30 Contact Hours)",
    durationDays: 5,
    creditPoints: 2.0,
    dates: "Nov 10 - Nov 15, 2026",
    startDate: "2026-11-10",
    sponsorship: "Fully Sponsored by AICTE (Zero Registration Fee) + Certificate of Excellence",
    stipendOrGrant: "TA/DA provided for outstation faculty",
    description:
      "Intensive 5-day national faculty program focusing on enterprise cloud migration, container orchestration with Kubernetes, Istio service meshes, and distributed microservices design with hands-on lab environments.",
    eligibility: "Faculty members from CSE, IT, AI & DS, ECE departments of AICTE approved colleges.",
    keySkills: ["Kubernetes", "Docker", "Microservices", "Cloud Security", "DevOps"],
    externalUrl: "https://www.aicte-india.org/atal",
    isFeatured: true,
  },
  {
    id: "opp-google-cloud-sabbatical",
    title: "Google Cloud Faculty Immersion & Academic Research Sabbatical",
    type: "INDUSTRY_SABBATICAL",
    provider: "Google Cloud for Higher Education",
    providerCategory: "INDUSTRY",
    format: "Onsite (Campus)",
    location: "Google Tech Campus, Bengaluru",
    duration: "4 Weeks (Full Immersion)",
    durationDays: 28,
    creditPoints: 5.0,
    dates: "Dec 01 - Dec 28, 2026",
    startDate: "2026-12-01",
    sponsorship: "Fully Funded Sabbatical Fellowship + ₹75,000 Research Grant Support",
    stipendOrGrant: "₹75,000 Research Honorarium + Google Cloud Credits ($5,000)",
    description:
      "Shadow Google Cloud enterprise architects, collaborate on real-world generative AI and data analytics pipelines, and co-develop cutting-edge academic curriculum modules for university students.",
    eligibility: "Associate Professors / Assistant Professors with minimum 3 years of teaching experience in Computer Science / Data Science.",
    keySkills: ["Google Cloud Vertex AI", "BigQuery", "Distributed Systems", "Enterprise AI"],
    externalUrl: "https://cloud.google.com/edu/faculty",
    isFeatured: true,
  },
  {
    id: "opp-serb-dst-research-grant",
    title: "SERB-DST Collaborative Research Seed Grant in Smart Edge Computing",
    type: "RESEARCH_COLLAB",
    provider: "Science and Engineering Research Board (DST)",
    providerCategory: "RESEARCH_LAB",
    format: "Online (Virtual)",
    location: "DST New Delhi (National Consortium)",
    duration: "1 Year Project Duration",
    durationDays: 14,
    creditPoints: 4.0,
    dates: "Proposals due: Nov 30, 2026",
    startDate: "2026-11-30",
    sponsorship: "Up to ₹15 Lakhs Seed Funding for Hardware, GPU compute & Publication APCs",
    stipendOrGrant: "₹15,00,000 Research Grant",
    description:
      "Government-funded joint research collaboration enabling academic researchers to build edge AI models for smart agriculture, power grids, and low-latency industrial IoT devices with access to national supercomputing facilities.",
    eligibility: "Faculty with Ph.D. or pursuing Ph.D. with at least two peer-reviewed journal publications in Scopus/IEEE.",
    keySkills: ["Edge AI", "Embedded C++", "TinyML", "IoT Sensors", "Deep Learning"],
    externalUrl: "https://serbonline.in/SERB/HomePage",
    isFeatured: true,
  },
  {
    id: "opp-ibm-quantum-consultancy",
    title: "IBM Quantum Educators & Industry Technology Consultancy Track",
    type: "CONSULTANCY",
    provider: "IBM Academic Initiative & Qiskit Foundation",
    providerCategory: "INDUSTRY",
    format: "Online (Virtual)",
    location: "Global Virtual Lab",
    duration: "6 Weeks (Part-time, 4 hrs/week)",
    durationDays: 6,
    creditPoints: 3.0,
    dates: "Nov 20, 2026 - Jan 05, 2027",
    startDate: "2026-11-20",
    sponsorship: "Free Access to Real 127-Qubit Quantum Hardware + IBM Certified Educator Badge",
    stipendOrGrant: "IBM Quantum Cloud Compute Hours ($2,500 equivalent)",
    description:
      "Comprehensive technology enablement for engineering academicians to integrate quantum algorithms, variational quantum eigensolvers, and Qiskit programming into undergraduate laboratory coursework.",
    eligibility: "Faculty with basic linear algebra and Python proficiency; open to CSE, ECE, Physics, and Maths faculty.",
    keySkills: ["Qiskit", "Quantum Algorithms", "Python", "Quantum Cryptography"],
    externalUrl: "https://www.ibm.com/quantum/educators",
  },
  {
    id: "opp-nptel-iitk-genai",
    title: "NPTEL-AICTE FDP: Foundations of Generative AI & Large Language Models",
    type: "FDP",
    provider: "NPTEL & IIT Kanpur",
    providerCategory: "NPTEL_IIT",
    format: "Online (Virtual)",
    location: "SWAYAM Platform",
    duration: "8 Weeks (AICTE Approved FDP equivalent to 1.5 credits)",
    durationDays: 8,
    creditPoints: 2.0,
    dates: "Course Run: Nov 15 - Dec 31, 2026",
    startDate: "2026-11-15",
    sponsorship: "50% Exam Fee Waiver for Recognized SWAYAM-NPTEL Local Chapter Faculty",
    stipendOrGrant: "AICTE FDP Certificate on 60%+ Examination Score",
    description:
      "Deep dive into transformer architectures, attention mechanisms, reinforcement learning from human feedback (RLHF), parameter-efficient fine-tuning (LoRA), and retrieval-augmented generation (RAG).",
    eligibility: "Faculty members, research scholars, and industry mentors across all engineering domains.",
    keySkills: ["PyTorch", "Hugging Face", "RAG", "LangChain", "Vector Databases"],
    externalUrl: "https://nptel.ac.in",
  },
  {
    id: "opp-ti-vlsi-consultancy",
    title: "Texas Instruments Embedded Systems & Mixed-Signal IC Design Fellowship",
    type: "RESEARCH_COLLAB",
    provider: "Texas Instruments University Program & IIT Madras",
    providerCategory: "INDUSTRY",
    format: "Hybrid",
    location: "TI R&D Center, Bengaluru & Virtual",
    duration: "3 Months Collaborative Term",
    durationDays: 12,
    creditPoints: 4.0,
    dates: "Dec 15, 2026 - Mar 15, 2027",
    startDate: "2026-12-15",
    sponsorship: "Hardware Kit Donation (MSP430 & C2000 LaunchPads) + Lab Modernization Grant",
    stipendOrGrant: "₹2,50,000 Lab Equipment Sponsorship",
    description:
      "Hands-on industry research partnership focusing on motor control, power management ICs, and ultra-low-power DSP implementations for automotive and aerospace applications.",
    eligibility: "Faculty members teaching Analog Circuits, Microcontrollers, VLSI, or Power Electronics.",
    keySkills: ["MSP430", "PCB Layout", "Analog Signal Processing", "FPGA"],
    externalUrl: "https://www.ti.com/university",
  },
];
