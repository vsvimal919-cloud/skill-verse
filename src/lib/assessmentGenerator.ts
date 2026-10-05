export interface DynamicMCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DynamicAssessmentResult {
  id: string;
  slug: string;
  skillName: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  totalMarks: number;
  isCertificateVerification: boolean;
  mcqQuestions: DynamicMCQ[];
}

/**
 * Clean & normalize a topic/event/certificate name
 */
export function cleanTopicTitle(title: string): string {
  if (!title) return "Engineering & Technology";
  return title
    .replace(/\b(grand finale|final|finals|round \d+|stage \d+|verification pending|pending|level \d+)\b/gi, "")
    .replace(/[([{\-–—].*?[)\]}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Topic Knowledge Base Dictionary covering major academic engineering domains
 */
interface DomainRule {
  keywords: string[];
  domain: string;
  questions: (topic: string) => DynamicMCQ[];
}

const DOMAIN_RULES: DomainRule[] = [
  // 1. Mechanical Engineering, CAD, Robotics, Automobile, Thermal, Manufacturing
  {
    keywords: [
      "mech", "mechanical", "cad", "cam", "autocad", "solidworks", "catia", "ansys",
      "thermal", "robotics", "automation", "manufacturing", "cfd", "finite element",
      "fea", "thermodynamics", "fluid mechanics", "materials science", "hvac", "mechatronics"
    ],
    domain: "Mechanical Engineering & Automation",
    questions: (topic) => [
      {
        id: "mech-q1",
        question: `In engineering applications related to ${topic}, what is the fundamental purpose of conducting Finite Element Analysis (FEA)?`,
        options: [
          "To discretize continuous physical components into finite elements to predict stress, strain, and thermal distribution",
          "To convert 3D CAD geometries directly into assembly line machine code without mathematical validation",
          "To determine solely the visual aesthetics and surface roughness of machined metallic prototypes",
          "To bypass structural safety factors specified by international ASTM/ISO standards",
        ],
        correctIndex: 0,
        explanation: "FEA discretizes complex geometries into finite mesh elements to solve partial differential equations governing stress, strain, and thermal performance.",
      },
      {
        id: "mech-q2",
        question: `According to the Second Law of Thermodynamics relevant to ${topic}, what principle governs heat engine efficiency?`,
        options: [
          "Heat can spontaneously transfer from a lower temperature reservoir to a higher temperature reservoir with zero work",
          "No heat engine operating between two thermal reservoirs can be more efficient than a reversible Carnot engine",
          "Thermal energy is completely convertible into mechanical shaft work without any heat rejection",
          "Entropy of an isolated real system always decreases towards absolute zero",
        ],
        correctIndex: 1,
        explanation: "Carnot's theorem dictates that no engine operating between two given temperatures can be more efficient than a reversible Carnot cycle operating between the same limits.",
      },
      {
        id: "mech-q3",
        question: `When designing kinematic joints or end-effectors in ${topic}, which concept defines the number of independent coordinates needed to describe motion?`,
        options: [
          "Degrees of Freedom (DoF)",
          "Poisson's Ratio",
          "Euler-Bernoulli Deflection Constant",
          "Mach Number Ratio",
        ],
        correctIndex: 0,
        explanation: "Degrees of Freedom (DoF) represent the minimum number of independent coordinates or variables necessary to fully specify the spatial configuration and motion of a mechanical mechanism.",
      },
      {
        id: "mech-q4",
        question: `In modern subtractive and additive manufacturing practices for ${topic}, what does GD&T (Geometric Dimensioning and Tolerancing) regulate?`,
        options: [
          "Only raw material procurement costs and supplier delivery schedules",
          "Geometric variation limits, datum references, form, orientation, and positional tolerances of features",
          "Color rendering and photorealistic shaders in drafting software",
          "The chemical composition of coolant emulsions used during CNC lathe turning",
        ],
        correctIndex: 1,
        explanation: "GD&T specifies permissible geometric variations, form errors, runout, and positional tolerances relative to defined reference datums on engineering components.",
      },
      {
        id: "mech-q5",
        question: `During structural load testing in ${topic}, how is the proportional limit on a stress-strain diagram defined?`,
        options: [
          "The maximum stress beyond which complete instantaneous fracture occurs",
          "The greatest stress that a material is capable of sustaining without any deviation from Hooke's Law",
          "The point where necking begins in ductile mild steel specimens",
          "The ultimate tensile strength (UTS) plateau",
        ],
        correctIndex: 1,
        explanation: "The proportional limit is the highest stress level up to which stress remains strictly directly proportional to strain, upholding Hooke's Law (σ = Eε).",
      },
    ],
  },

  // 2. Electrical & Electronics, Power Systems, Smart Grid, Renewable, Circuit Design
  {
    keywords: [
      "electrical", "eee", "power system", "smart grid", "power electronics", "transformer",
      "motor", "generator", "renewable energy", "solar", "photovoltaic", "wind turbine",
      "high voltage", "transmission", "substation", "switchgear", "circuit breaker", "inverter"
    ],
    domain: "Electrical & Power Systems Engineering",
    questions: (topic) => [
      {
        id: "eee-q1",
        question: `In electrical systems analyzed in ${topic}, why are three-phase transmission networks globally favored over single-phase networks?`,
        options: [
          "Three-phase systems require significantly less conductor material for the same power delivery and deliver constant instantaneous power",
          "Single-phase circuits cannot be transformed to higher voltage levels using AC transformers",
          "Three-phase networks completely eliminate the need for protective grounding and lightning arresters",
          "Power factor in three-phase networks is unconditionally maintained at unity without compensation",
        ],
        correctIndex: 0,
        explanation: "Three-phase transmission delivers continuous constant power, produces rotating magnetic fields in induction machines, and requires less copper/aluminum conductor mass for equivalent power transmission.",
      },
      {
        id: "eee-q2",
        question: `When dealing with power quality and power factor correction in ${topic}, what is the effect of an inductive load?`,
        options: [
          "Current lags voltage, causing a lagging power factor that increases apparent power demand (kVA)",
          "Current leads voltage by 90 degrees, reducing transmission line losses to zero",
          "Voltage drops instantly to zero across inductive reactance",
          "Real power consumption (kW) becomes strictly negative",
        ],
        correctIndex: 0,
        explanation: "Inductive loads draw lagging magnetizing current, leading to a lagging power factor and higher current draw for identical active power (P), requiring capacitor bank correction.",
      },
      {
        id: "eee-q3",
        question: `In modern smart grids and power electronics relevant to ${topic}, what is the primary role of a Pulse Width Modulation (PWM) inverter?`,
        options: [
          "To step down DC voltage into passive resistance without switching",
          "To convert DC power from batteries/solar arrays into synthesized sinusoidal AC power with controlled frequency and amplitude",
          "To eliminate electromagnetic induction inside synchronous generators",
          "To mechanically isolate transmission lines during lightning strikes",
        ],
        correctIndex: 1,
        explanation: "PWM inverters synthesize alternating sinusoidal AC voltage from direct current sources by modulating high-frequency gate drive pulses to control fundamental frequency and voltage output.",
      },
      {
        id: "eee-q4",
        question: `Under symmetrical three-phase fault conditions in ${topic}, how is the fault current magnitude primarily restricted?`,
        options: [
          "By the subtransient and transient reactances of connected synchronous generators and transformer leakage impedances",
          "Solely by atmospheric dielectric permittivity around overhead wires",
          "By the mechanical speed governor setpoint of steam turbines",
          "By consumer branch circuit circuit-breaker ratings",
        ],
        correctIndex: 0,
        explanation: "Symmetrical short-circuit fault current is limited by generator internal reactances (subtransient X\"d, transient X'd) and series transformer/line impedances.",
      },
      {
        id: "eee-q5",
        question: `In renewable energy integration associated with ${topic}, what does Maximum Power Point Tracking (MPPT) accomplish?`,
        options: [
          "Dynamically adjusts electrical operating point of PV arrays to maximize harvested power under varying solar irradiance",
          "Converts solar panels into optical reflection mirrors when battery storage is full",
          "Forces wind turbines to rotate at a strictly constant mechanical RPM regardless of wind velocity",
          "Prevents reverse polarity by grounding the AC grid neutral",
        ],
        correctIndex: 0,
        explanation: "MPPT algorithms (like Perturb & Observe or Incremental Conductance) dynamically tune DC-DC converter impedance to extract maximum instantaneous power from nonlinear PV curves.",
      },
    ],
  },

  // 3. Electronics, Communication, VLSI, Embedded Systems, IoT, Signals
  {
    keywords: [
      "ece", "electronics", "communication", "vlsi", "embedded", "iot", "signal processing",
      "dsp", "fpga", "verilog", "vhdl", "semiconductor", "microcontroller", "arduino",
      "raspberry pi", "rf", "antenna", "wireless", "telecom", "optical fiber", "5g"
    ],
    domain: "Electronics & Communication Engineering",
    questions: (topic) => [
      {
        id: "ece-q1",
        question: `In digital communication and signal processing relevant to ${topic}, what does the Nyquist-Shannon sampling theorem require?`,
        options: [
          "The sampling frequency must be at least twice the highest frequency component of the analog signal to avoid aliasing",
          "Analog signals must be filtered to match the microprocessor's clock crystal frequency",
          "Quantization levels must be limited to powers of ten",
          "Sampling must always be performed in the continuous-time Laplace domain",
        ],
        correctIndex: 0,
        explanation: "The Nyquist-Shannon theorem specifies that fs >= 2*fmax to faithfully reconstruct an analog signal from discrete samples without spectral aliasing.",
      },
      {
        id: "ece-q2",
        question: `In VLSI circuit design and semiconductor technology related to ${topic}, what is the significance of setup time and hold time in flip-flops?`,
        options: [
          "They define the duration data must remain stable before and after the active clock edge to avoid metastability",
          "They represent the thermal cooling interval required between logic gate operations",
          "They indicate the time required to flash firmware onto non-volatile EEPROM memory",
          "They dictate the physical wire spacing between adjacent metal layers on silicon wafers",
        ],
        correctIndex: 0,
        explanation: "Setup time is the minimum duration the data input must be stable prior to the clock edge, while hold time is the duration it must remain stable after the clock edge to prevent metastability.",
      },
      {
        id: "ece-q3",
        question: `When developing embedded IoT devices in ${topic}, which communication protocol is typically preferred for lightweight, low-bandwidth telemetry?`,
        options: [
          "MQTT (Message Queuing Telemetry Transport)",
          "FTP (File Transfer Protocol)",
          "SOAP with XML envelopes over HTTP/1.1",
          "BGP (Border Gateway Protocol)",
        ],
        correctIndex: 0,
        explanation: "MQTT is an extremely lightweight publish/subscribe messaging protocol designed for constrained IoT edge devices with low power and unreliable network connections.",
      },
      {
        id: "ece-q4",
        question: `In RF and wireless communication systems applicable to ${topic}, what does the Signal-to-Noise Ratio (SNR) directly determine according to the Shannon-Hartley theorem?`,
        options: [
          "The theoretical maximum error-free channel capacity (C = B * log2(1 + SNR))",
          "The physical length of half-wave dipole antennas",
          "The operating DC supply voltage of low-noise amplifiers",
          "The modulation index of pure amplitude-modulated carrier waves",
        ],
        correctIndex: 0,
        explanation: "The Shannon-Hartley theorem states that channel capacity C = B * log2(1 + SNR), defining the upper bound on data rate transmitted without error over a noisy channel.",
      },
      {
        id: "ece-q5",
        question: `In microcontroller architecture relevant to ${topic}, what is the primary distinction between Harvard and Von Neumann architectures?`,
        options: [
          "Harvard architecture features physically separate buses and memories for instructions and data, whereas Von Neumann shares a common bus",
          "Von Neumann architecture executes instructions concurrently without an instruction register",
          "Harvard architecture cannot execute compiled C/C++ firmware programs",
          "Von Neumann architecture requires optical fiber interconnections between ALU registers",
        ],
        correctIndex: 0,
        explanation: "Harvard architecture separates instruction and data memories/buses, allowing simultaneous instruction fetch and operand read/write, avoiding the Von Neumann bottleneck.",
      },
    ],
  },

  // 4. Cloud Computing, DevOps, AWS, Azure, GCP, Docker, Kubernetes
  {
    keywords: [
      "aws", "cloud", "devops", "azure", "gcp", "docker", "kubernetes", "k8s",
      "terraform", "ci/cd", "microservices", "serverless", "lambda", "ec2", "s3",
      "container", "ansible", "jenkins", "infrastructure as code"
    ],
    domain: "Cloud Computing & DevOps",
    questions: (topic) => [
      {
        id: "cloud-q1",
        question: `In modern cloud architecture principles relevant to ${topic}, what is the core advantage of designing stateless microservices?`,
        options: [
          "Stateless services allow horizontal scaling by distributing requests across any available replica behind a load balancer without session stickiness",
          "Stateless services eliminate the need for relational databases and persistent disks",
          "Stateless services run exclusively on physical on-premise hardware without virtualization",
          "Stateless services make API endpoints publicly accessible without authentication",
        ],
        correctIndex: 0,
        explanation: "Stateless architectures do not store client session state in server memory, enabling elastic autoscaling, zero-downtime rolling upgrades, and rapid container failover.",
      },
      {
        id: "cloud-q2",
        question: `When orchestrating containerized workloads in ${topic}, what is the primary role of a Kubernetes Pod?`,
        options: [
          "The smallest deployable computing unit in Kubernetes, encapsulating one or more containers sharing network and storage namespaces",
          "A bare-metal hypervisor operating system installed directly on host nodes",
          "A proprietary hardware firewall managing external DNS records",
          "A script that converts Docker images into virtual machine disk images (.vmdk)",
        ],
        correctIndex: 0,
        explanation: "A Pod is the fundamental unit of deployment in Kubernetes, representing a single instance of a running process consisting of one or more co-located containers.",
      },
      {
        id: "cloud-q3",
        question: `Under the Cloud Shared Responsibility Model applied to ${topic}, what is typically managed by the cloud provider in an Infrastructure-as-a-Service (IaaS) offering?`,
        options: [
          "Physical data center security, host virtualization layer, and underlying hardware infrastructure",
          "Customer application source code, user access permissions, and database table schemas",
          "Guest operating system patch management and local firewall rules inside virtual instances",
          "End-user data encryption keys stored in memory",
        ],
        correctIndex: 0,
        explanation: "In IaaS, the provider manages physical facilities, server hardware, storage clusters, and hypervisors; the customer is responsible for guest OS, network configuration, and data.",
      },
      {
        id: "cloud-q4",
        question: `In Continuous Integration and Continuous Deployment (CI/CD) pipelines for ${topic}, what is the objective of automated Canary deployments?`,
        options: [
          "Rolling out software updates to a small subset of production traffic to validate performance and catch regressions before full rollout",
          "Rebuilding the entire database cluster from scratch on every git commit",
          "Forcing developers to manually approve pull requests using two-factor biometric scans",
          "Deleting all historical container images to conserve cloud disk space",
        ],
        correctIndex: 0,
        explanation: "Canary releases deploy updates to a fractional percentage of users, monitoring real-world telemetry (error rates, latency) before migrating all production traffic.",
      },
      {
        id: "cloud-q5",
        question: `In Infrastructure as Code (IaC) tooling (like Terraform or CloudFormation) for ${topic}, what does declarative configuration signify?`,
        options: [
          "Defining the desired end-state infrastructure, allowing the engine to calculate diffs and reconcile resources automatically",
          "Writing step-by-step imperative shell scripts executed sequentially on each server instance",
          "Compiling configuration into binary machine code before execution",
          "Restricting cloud resources to a single availability zone without redundancy",
        ],
        correctIndex: 0,
        explanation: "Declarative IaC declares *what* the target infrastructure should look like; the provider engine determines the dependency graph and API calls needed to reach that state.",
      },
    ],
  },

  // 5. Artificial Intelligence, Machine Learning, Deep Learning, Data Science
  {
    keywords: [
      "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
      "data science", "nlp", "computer vision", "neural network", "pytorch",
      "tensorflow", "llm", "transformer", "bert", "gpt", "generative ai"
    ],
    domain: "Artificial Intelligence & Data Science",
    questions: (topic) => [
      {
        id: "ai-q1",
        question: `In machine learning workflows applied to ${topic}, what is the primary symptom and cause of model overfitting?`,
        options: [
          "The model achieves very high accuracy on training data but fails to generalize to unseen test data because it memorized noise",
          "The model cannot capture underlying patterns on either training or testing data due to low capacity",
          "The training loss increases monotonically with every optimization epoch",
          "The learning rate is set too low to escape a local minimum",
        ],
        correctIndex: 0,
        explanation: "Overfitting occurs when a high-capacity model learns noise and idiosyncrasies of training data, leading to low training error but high test error.",
      },
      {
        id: "ai-q2",
        question: `In Transformer architectures and neural language models relevant to ${topic}, what is the primary role of the Self-Attention mechanism?`,
        options: [
          "To compute dynamic attention weights between every pair of tokens in a sequence, capturing long-range contextual relationships in parallel",
          "To compress input text strictly into a single fixed-length 128-byte hash value",
          "To convert continuous floating-point weights into ternary logic states",
          "To replace backpropagation with genetic evolutionary algorithms",
        ],
        correctIndex: 0,
        explanation: "Self-attention computes attention matrices based on Queries, Keys, and Values across all sequence tokens simultaneously, enabling parallelization and capturing long-range context.",
      },
      {
        id: "ai-q3",
        question: `When evaluating classification performance on an imbalanced dataset in ${topic}, why is standard Accuracy often misleading?`,
        options: [
          "A naive model that always predicts the majority class can yield deceptively high accuracy while missing all positive minority instances",
          "Accuracy cannot be calculated on datasets with more than two outcome classes",
          "Accuracy mathematically penalizes true negative classifications",
          "Accuracy causes gradient explosion during cross-entropy loss computation",
        ],
        correctIndex: 0,
        explanation: "In imbalanced domains (e.g. 99% negative, 1% positive), a trivial model predicting negative achieves 99% accuracy but 0% recall. Metrics like Precision, Recall, and F1-Score are needed.",
      },
      {
        id: "ai-q4",
        question: `What is the role of regularization techniques like Dropout and L2 Weight Decay in training models for ${topic}?`,
        options: [
          "To penalize overly large model weights or randomly deactivate neurons during training to prevent co-adaptation and overfitting",
          "To double the number of trainable parameters in convolutional layers",
          "To eliminate the requirement for labeled training data",
          "To convert supervised models directly into unsupervised reinforcement learners",
        ],
        correctIndex: 0,
        explanation: "Dropout and L2 regularization constrain network complexity, preventing neurons from co-adapting and fostering robust, generalized feature representations.",
      },
      {
        id: "ai-q5",
        question: `During gradient descent optimization in deep learning models for ${topic}, what problem does the Adam optimizer mitigate?`,
        options: [
          "It computes adaptive learning rates for each parameter using running averages of both gradients and squared gradients (momentum + RMSprop)",
          "It guarantees convergence to the global optimum in non-convex loss surfaces within 5 iterations",
          "It eliminates the need for computing Jacobians or backpropagation passes",
          "It completely avoids GPU memory saturation regardless of batch size",
        ],
        correctIndex: 0,
        explanation: "Adam (Adaptive Moment Estimation) combines first-order momentum with second-order gradient scaling (RMSprop), maintaining individual adaptive learning rates for each parameter.",
      },
    ],
  },

  // 6. Project Management, Business, Leadership, Agile, Scrum
  {
    keywords: [
      "management", "project management", "scrum", "agile", "leadership", "pmp",
      "business", "marketing", "finance", "entrepreneurship", "product management",
      "strategy", "consulting", "operations"
    ],
    domain: "Project Management & Strategic Leadership",
    questions: (topic) => [
      {
        id: "mgmt-q1",
        question: `In project management methodologies relevant to ${topic}, what is defined as the Critical Path in a project network diagram?`,
        options: [
          "The longest sequence of dependent activities that determines the shortest possible total project duration, with zero float",
          "The shortest path with the lowest overall financial budget",
          "The collection of optional non-critical tasks that can be postponed indefinitely",
          "The communication channel exclusively reserved for executive stakeholders",
        ],
        correctIndex: 0,
        explanation: "The Critical Path is the sequence of dependent tasks with zero total float (slack); any delay on a critical path task directly delays the project completion date.",
      },
      {
        id: "mgmt-q2",
        question: `In Agile and Scrum frameworks applicable to ${topic}, what is the primary objective of a Sprint Retrospective?`,
        options: [
          "To reflect on the past sprint to inspect processes, team dynamics, and identify continuous improvements for future iterations",
          "To showcase finished product increments directly to client end-users for acceptance testing",
          "To assign performance grades and salary adjustments to individual team members",
          "To rewrite the entire product vision statement and strategic backlog",
        ],
        correctIndex: 0,
        explanation: "The Retrospective provides a structured cadence for the team to inspect how the last sprint went with regards to individuals, interactions, processes, and tools, and agree on improvements.",
      },
      {
        id: "mgmt-q3",
        question: `In risk management planning for ${topic}, what does a Risk Matrix evaluate?`,
        options: [
          "The probability of occurrence versus the potential impact/severity of identified project risks",
          "The daily working hours of remote team contractors across time zones",
          "The historical stock market volatility of project client companies",
          "The software license expiration calendar of developer workstations",
        ],
        correctIndex: 0,
        explanation: "A Risk Matrix categorizes risks by mapping their likelihood (probability) against their consequences (severity/impact) to prioritize mitigation strategies.",
      },
      {
        id: "mgmt-q4",
        question: `In earned value management (EVM) for ${topic}, what does a Cost Performance Index (CPI) greater than 1.0 indicate?`,
        options: [
          "The project is currently under budget, completing more earned value than actual costs incurred",
          "The project has exceeded its approved financial budget significantly",
          "The project schedule is ahead of the target baseline milestones",
          "Project scope has expanded beyond initial contractual boundaries",
        ],
        correctIndex: 0,
        explanation: "CPI = Earned Value (EV) / Actual Cost (AC). A CPI > 1.0 indicates cost efficiency (spending less than planned for the earned work performed).",
      },
      {
        id: "mgmt-q5",
        question: `In organizational leadership and stakeholder management for ${topic}, what is the purpose of a RACI matrix?`,
        options: [
          "Clarifies roles and responsibilities by designating who is Responsible, Accountable, Consulted, and Informed for each activity",
          "Calculates return on investment (ROI) using discounted cash flow analysis",
          "Tracks server CPU utilization across continuous integration nodes",
          "Enforces hierarchical reporting lines and bureaucratic approval gateways",
        ],
        correctIndex: 0,
        explanation: "A RACI matrix clarifies role ambiguity on complex projects by explicitly defining who does the work (R), who owns the outcome (A), who provides expertise (C), and who receives updates (I).",
      },
    ],
  },
];

/**
 * Fallback Generic Synthesizer that works for ANY string (Civil, Chemical, Bio, Arts, Law, etc.)
 */
function createSynthesizedDomainQuestions(cleanTitle: string): DynamicMCQ[] {
  const words = cleanTitle.split(" ").filter((w) => w.length > 2);
  const coreTerm = words.slice(0, 3).join(" ") || cleanTitle;

  return [
    {
      id: `gen-q1-${Date.now()}`,
      question: `In professional applications involving "${coreTerm}", what is the primary industry standard criterion used to ensure quality, compliance, and functional validity?`,
      options: [
        `Systematic adherence to documented technical specifications, international standards, and verified performance benchmarks for ${coreTerm}`,
        `Relying exclusively on ad-hoc empirical assumptions without formal peer review or validation procedures`,
        `Minimizing testing and verification cycles to accelerate ad-hoc deployment timelines`,
        `Disregarding environmental and operational constraints specific to ${coreTerm}`,
      ],
      correctIndex: 0,
      explanation: `Professional excellence in ${coreTerm} mandates adherence to established industry specifications, regulatory benchmarks, and structured verification protocols.`,
    },
    {
      id: `gen-q2-${Date.now()}`,
      question: `When analyzing operational or technical challenges in "${coreTerm}", which methodological principle is essential for identifying root causes?`,
      options: [
        `Structured diagnostic evaluation, data-driven analysis, and isolation of contributing parameters`,
        `Immediate complete replacement of working systems without empirical diagnosis`,
        `Subjective intuition without baseline metrics or performance documentation`,
        `Suppressing historical error telemetry and anomalous test readings`,
      ],
      correctIndex: 0,
      explanation: `Resolving critical challenges in ${coreTerm} requires systematic diagnostic tracking, isolating operational variables, and data-driven root cause analysis.`,
    },
    {
      id: `gen-q3-${Date.now()}`,
      question: `What role does lifecycle sustainability, scalability, and efficiency play in modern implementations of "${coreTerm}"?`,
      options: [
        `It ensures long-term operational viability, resource optimization, and resilience under increased demand`,
        `It represents an obsolete metric superseded by short-term localized prototypes`,
        `It causes systematic degradation of baseline performance parameters`,
        `It is solely applicable to theoretical academic research rather than field implementations`,
      ],
      correctIndex: 0,
      explanation: `Sustainable design and scalable architecture are pivotal in modern ${coreTerm} to maintain efficiency, cost-effectiveness, and operational endurance.`,
    },
    {
      id: `gen-q4-${Date.now()}`,
      question: `In contemporary collaborative projects focusing on "${coreTerm}", what is the critical advantage of modular integration?`,
      options: [
        `Allows independent testing, maintenance, and decoupled upgrades without disrupting the overall system ecosystem`,
        `Forces tight monolithic coupling of all components into a single indivisible artifact`,
        `Increases debugging complexity by eliminating standard interface contracts`,
        `Prevents cross-functional teams from contributing to the project lifecycle`,
      ],
      correctIndex: 0,
      explanation: `Modularity in ${coreTerm} enables teams to build decoupled, testable components that evolve independently while preserving architectural stability.`,
    },
    {
      id: `gen-q5-${Date.now()}`,
      question: `How is continuous improvement and risk mitigation typically structured for projects in "${coreTerm}"?`,
      options: [
        `Through continuous monitoring, iterative feedback loops, security/safety audits, and performance validation`,
        `By freezing development permanently after initial deployment regardless of emerging risks`,
        `By avoiding documentation and relying strictly on verbal team handoffs`,
        `By delegating all quality assurance responsibilities to non-technical stakeholders`,
      ],
      correctIndex: 0,
      explanation: `Continuous verification, empirical feedback loops, and proactive risk assessments maintain the integrity and competitive quality of ${coreTerm} initiatives.`,
    },
  ];
}

/**
 * Universal Assessment Resolver:
 * Accepts ANY arbitrary topic / certificate name, extracts semantic cues,
 * and generates 5 high-quality conceptual MCQs tailored directly to that domain.
 */
export function resolveUniversalAssessment(
  rawTitle: string,
  rawSkill?: string | null
): DynamicAssessmentResult {
  const combinedText = `${rawTitle || ""} ${rawSkill || ""}`.toLowerCase();
  const cleanTitle = cleanTopicTitle(rawTitle) || cleanTopicTitle(rawSkill || "") || "Technical Excellence";

  // Check against known domain rules
  for (const rule of DOMAIN_RULES) {
    const hasMatch = rule.keywords.some((kw) => combinedText.includes(kw));
    if (hasMatch) {
      return {
        id: `verification-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        slug: cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        skillName: cleanTitle,
        title: `Verification Assessment: ${cleanTitle}`,
        description: `Comprehensive conceptual verification evaluation assessing foundational principles and professional competencies in ${cleanTitle} (${rule.domain}).`,
        difficulty: "INTERMEDIATE",
        totalMarks: 100,
        isCertificateVerification: true,
        mcqQuestions: rule.questions(cleanTitle),
      };
    }
  }

  // If not matching any predefined domain keywords, synthesize dynamically from title
  return {
    id: `verification-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    slug: cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    skillName: cleanTitle,
    title: `Verification Assessment: ${cleanTitle}`,
    description: `Targeted conceptual diagnostic quiz evaluating core technical competencies, problem-solving, and professional standards for ${cleanTitle}.`,
    difficulty: "INTERMEDIATE",
    totalMarks: 100,
    isCertificateVerification: true,
    mcqQuestions: createSynthesizedDomainQuestions(cleanTitle),
  };
}
