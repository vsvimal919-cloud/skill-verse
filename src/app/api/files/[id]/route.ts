import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * GET /api/files/[id]
 *
 * Serves a file by redirecting to its Vercel Blob CDN URL.
 * storagePath in the DB now holds the full blob URL after the migration
 * from local-disk storage.
 */
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
        return NextResponse.json(
          { error: "Unauthorized access to private file" },
          { status: 401 }
        );
      }

      const isOwner = session.userId === fileRecord.uploaderUserId;
      const isFacultyOrAdmin =
        session.role === "ACADEMICIAN" || session.role === "ADMIN";
      const isIndustry = session.role === "INDUSTRY";

      if (!isOwner && !isFacultyOrAdmin && !isIndustry) {
        return NextResponse.json(
          { error: "Forbidden: You cannot view this file" },
          { status: 403 }
        );
      }
    }

    // storagePath is now the Vercel Blob CDN URL — redirect to it directly.
    const blobUrl = fileRecord.storagePath;

    if (!blobUrl || !blobUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "File URL unavailable" },
        { status: 404 }
      );
    }

    // 302 redirect to the blob CDN; the browser/client fetches the file directly.
    return NextResponse.redirect(blobUrl, {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          fileRecord.originalFilename
        )}"`,
      },
    });
  } catch (error: unknown) {
    console.error("File retrieval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
