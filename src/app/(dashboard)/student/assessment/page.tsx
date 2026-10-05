"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Code2,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Award,
  BookOpen,
  ArrowRight,
  FileCode,
  Zap,
  HelpCircle,
  Send,
  Loader2,
  ShieldCheck,
  Check,
} from "lucide-react";

// Dynamically import Monaco Editor to prevent any SSR hydration mismatch
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-xs">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Initializing Monaco Code Editor...
    </div>
  ),
});

function AssessmentInner() {
  const searchParams = useSearchParams();
  const skillParam = searchParams.get("skill");
  const achievementId = searchParams.get("achievementId");
  const skillId = searchParams.get("skillId");
  const certificateName = searchParams.get("name");

  const [profile, setProfile] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("python-diagnostic");
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Assessment flow step: 'mcq' | 'coding' | 'result'
  const [currentStep, setCurrentStep] = useState<"mcq" | "coding" | "result">("mcq");

  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  // Coding Playground state
  const [selectedLang, setSelectedLang] = useState<"python" | "javascript" | "cpp">("python");
  const [code, setCode] = useState("");
  const [customStdin, setCustomStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<{
    stdout: string;
    stderr: string;
    ran?: boolean;
    error?: string;
  } | null>(null);

  // Automated Test Cases state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [testStats, setTestStats] = useState<{ passed: number; total: number } | null>(null);

  // Final score submission state
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  const isCertificateMode = Boolean(achievementId);

  // Map skillParam to matching diagnostic assessment ID
  const matchedAssessmentId = useMemo(() => {
    if (!skillParam) return null;
    const s = skillParam.toLowerCase();
    if (s.includes("c++") || s.includes("cpp") || s === "c") return "cpp-diagnostic";
    if (s.includes("js") || s.includes("javascript") || s.includes("react") || s.includes("node")) return "javascript-diagnostic";
    return "python-diagnostic";
  }, [skillParam]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [profRes, assessRes] = await Promise.all([
          fetch("/api/student/profile"),
          fetch("/api/assessments"),
        ]);
        const profJson = await profRes.json();
        const assessJson = await assessRes.json();

        if (profJson.success) setProfile(profJson.profile);
        if (assessJson.success && assessJson.assessments.length > 0) {
          setAssessments(assessJson.assessments);
        }

        // If certificate verification or custom name/skill is requested, load dynamic assessment directly
        if (isCertificateMode || certificateName || (skillParam && !matchedAssessmentId)) {
          const query = new URLSearchParams();
          if (certificateName) query.set("name", certificateName);
          if (skillParam) query.set("skill", skillParam);
          if (achievementId) query.set("achievementId", achievementId);
          const res = await fetch(`/api/assessments?${query.toString()}`);
          const json = await res.json();
          if (json.success && json.assessment) {
            setAssessment(json.assessment);
            setSelectedAssessmentId(json.assessment.id);
            return;
          }
        }

        const initialId = matchedAssessmentId || assessJson.assessments?.[0]?.id || "python-diagnostic";
        loadAssessmentDetails(initialId);
      } catch (err) {
        console.error("Failed to load assessments", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [matchedAssessmentId, isCertificateMode, certificateName, skillParam, achievementId]);

  const loadAssessmentDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assessments?id=${id}`);
      const json = await res.json();
      if (json.success) {
        setAssessment(json.assessment);
        setSelectedAssessmentId(json.assessment.id);
        setSelectedAnswers({});
        setMcqSubmitted(false);
        setCurrentStep("mcq");
        setCodeOutput(null);
        setTestResults(null);
        setTestStats(null);
        setFinalResult(null);

        // Set default starter code for this assessment if codingChallenge exists
        if (json.assessment.codingChallenge?.starterCode) {
          const defaultLang = json.assessment.slug === "cpp" ? "cpp" : json.assessment.slug === "javascript" ? "javascript" : "python";
          setSelectedLang(defaultLang as any);
          setCode(json.assessment.codingChallenge.starterCode[defaultLang] || "");
        }
      }
    } catch (err) {
      console.error("Failed to load assessment details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: "python" | "javascript" | "cpp") => {
    setSelectedLang(lang);
    if (assessment?.codingChallenge?.starterCode[lang]) {
      setCode(assessment.codingChallenge.starterCode[lang]);
    }
    setCodeOutput(null);
    setTestResults(null);
  };

  const handleResetCode = () => {
    if (confirm("Reset editor to starter code template?")) {
      if (assessment?.codingChallenge?.starterCode[selectedLang]) {
        setCode(assessment.codingChallenge.starterCode[selectedLang]);
      }
      setCodeOutput(null);
      setTestResults(null);
    }
  };

  // Run single custom execution
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeOutput(null);
    setTestResults(null);

    try {
      const res = await fetch("/api/assessments/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLang,
          code,
          stdin: customStdin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCodeOutput({
          stdout: data.stdout || data.output || "Program finished with no output.",
          stderr: data.stderr || "",
          ran: data.ran,
        });
      } else {
        setCodeOutput({
          stdout: "",
          stderr: data.error || "Failed to execute code.",
          error: data.error,
        });
      }
    } catch (err: any) {
      setCodeOutput({
        stdout: "",
        stderr: err.message || "Network error while connecting to sandbox.",
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Run against automated test cases
  const handleRunTestCases = async () => {
    if (!assessment?.codingChallenge?.testCases) return;

    setIsRunningTests(true);
    setTestResults(null);

    try {
      const res = await fetch("/api/assessments/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLang,
          code,
          testCases: assessment.codingChallenge.testCases,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResults(data.testResults);
        setTestStats({
          passed: data.passedCount,
          total: data.totalCount,
        });
      } else {
        alert(data.error || "Error running test cases");
      }
    } catch (err: any) {
      alert("Failed to run automated test cases: " + err.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Calculate MCQ score
  const mcqScore = useMemo(() => {
    if (!assessment?.mcqQuestions || assessment.mcqQuestions.length === 0) return 0;
    let correct = 0;
    assessment.mcqQuestions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    // In Certificate Verification mode: MCQ carries 100 marks (20 marks each for 5 questions)
    // In Standalone Diagnostic mode: MCQ carries 50 marks (10 marks each for 5 questions)
    const maxMcqWeight = isCertificateMode ? 100 : 50;
    return Math.round((correct / assessment.mcqQuestions.length) * maxMcqWeight);
  }, [selectedAnswers, assessment, isCertificateMode]);

  // Calculate Coding score
  const codingScore = useMemo(() => {
    if (isCertificateMode) return 0;
    if (!testStats || testStats.total === 0) return 0;
    return Math.round((testStats.passed / testStats.total) * 50); // 50 marks for Coding
  }, [testStats, isCertificateMode]);

  const totalScore = isCertificateMode ? mcqScore : mcqScore + codingScore;
  const isPassed = totalScore >= 60;

  // Final submit handler — updates both skill and achievement in PostgreSQL
  const handleFinalSubmit = async () => {
    if (!isCertificateMode && !testStats) {
      const confirmSubmitWithoutTests = confirm(
        "You haven't run the automated test cases yet. Running them provides up to 50 marks for the coding challenge. Do you want to submit anyway?"
      );
      if (!confirmSubmitWithoutTests) return;
    }

    setIsSubmittingFinal(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment.id,
          achievementId: achievementId || undefined,
          skillId: skillId || undefined,
          mcqScore,
          codingScore,
          totalScore,
          percentage: totalScore,
          passed: isPassed,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFinalResult(data);
        setCurrentStep("result");
      } else {
        alert(data.error || "Failed to submit assessment results.");
      }
    } catch (err: any) {
      alert("Error submitting assessment: " + err.message);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  if (loading && !assessment) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="font-semibold text-sm">Loading Skill Diagnostic Playground...</span>
        </div>
      </div>
    );
  }

  const verificationTargetName = certificateName || skillParam;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        user={{
          name: profile?.user?.name || "Student",
          email: profile?.user?.email || "",
          role: "STUDENT",
          profileId: profile?.id,
        }}
      />

      {/* VERIFICATION FLOW BANNER */}
      {verificationTargetName && (
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-b border-blue-500/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Direct Proof Verification Test
                </span>
                <h2 className="text-sm font-bold text-white">
                  Verification Quiz for {verificationTargetName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">
                Passing Score: <strong className="text-emerald-400">≥ 60%</strong>
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300">
                Updates PostgreSQL to <strong className="text-emerald-400">Verified</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Header / Controls */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Skill Diagnostic Assessment
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {assessment?.difficulty || "INTERMEDIATE"}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {assessment?.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Skill Selector */}
            <select
              value={selectedAssessmentId}
              onChange={(e) => loadAssessmentDetails(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.skillName} Assessment ({a.difficulty})
                </option>
              ))}
            </select>

            {/* Stepper Buttons */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setCurrentStep("mcq")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  currentStep === "mcq"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {isCertificateMode ? "Verification MCQs" : "1. MCQ Section"}
              </button>
              {!isCertificateMode && (
                <button
                  onClick={() => setCurrentStep("coding")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    currentStep === "coding"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  2. Live Coding Playground
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= STEP 1: MCQ SECTION ================= */}
        {currentStep === "mcq" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    {isCertificateMode
                      ? "Credential Verification: Conceptual Assessment"
                      : "Section 1: Conceptual Diagnostic MCQs"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isCertificateMode
                      ? "Answer these 5 conceptual questions tailored to your achievement domain. Total Weight: 100 Marks (20 marks each). Passing: ≥ 60%."
                      : "Answer these 5 conceptual questions. Total Weight: 50 Marks (10 marks each)."}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Answered:</span>
                  <div className="text-sm font-bold text-blue-400">
                    {Object.keys(selectedAnswers).length} / {assessment?.mcqQuestions?.length || 5}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {assessment?.mcqQuestions?.map((q: any, idx: number) => {
                  const selectedIdx = selectedAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-100 leading-relaxed">
                            {q.question}
                          </h3>

                          {q.codeSnippet && (
                            <pre className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                              <code>{q.codeSnippet}</code>
                            </pre>
                          )}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = selectedIdx === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }));
                              }}
                              className={`p-3 rounded-xl text-left text-xs font-medium border transition flex items-center justify-between group ${
                                isSelected
                                  ? "bg-blue-600/20 border-blue-500 text-blue-200"
                                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <span
                                  className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                    isSelected
                                      ? "bg-blue-500 text-white"
                                      : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation preview if submitted */}
                      {mcqSubmitted && (
                        <div
                          className={`p-3 rounded-lg text-xs mt-3 ${
                            selectedIdx === q.correctIndex
                              ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
                              : "bg-amber-950/40 border border-amber-800/60 text-amber-300"
                          }`}
                        >
                          <span className="font-bold">
                            {selectedIdx === q.correctIndex ? "✓ Correct!" : "✗ Review:"}{" "}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setMcqSubmitted(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Check Answers
                </button>

                {isCertificateMode ? (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmittingFinal}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingFinal ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Assessment & Verify in PostgreSQL
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep("coding")}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                  >
                    Proceed to Live Coding Challenge
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: LIVE CODING PLAYGROUND ================= */}
        {currentStep === "coding" && !isCertificateMode && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Problem Description & Test Cases (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Section 2: Live Code Sandbox
                  </span>
                  <span className="text-xs font-bold text-slate-400">Weight: 50 Marks</span>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    {assessment?.codingChallenge?.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {assessment?.codingChallenge?.description}
                  </p>
                </div>

                {/* Input / Output Formats */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="font-bold text-slate-300 block mb-1">Input Format:</span>
                    <p className="text-slate-400 whitespace-pre-line">
                      {assessment?.codingChallenge?.inputFormat}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="font-bold text-slate-300 block mb-1">Output Format:</span>
                    <p className="text-slate-400 whitespace-pre-line">
                      {assessment?.codingChallenge?.outputFormat}
                    </p>
                  </div>
                </div>

                {/* Constraints */}
                {assessment?.codingChallenge?.constraints?.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-2">Constraints:</span>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                      {assessment.codingChallenge.constraints.map((c: string, idx: number) => (
                        <li key={idx} className="font-mono">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample Examples */}
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2">Sample Example:</span>
                  {assessment?.codingChallenge?.examples?.map((ex: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">
                            Sample Input:
                          </span>
                          <pre className="p-1.5 bg-slate-900 rounded text-emerald-400 overflow-x-auto">
                            {ex.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">
                            Sample Output:
                          </span>
                          <pre className="p-1.5 bg-slate-900 rounded text-blue-400 overflow-x-auto">
                            {ex.output}
                          </pre>
                        </div>
                      </div>
                      {ex.explanation && (
                        <p className="text-[11px] text-slate-400 pt-1">{ex.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Test Cases Runner Pane */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Automated Test Suite
                  </h3>
                  {testStats && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        testStats.passed === testStats.total
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {testStats.passed} / {testStats.total} Passed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  Click &ldquo;Submit & Run Test Cases&rdquo; to evaluate your code against automated test cases.
                </p>

                {testResults && (
                  <div className="space-y-2 pt-2">
                    {testResults.map((tc: any) => (
                      <div
                        key={tc.testCaseNumber}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                          tc.passed
                            ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                            : "bg-red-950/30 border-red-800/60 text-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {tc.passed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-400" />
                            )}
                            Test Case #{tc.testCaseNumber}
                          </span>
                          <span className="text-[10px] uppercase font-mono tracking-wider">
                            {tc.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>

                        {!tc.passed && (
                          <div className="pt-1 space-y-1 font-mono text-[11px]">
                            <div>
                              <span className="text-slate-400">Input: </span>
                              <span className="text-slate-200">{tc.input}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Expected: </span>
                              <span className="text-emerald-400">{tc.expectedOutput}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Actual: </span>
                              <span className="text-red-400">{tc.actualOutput || "(No stdout)"}</span>
                            </div>
                            {tc.stderr && (
                              <div className="text-red-300 whitespace-pre-wrap">{tc.stderr}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: In-Browser Monaco Editor & Execution Terminal (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Editor Toolbar */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Language:
                    </span>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(["python", "javascript", "cpp"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition capitalize ${
                            selectedLang === lang
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {lang === "cpp" ? "C++" : lang === "javascript" ? "JavaScript" : "Python 3"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      title="Reset code template"
                      className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowStdin(!showStdin)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                        showStdin
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      Custom Stdin
                    </button>
                  </div>
                </div>

                {/* Custom Stdin Drawer */}
                {showStdin && (
                  <div className="p-3 bg-slate-950 border-b border-slate-800">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Standard Input (stdin):
                    </label>
                    <textarea
                      value={customStdin}
                      onChange={(e) => setCustomStdin(e.target.value)}
                      placeholder="Enter custom input values to feed into your program..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Monaco Code Editor */}
                <div className="h-[420px] w-full bg-[#1e1e1e]">
                  <Editor
                    height="100%"
                    language={selectedLang === "cpp" ? "cpp" : selectedLang === "javascript" ? "javascript" : "python"}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                      fontSize: 13,
                      lineNumbers: "on",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: "on",
                    }}
                  />
                </div>

                {/* Editor Footer / Action Buttons */}
                <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-blue-400" />
                    Piston Sandbox Engine (Python • JS • C++)
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunningCode || isRunningTests}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isRunningCode ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                      )}
                      Run Code
                    </button>

                    <button
                      onClick={handleRunTestCases}
                      disabled={isRunningTests || isRunningCode}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isRunningTests ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Submit & Run Test Cases
                    </button>
                  </div>
                </div>
              </div>

              {/* Execution Console Output Terminal */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2 font-mono">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                    Terminal Output (stdout / stderr)
                  </span>
                  {codeOutput?.ran && (
                    <span className="text-[10px] text-emerald-400 font-mono">Status: Ran Successfully</span>
                  )}
                </div>

                <div className="p-4 bg-slate-950 font-mono text-xs min-h-[140px] max-h-[220px] overflow-y-auto">
                  {isRunningCode ? (
                    <div className="text-slate-500 flex items-center gap-2 animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      Executing in isolated Piston container...
                    </div>
                  ) : codeOutput ? (
                    <div className="space-y-2">
                      {codeOutput.stdout && (
                        <div className="text-slate-200 whitespace-pre-wrap">{codeOutput.stdout}</div>
                      )}
                      {codeOutput.stderr && (
                        <div className="text-red-400 whitespace-pre-wrap">{codeOutput.stderr}</div>
                      )}
                      {!codeOutput.stdout && !codeOutput.stderr && (
                        <div className="text-slate-500 italic">Program finished with empty output.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-600 italic">
                      Click &ldquo;Run Code&rdquo; or &ldquo;Submit & Run Test Cases&rdquo; to view execution
                      logs here.
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Final Assessment Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400" />
                    Ready to complete this Diagnostic Assessment?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Current Score:{" "}
                    <span className="font-bold text-white">{totalScore}/100</span> (MCQs: {mcqScore}/50,
                    Coding: {codingScore}/50). Passing is 60%.
                  </p>
                </div>

                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmittingFinal}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingFinal ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Assessment & Verify in PostgreSQL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SCORECARD & COMPLETION ================= */}
        {currentStep === "result" && (
          <div className="max-w-2xl mx-auto space-y-6 pt-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
              <div
                className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center border-2 ${
                  isPassed
                    ? "bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-500/20"
                    : "bg-amber-950/60 border-amber-500 text-amber-400 shadow-xl shadow-amber-500/20"
                }`}
              >
                {isPassed ? <Award className="h-10 w-10" /> : <BookOpen className="h-10 w-10" />}
              </div>

              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    isPassed
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : "bg-amber-950 text-amber-300 border-amber-800"
                  }`}
                >
                  {isPassed ? "Assessment Passed • Verified" : "Needs Further Practice"}
                </span>
                <h2 className="text-3xl font-black text-white mt-3">
                  {isPassed ? "Congratulations! Credential Verified" : "Assessment Completed"}
                </h2>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  {finalResult?.message ||
                    (isPassed
                      ? "Both your skill status and certificate proof status have been marked as Verified in PostgreSQL."
                      : "Keep practicing algorithmic challenges and conceptual questions to reach verified status.")}
                </p>
              </div>

              {/* PostgreSQL Verification Confirmation Pill */}
              {isPassed && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>
                    PostgreSQL Updated:{" "}
                    <strong>
                      {achievementId ? "Certificate Proof & Skill Verified" : "Skill Marked as Verified"}
                    </strong>
                  </span>
                </div>
              )}

              {/* Score Breakdown Grid */}
              <div
                className={`grid ${
                  isCertificateMode ? "grid-cols-2" : "grid-cols-3"
                } gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80`}
              >
                <div className="p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">MCQ Score</span>
                  <span className="text-xl font-black text-blue-400">
                    {mcqScore} / {isCertificateMode ? 100 : 50}
                  </span>
                </div>
                {!isCertificateMode && (
                  <div className="p-3 border-x border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Coding Score</span>
                    <span className="text-xl font-black text-emerald-400">{codingScore} / 50</span>
                  </div>
                )}
                <div className="p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Marks</span>
                  <span className="text-xl font-black text-white">{totalScore} / 100</span>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/student/achievements"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                >
                  View Verified Achievements
                </Link>
                <Link
                  href="/student/skills"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition"
                >
                  View Verified Skills
                </Link>
                <Link
                  href="/student/skill-gap"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold text-xs transition"
                >
                  Skill Gap Matrix
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StudentAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            <span className="font-semibold text-sm">Loading Skill Diagnostic Playground...</span>
          </div>
        </div>
      }
    >
      <AssessmentInner />
    </Suspense>
  );
}
