import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface MCQQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodingTestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    python: string;
    javascript: string;
    cpp: string;
  };
  testCases: CodingTestCase[];
}

export interface DiagnosticAssessment {
  id: string;
  slug: string;
  skillName: string;
  title: string;
  description: string;
  difficulty: string;
  totalMarks: number;
  mcqQuestions: MCQQuestion[];
  codingChallenge: CodingChallenge;
}

export const DIAGNOSTIC_ASSESSMENTS: DiagnosticAssessment[] = [
  {
    id: "python-diagnostic",
    slug: "python",
    skillName: "Python",
    title: "Python 3 Diagnostic & Algorithmic Proficiency",
    description: "Evaluates core Python fundamentals, data structure manipulation, list comprehensions, and algorithmic problem solving.",
    difficulty: "INTERMEDIATE",
    totalMarks: 100,
    mcqQuestions: [
      {
        id: "py-q1",
        question: "What is the output of the following list comprehension in Python?",
        codeSnippet: "nums = [1, 2, 3, 4, 5]\nres = [x * 2 for x in nums if x % 2 != 0]\nprint(res)",
        options: ["[2, 4, 6, 8, 10]", "[2, 6, 10]", "[4, 8]", "[1, 3, 5]"],
        correctIndex: 1,
        explanation: "The filter `x % 2 != 0` selects odd numbers (1, 3, 5), which are then multiplied by 2 to yield [2, 6, 10].",
      },
      {
        id: "py-q2",
        question: "Which of the following data structures in Python is immutable?",
        options: ["list", "dict", "tuple", "set"],
        correctIndex: 2,
        explanation: "A tuple in Python is immutable once instantiated. Lists, dictionaries, and sets can be mutated in place.",
      },
      {
        id: "py-q3",
        question: "What is the average time complexity of searching for a key in a Python dict?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctIndex: 0,
        explanation: "Python dictionaries use hash tables under the hood, yielding O(1) average time complexity for key lookups.",
      },
      {
        id: "py-q4",
        question: "What does the `yield` keyword do in a Python function?",
        options: [
          "Terminates the program execution immediately",
          "Converts the function into a generator that produces values on demand",
          "Imports an asynchronous coroutine thread",
          "Re-raises an unhandled runtime exception",
        ],
        correctIndex: 1,
        explanation: "The `yield` keyword turns a standard function into a generator iterator, yielding items lazily without keeping the entire sequence in memory.",
      },
      {
        id: "py-q5",
        question: "What will `bool([0])` evaluate to in Python?",
        options: ["False", "True", "TypeError", "None"],
        correctIndex: 1,
        explanation: "In Python, non-empty collections evaluate to True. Even though the element inside is 0, the list itself has length 1, so it is truthy.",
      },
    ],
    codingChallenge: {
      id: "py-challenge-1",
      title: "Target Sum Indices Pair",
      difficulty: "MEDIUM",
      description:
        "Given a list of space-separated integers on the first line and a target integer on the second line, find the zero-based indices of the two numbers such that they add up to the target. Print the smaller index followed by the larger index separated by a space. Assume exactly one valid pair exists.",
      inputFormat: "First line: space-separated integers.\nSecond line: target integer.",
      outputFormat: "Two space-separated integers representing the indices.",
      constraints: ["2 <= Array length <= 10^4", "-10^9 <= Value <= 10^9"],
      examples: [
        {
          input: "2 7 11 15\n9",
          output: "0 1",
          explanation: "nums[0] + nums[1] = 2 + 7 = 9. Output is 0 1.",
        },
        {
          input: "3 2 4\n6",
          output: "1 2",
          explanation: "nums[1] + nums[2] = 2 + 4 = 6. Output is 1 2.",
        },
      ],
      starterCode: {
        python: `# Python 3 Solution Template
import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    # Target is the last element; array elements come before
    target = int(input_data[-1])
    nums = [int(x) for x in input_data[:-1]]
    
    # TODO: Find the indices i < j such that nums[i] + nums[j] == target
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    solve()
`,
        javascript: `// JavaScript (Node.js) Solution Template
const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length < 2) return;
    
    const target = parseInt(input[input.length - 1], 10);
    const nums = input.slice(0, -1).map(Number);
    
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            console.log(map.get(diff) + ' ' + i);
            return;
        }
        map.set(nums[i], i);
    }
}

solve();
`,
        cpp: `// C++ Solution Template
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> nums;
    int val;
    while (cin >> val) {
        nums.push_back(val);
    }
    if (nums.size() < 2) return 0;
    
    int target = nums.back();
    nums.pop_back();
    
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            cout << seen[complement] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}
`,
      },
      testCases: [
        {
          input: "2 7 11 15\n9",
          expectedOutput: "0 1",
        },
        {
          input: "3 2 4\n6",
          expectedOutput: "1 2",
        },
        {
          input: "3 3\n6",
          expectedOutput: "0 1",
        },
        {
          input: "10 20 30 40 50\n70",
          expectedOutput: "1 4",
          isHidden: true,
        },
        {
          input: "1 5 8 12 14\n22",
          expectedOutput: "2 4",
          isHidden: true,
        },
      ],
    },
  },
  {
    id: "javascript-diagnostic",
    slug: "javascript",
    skillName: "JavaScript",
    title: "Modern JavaScript & Asynchronous Programming",
    description: "Evaluates closures, event loop execution order, promises, modern array methods, and algorithmic problem solving.",
    difficulty: "INTERMEDIATE",
    totalMarks: 100,
    mcqQuestions: [
      {
        id: "js-q1",
        question: "What will `console.log(typeof NaN)` output in JavaScript?",
        options: ["'number'", "'nan'", "'undefined'", "'object'"],
        correctIndex: 0,
        explanation: "In JavaScript, NaN stands for 'Not a Number', but its primitive type according to the IEEE 754 floating-point specification is 'number'.",
      },
      {
        id: "js-q2",
        question: "What is the output order of this script?",
        codeSnippet: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
        options: ["1, 2, 3, 4", "1, 4, 2, 3", "1, 4, 3, 2", "1, 3, 4, 2"],
        correctIndex: 2,
        explanation: "Synchronous code runs first (1, 4), then microtasks in the Promise queue (3), and finally macrotasks like setTimeout (2). Output: 1, 4, 3, 2.",
      },
      {
        id: "js-q3",
        question: "Which keyword prevents variables from being re-assigned while maintaining block scope?",
        options: ["var", "let", "const", "static"],
        correctIndex: 2,
        explanation: "`const` declares block-scoped variables that cannot be reassigned after declaration.",
      },
      {
        id: "js-q4",
        question: "What does `Array.prototype.reduce()` return when provided with an accumulator function?",
        options: [
          "A new array containing only filtered elements",
          "A single aggregated output value",
          "A boolean stating whether elements passed test",
          "An iterator object",
        ],
        correctIndex: 1,
        explanation: "`reduce()` executes a reducer callback function on each element of the array, resulting in a single return value.",
      },
      {
        id: "js-q5",
        question: "What is a closure in JavaScript?",
        options: [
          "A syntax for immediately stopping event propagation",
          "A combination of a function bundled together with references to its surrounding lexical environment",
          "A method to close opened file streams",
          "A CSS property for hiding modal dialogs",
        ],
        correctIndex: 1,
        explanation: "A closure gives an inner function access to an outer function's scope, even after the outer function has finished executing.",
      },
    ],
    codingChallenge: {
      id: "js-challenge-1",
      title: "Count Character Frequencies",
      difficulty: "EASY",
      description:
        "Given a single string of lowercase alphabetic characters, count the frequency of each character and print them in alphabetical order. For each unique character, print `character:count` on a new line.",
      inputFormat: "A single string containing lowercase alphabetic characters.",
      outputFormat: "Lines formatted as `c:count` in ascending alphabetical order.",
      constraints: ["1 <= String length <= 10^5", "String contains only letters a-z"],
      examples: [
        {
          input: "banana",
          output: "a:3\nb:1\nn:2",
          explanation: "In 'banana', 'a' appears 3 times, 'b' appears 1 time, and 'n' appears 2 times.",
        },
      ],
      starterCode: {
        javascript: `// JavaScript (Node.js) Solution
const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    
    const freq = {};
    for (const char of input) {
        if (/[a-z]/.test(char)) {
            freq[char] = (freq[char] || 0) + 1;
        }
    }
    
    const sortedKeys = Object.keys(freq).sort();
    for (const k of sortedKeys) {
        console.log(\`\${k}:\${freq[k]}\`);
    }
}

solve();
`,
        python: `# Python 3 Solution
import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return
    freq = {}
    for c in s:
        if 'a' <= c <= 'z':
            freq[c] = freq.get(c, 0) + 1
    
    for k in sorted(freq.keys()):
        print(f"{k}:{freq[k]}")

if __name__ == "__main__":
    solve()
`,
        cpp: `// C++ Solution
#include <iostream>
#include <string>
#include <map>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    
    map<char, int> freq;
    for (char c : s) {
        if (c >= 'a' && c <= 'z') {
            freq[c]++;
        }
    }
    for (auto const& [k, v] : freq) {
        cout << k << ":" << v << "\n";
    }
    return 0;
}
`,
      },
      testCases: [
        {
          input: "banana",
          expectedOutput: "a:3\nb:1\nn:2",
        },
        {
          input: "skillverse",
          expectedOutput: "e:2\ni:1\nk:1\nl:2\nr:1\ns:2\nv:1",
        },
        {
          input: "racecar",
          expectedOutput: "a:2\nc:2\ne:1\nr:2",
          isHidden: true,
        },
      ],
    },
  },
  {
    id: "cpp-diagnostic",
    slug: "cpp",
    skillName: "C++",
    title: "C++ Systems, Memory & STL Proficiency",
    description: "Evaluates pointer semantics, virtual tables, Standard Template Library (STL) algorithms, and efficient data structure design.",
    difficulty: "ADVANCED",
    totalMarks: 100,
    mcqQuestions: [
      {
        id: "cpp-q1",
        question: "What is the primary benefit of declaring a base class destructor as `virtual`?",
        options: [
          "Increases compilation speed",
          "Ensures proper derived class destructor invocation when deleting via base pointer",
          "Allows the destructor to accept multiple arguments",
          "Allocates the class instance on the stack automatically",
        ],
        correctIndex: 1,
        explanation: "If a base class destructor is not virtual, deleting a derived class object through a pointer to the base class results in undefined behavior and resource leaks.",
      },
      {
        id: "cpp-q2",
        question: "What does RAII stand for in modern C++?",
        options: [
          "Resource Allocation Is Initialization",
          "Rapid Application Interface Integration",
          "Realtime Asynchronous Input Iterator",
          "Recursive Algorithm Index Instantiation",
        ],
        correctIndex: 0,
        explanation: "RAII stands for Resource Acquisition Is Initialization, tying resource lifespan (memory, file handles, locks) to object lifetime.",
      },
      {
        id: "cpp-q3",
        question: "Which STL container guarantees constant O(1) random access by index?",
        options: ["std::list", "std::vector", "std::set", "std::forward_list"],
        correctIndex: 1,
        explanation: "`std::vector` stores elements contiguously in heap memory, providing O(1) indexed random access `v[i]`.",
      },
      {
        id: "cpp-q4",
        question: "What is the size of an empty struct/class in C++?",
        options: ["0 bytes", "1 byte", "4 bytes", "Compiler error"],
        correctIndex: 1,
        explanation: "In C++, an empty struct or class occupies at least 1 byte so that distinct object instances have unique memory addresses.",
      },
      {
        id: "cpp-q5",
        question: "Which smart pointer in modern C++ represents exclusive ownership of a dynamically allocated resource?",
        options: ["std::shared_ptr", "std::weak_ptr", "std::unique_ptr", "std::auto_ptr"],
        correctIndex: 2,
        explanation: "`std::unique_ptr` maintains strict single ownership of an object and cannot be copied, only moved.",
      },
    ],
    codingChallenge: {
      id: "cpp-challenge-1",
      title: "Valid Palindrome String",
      difficulty: "EASY",
      description:
        "Given a single-line string, determine if it is a palindrome considering only alphanumeric characters and ignoring cases. Print `YES` if it is a valid palindrome, or `NO` otherwise.",
      inputFormat: "A single line containing an alphanumeric string.",
      outputFormat: "`YES` or `NO`.",
      constraints: ["1 <= Length <= 10^5"],
      examples: [
        {
          input: "A man, a plan, a canal: Panama",
          output: "YES",
          explanation: "'amanaplanacanalpanama' is a palindrome.",
        },
        {
          input: "race a car",
          output: "NO",
          explanation: "'raceacar' is not a palindrome.",
        },
      ],
      starterCode: {
        cpp: `// C++ Solution
#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string raw;
    getline(cin, raw);
    
    string filtered = "";
    for (char c : raw) {
        if (isalnum(c)) {
            filtered += tolower(c);
        }
    }
    
    int left = 0, right = (int)filtered.length() - 1;
    bool isPalindrome = true;
    while (left < right) {
        if (filtered[left] != filtered[right]) {
            isPalindrome = false;
            break;
        }
        left++;
        right--;
    }
    
    cout << (isPalindrome ? "YES" : "NO") << endl;
    return 0;
}
`,
        python: `# Python 3 Solution
import sys

def solve():
    s = sys.stdin.read().strip()
    filtered = [c.lower() for c in s if c.isalnum()]
    if filtered == filtered[::-1]:
        print("YES")
    else:
        print("NO")

if __name__ == "__main__":
    solve()
`,
        javascript: `// JavaScript (Node.js) Solution
const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    const filtered = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const reversed = filtered.split('').reverse().join('');
    console.log(filtered === reversed ? 'YES' : 'NO');
}

solve();
`,
      },
      testCases: [
        {
          input: "A man, a plan, a canal: Panama",
          expectedOutput: "YES",
        },
        {
          input: "race a car",
          expectedOutput: "NO",
        },
        {
          input: "Was it a car or a cat I saw?",
          expectedOutput: "YES",
          isHidden: true,
        },
      ],
    },
  },
];

