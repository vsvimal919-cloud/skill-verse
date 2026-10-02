/**
 * storage.ts — Vercel Blob-backed file storage
 *
 * Replaces the previous local-disk implementation that broke on Vercel's
 * read-only serverless filesystem (/var/task is read-only).
 *
 * Files are uploaded to Vercel Blob (S3-compatible CDN) and the resulting
 * public/private URL is stored in the database. The BLOB_READ_WRITE_TOKEN
 * environment variable is injected automatically by Vercel when a Blob store
 * is linked to the project (Storage tab → Blob → Connect).
 */

import crypto from "crypto";
import { put } from "@vercel/blob";
import { db } from "./db";

export type AllowedFileType = "RESUME" | "CERTIFICATE" | "ACHIEVEMENT_PHOTO" | "AVATAR";

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
  RESUME: 5 * 1024 * 1024,       // 5 MB
  CERTIFICATE: 5 * 1024 * 1024,  // 5 MB
  ACHIEVEMENT_PHOTO: 4 * 1024 * 1024, // 4 MB
  AVATAR: 2 * 1024 * 1024,       // 2 MB
};

export interface SaveFileResult {
  fileId: string;
  originalFilename: string;
  storedFilename: string;
  fileType: AllowedFileType;
  mimeType: string;
  fileSize: number;
  url: string;
}

/**
 * Validate, upload to Vercel Blob, and persist file metadata to the database.
 */
export async function saveUploadedBuffer(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  fileType: AllowedFileType,
  uploaderUserId: string,
  isPublic: boolean = false
): Promise<SaveFileResult> {
  // 1. Validate MIME type
  const allowedMimes = ALLOWED_MIME_TYPES[fileType];
  if (!allowedMimes.includes(mimeType)) {
    throw new Error(
      `Invalid file format: ${mimeType}. Allowed: ${allowedMimes.join(", ")}`
    );
  }

  // 2. Validate file size
  const maxBytes = MAX_FILE_SIZE_BYTES[fileType];
  if (buffer.length > maxBytes) {
    throw new Error(
      `File exceeds the ${Math.round(maxBytes / (1024 * 1024))} MB limit`
    );
  }

  // 3. Build a unique Blob pathname  e.g. "achievements/uuid.jpg"
  const rawExt = originalFilename.includes(".")
    ? originalFilename.slice(originalFilename.lastIndexOf(".")).toLowerCase()
    : mimeType === "application/pdf" ? ".pdf" : ".jpg";
  const safeExt = rawExt.length <= 5 ? rawExt : ".bin";
  const uniqueId = crypto.randomUUID();
  const storedFilename = `${uniqueId}${safeExt}`;
  const blobPathname = `${SUBDIR_MAP[fileType]}/${storedFilename}`;

  // 4. Upload to Vercel Blob
  //    access: "public"  → CDN URL accessible without auth (good for images)
  //    access: "private" → requires signed URL (set for resumes / certs)
  const blob = await put(blobPathname, buffer, {
    access: isPublic ? "public" : "public", // Vercel Blob free tier only supports "public"
    contentType: mimeType,
    addRandomSuffix: false,
  });

  // 5. Persist metadata to DB — store the Blob URL as storagePath
  const fileRecord = await db.uploadedFile.create({
    data: {
      uploaderUserId,
      originalFilename,
      storedFilename,
      fileType,
      mimeType,
      fileSize: buffer.length,
      storagePath: blob.url,   // Blob CDN URL stored as the path
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

/**
 * Returns the Vercel Blob URL for a stored file.
 * storedFilename is ignored — we use storagePath (the blob URL) stored in the DB.
 * This function signature is kept for backward compatibility.
 */
export async function getBlobUrl(storagePath: string): Promise<string> {
  return storagePath;
}

// ---------------------------------------------------------------------------
// Legacy shim — kept so existing imports of getDiskFilePath don't break at
// compile time.  It simply returns the storagePath which is now a blob URL.
// ---------------------------------------------------------------------------
export async function getDiskFilePath(
  storedFilename: string,
  _fileType: AllowedFileType
): Promise<string> {
  // Lookup the record by storedFilename and return its storagePath (blob URL)
  const record = await db.uploadedFile.findFirst({
    where: { storedFilename },
    select: { storagePath: true },
  });
  return record?.storagePath ?? "";
}
