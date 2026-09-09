import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { existsSync } from "fs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getDiskFilePath, AllowedFileType } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const fileRecord = await db.uploadedFile.findUnique({
      where: { id },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Permission check for private files
    if (!fileRecord.isPublic) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized access to private file" }, { status: 401 });
      }

      // Check if user is owner, admin, faculty, or industry
      const isOwner = session.userId === fileRecord.uploaderUserId;
      const isFacultyOrAdmin = session.role === "ACADEMICIAN" || session.role === "ADMIN";
      const isIndustry = session.role === "INDUSTRY";

      if (!isOwner && !isFacultyOrAdmin && !isIndustry) {
        return NextResponse.json({ error: "Forbidden: You cannot view this file" }, { status: 403 });
      }
    }

    const filePath = await getDiskFilePath(
      fileRecord.storedFilename,
      fileRecord.fileType as AllowedFileType
    );

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File missing on storage disk" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": fileRecord.mimeType,
        "Content-Length": fileRecord.fileSize.toString(),
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileRecord.originalFilename)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("File retrieval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