// GET: Returns list of available assessments or single assessment by ?id=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("id");

    if (assessmentId) {
      const found = DIAGNOSTIC_ASSESSMENTS.find(
        (a) => a.id === assessmentId || a.slug === assessmentId
      );
      if (!found) {
        return NextResponse.json(
          { success: false, error: "Assessment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, assessment: found });
    }

    return NextResponse.json({
      success: true,
      assessments: DIAGNOSTIC_ASSESSMENTS.map((a) => ({
        id: a.id,
        slug: a.slug,
        skillName: a.skillName,
        title: a.title,
        description: a.description,
        difficulty: a.difficulty,
        totalMarks: a.totalMarks,
        mcqCount: a.mcqQuestions.length,
        codingChallengeTitle: a.codingChallenge.title,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load assessments" },
      { status: 500 }
    );
  }
}

// POST: Record student assessment result & update career readiness
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Student session required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      assessmentId,
      achievementId,
      skillId,
      mcqScore,
      codingScore,
      totalScore,
      passed,
      percentage,
    } = body;

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Upsert SkillAssessment in DB if it doesn't exist yet
    const assessmentData = DIAGNOSTIC_ASSESSMENTS.find((a) => a.id === assessmentId);
    let dbAssessment = await db.skillAssessment.findFirst({
      where: { id: assessmentId },
    });

    if (!dbAssessment && assessmentData) {
      // Find or create matching skill in DB
      let skill = await db.skill.findFirst({
        where: {
          OR: [
            { slug: assessmentData.slug },
            { name: { equals: assessmentData.skillName, mode: "insensitive" } },
          ],
        },
      });

      if (!skill) {
        skill = await db.skill.create({
          data: {
            name: assessmentData.skillName,
            slug: assessmentData.slug,
            category: "TECHNICAL",
            description: assessmentData.description,
            isVerified: true,
          },
        });
      }

      dbAssessment = await db.skillAssessment.create({
        data: {
          id: assessmentData.id,
          title: assessmentData.title,
          skillId: skill.id,
          totalMarks: assessmentData.totalMarks,
          passingMarks: 60,
          questionsJson: JSON.stringify(assessmentData.mcqQuestions),
        },
      });
    }

    let savedResult = null;
    if (dbAssessment) {
      savedResult = await db.studentAssessmentResult.create({
        data: {
          studentId: studentProfile.id,
          assessmentId: dbAssessment.id,
          score: Math.round(totalScore),
          percentage: Number(percentage.toFixed(1)),
          passed: Boolean(passed),
        },
      });
    }

    // If passed (score >= 60%), update both skill status AND certificate proof status to "Verified" in PostgreSQL
    if (passed) {
      // 1. Verify the specific skill in PostgreSQL
      let targetSkill = null;
      if (skillId) {
        targetSkill = await db.skill.findUnique({ where: { id: skillId } });
      }
      if (!targetSkill && assessmentData?.slug) {
        targetSkill = await db.skill.findFirst({
          where: {
            OR: [
              { slug: assessmentData.slug },
              { name: { equals: assessmentData.skillName, mode: "insensitive" } },
            ],
          },
        });
      }

      if (targetSkill) {
        await db.studentSkill.upsert({
          where: {
            studentId_skillId: {
              studentId: studentProfile.id,
              skillId: targetSkill.id,
            },
          },
          update: {
            isVerified: true,
            proficiencyLevel: percentage >= 85 ? "ADVANCED" : "INTERMEDIATE",
          },
          create: {
            studentId: studentProfile.id,
            skillId: targetSkill.id,
            proficiencyLevel: percentage >= 85 ? "ADVANCED" : "INTERMEDIATE",
            yearsOfExperience: 1.0,
            isVerified: true,
          },
        });
      }

      // 2. If an achievementId was attached, verify the achievement certificate/proof in PostgreSQL
      let verifiedAchievement = null;
      if (achievementId) {
        const updateRes = await db.studentAchievement.updateMany({
          where: { id: achievementId, studentId: studentProfile.id },
          data: { isVerified: true },
        });
        if (updateRes.count > 0) {
          verifiedAchievement = await db.studentAchievement.findUnique({
            where: { id: achievementId },
            select: { eventName: true },
          });
        }
      }

      // 3. Increment career readiness score up to 100
      const currentReadiness = studentProfile.careerReadinessScore || 65;
      const newReadiness = Math.min(100, Math.round(currentReadiness + (achievementId ? 8 : 5)));
      await db.studentProfile.update({
        where: { id: studentProfile.id },
        data: { careerReadinessScore: newReadiness },
      });

      const achievementNote = verifiedAchievement?.eventName
        ? ` and certificate proof for "${verifiedAchievement.eventName}"`
        : "";

      return NextResponse.json({
        success: true,
        result: savedResult,
        verifiedAchievementId: achievementId || null,
        verifiedSkillName: targetSkill?.name || null,
        message: `Assessment passed! Skill "${targetSkill?.name || "Technical"}"${achievementNote} has been marked as Verified in PostgreSQL.`,
      });
    }

    return NextResponse.json({
      success: true,
      result: savedResult,
      message: "Assessment submitted. Score is below passing criteria (60%). Review diagnostic feedback and try again.",
    });
  } catch (error: any) {
    console.error("Save assessment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record assessment" },
      { status: 500 }
    );
  }
}
