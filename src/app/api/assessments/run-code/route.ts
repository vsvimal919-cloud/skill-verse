import { NextRequest, NextResponse } from "next/server";

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface RunCodeRequest {
  language: string;
  code: string;
  stdin?: string;
  testCases?: TestCase[];
}

// Map frontend language identifiers to Piston v1 language names
function mapLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  switch (normalized) {
    case "python":
    case "python3":
    case "py":
      return "python3";
    case "javascript":
    case "js":
    case "node":
      return "javascript";
    case "cpp":
    case "c++":
    case "c":
      return "c++";
    default:
      return normalized;
  }
}

// Helper to execute a single code snippet on Piston API v1
async function executeOnPiston(language: string, source: string, stdin: string = "") {
  const response = await fetch("https://emkc.org/api/v1/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "SkillVerse-Platform/1.0",
    },
    body: JSON.stringify({
      language,
      source,
      stdin,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      response.status === 429
        ? "Execution engine rate limit reached (2 requests/sec). Please wait a moment and try again."
        : `Execution engine error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return {
    ran: data.ran ?? true,
    language: data.language || language,
    version: data.version || "",
    output: data.output || data.stdout || "",
    stdout: data.stdout || "",
    stderr: data.stderr || "",
  };
}

// Sleep helper to avoid hitting Piston rate limits during automated test runs
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const body: RunCodeRequest = await req.json();
    const { language, code, stdin = "", testCases } = body;

    if (!code || typeof code !== "string" || code.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Source code cannot be empty." },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { success: false, error: "Programming language is required." },
        { status: 400 }
      );
    }

    const mappedLang = mapLanguage(language);

    // Mode 1: Run against automated test cases
    if (Array.isArray(testCases) && testCases.length > 0) {
      const results = [];
      let allPassed = true;
      let lastStdout = "";
      let lastStderr = "";

      for (let i = 0; i < testCases.length; i++) {
        // Enforce a small delay between executions to respect Piston rate limits
        if (i > 0) {
          await delay(350);
        }

        const tc = testCases[i];
        try {
          const execResult = await executeOnPiston(mappedLang, code, tc.input);
          lastStdout = execResult.stdout;
          lastStderr = execResult.stderr;

          const normalizedActual = (execResult.stdout || execResult.output || "").trim();
          const normalizedExpected = (tc.expectedOutput || "").trim();
          const passed = normalizedActual === normalizedExpected && !execResult.stderr;

          if (!passed) {
            allPassed = false;
          }

          results.push({
            testCaseNumber: i + 1,
            input: tc.input,
            expectedOutput: normalizedExpected,
            actualOutput: normalizedActual,
            passed,
            stderr: execResult.stderr,
          });
        } catch (err: any) {
          allPassed = false;
          results.push({
            testCaseNumber: i + 1,
            input: tc.input,
            expectedOutput: tc.expectedOutput.trim(),
            actualOutput: "",
            passed: false,
            stderr: err.message || "Execution failed",
          });
        }
      }

      const passedCount = results.filter((r) => r.passed).length;

      return NextResponse.json({
        success: true,
        mode: "testCases",
        allPassed,
        passedCount,
        totalCount: testCases.length,
        testResults: results,
        stdout: lastStdout,
        stderr: lastStderr,
      });
    }

    // Mode 2: Single freeform execution with custom or empty stdin
    const execResult = await executeOnPiston(mappedLang, code, stdin);

    return NextResponse.json({
      success: true,
      mode: "single",
      language: execResult.language,
      version: execResult.version,
      output: execResult.output,
      stdout: execResult.stdout,
      stderr: execResult.stderr,
      ran: execResult.ran,
    });
  } catch (error: any) {
    console.error("Code execution endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute code on remote sandbox.",
      },
      { status: 500 }
    );
  }
}
