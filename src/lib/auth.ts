import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "skill-verse-default-secret-key-32-chars-min-ok"
);

export const COOKIE_NAME = "skill_verse_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "STUDENT" | "ACADEMICIAN" | "INDUSTRY" | "ADMIN";
  name: string;
  profileId?: string;
  institutionId?: string;
  departmentId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUserWithProfile() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      studentProfile: {
        include: {
          institution: true,
          department: true,
          targetRole: true,
        },
      },
      academicianProfile: {
        include: {
          institution: true,
          department: true,
        },
      },
      industryProfile: true,
    },
  });

  return user;
}
