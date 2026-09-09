import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";
import { db } from "./db";

export type AllowedFileType = "RESUME" | "CERTIFICATE" | "ACHIEVEMENT_PHOTO" | "AVATAR";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

const SUBDIR_MAP: Record<AllowedFileType, string> = {
  RESUME: "resumes",
  CERTIFICATE: "certificates",
  ACHIEVEMENT_PHOTO: "achievements",
  AVATAR: "avatars",
};

const ALLOWED_MIME_TYPES: Record<AllowedFileType, string[]> = {
  RESUME: ["application/pdf"],
  CERTIFICATE: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  ACHIEVEMENT_PHOTO: ["image/jpeg", "image/png", "image/webp"],
  AVATAR: ["image/jpeg", "image/png", "image/webp"],
};

const MAX_FILE_SIZE_BYTES: Record<AllowedFileType, number> = {
  RESUME: 5 * 1024 * 1024, // 5MB
  CERTIFICATE: 5 * 1024 * 1024, // 5MB
  ACHIEVEMENT_PHOTO: 4 * 1024 * 1024, // 4MB
  AVATAR: 2 * 1024 * 1024, // 2MB
};

export async function ensureStorageDirectoriesExist() {
  for (const subdir of Object.values(SUBDIR_MAP)) {
    const fullDir = path.join(STORAGE_ROOT, subdir);
    if (!existsSync(fullDir)) {
      await fs.mkdir(fullDir, { recursive: true });
    }
  }
}

export interface SaveFileResult {
  fileId: string;
  originalFilename: string;
  storedFilename: string;
  fileType: AllowedFileType;
  mimeType: string;
  fileSize: number;
  url: string;
}

export async function saveUploadedBuffer(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  fileType: AllowedFileType,
  uploaderUserId: string,
  isPublic: boolean = false
): Promise<SaveFileResult> {
  await ensureStorageDirectoriesExist();

  // 1. Validate MIME
  const allowedMimes = ALLOWED_MIME_TYPES[fileType];
  if (!allowedMimes.includes(mimeType)) {
    throw new Error(`Invalid file format: ${mimeType}. Allowed formats: ${allowedMimes.join(", ")}`);
  }

  // 2. Validate Size
  const maxBytes = MAX_FILE_SIZE_BYTES[fileType];
  if (buffer.length > maxBytes) {
    throw new Error(`File exceeds maximum size limit of ${Math.round(maxBytes / (1024 * 1024))}MB`);
  }

  // 3. Generate sanitized stored name
  const rawExt = path.extname(originalFilename).toLowerCase();
  const safeExt = rawExt && rawExt.length <= 5 ? rawExt : mimeType === "application/pdf" ? ".pdf" : ".jpg";
  const uniqueId = crypto.randomUUID();
  const storedFilename = `${uniqueId}${safeExt}`;

  const targetSubdir = SUBDIR_MAP[fileType];
  const fullFilePath = path.join(STORAGE_ROOT, targetSubdir, storedFilename);

  // 4. Save to Disk
  await fs.writeFile(fullFilePath, buffer);

  // 5. Save to Database
  const fileRecord = await db.uploadedFile.create({
    data: {
      uploaderUserId,
      originalFilename,
      storedFilename,
      fileType,
      mimeType,
      fileSize: buffer.length,
      storagePath: path.join("uploads", targetSubdir, storedFilename),
      isPublic,
    },
  });

  return {
    fileId: fileRecord.id,
    originalFilename,
    storedFilename,
    fileType,
    mimeType,
    fileSize: buffer.length,
    url: `/api/files/${fileRecord.id}`,
  };
}

export async function getDiskFilePath(storedFilename: string, fileType: AllowedFileType) {
  const targetSubdir = SUBDIR_MAP[fileType];
  return path.join(STORAGE_ROOT, targetSubdir, storedFilename);
}
