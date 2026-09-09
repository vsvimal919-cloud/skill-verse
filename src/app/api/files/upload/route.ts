import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUploadedBuffer, AllowedFileType } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileType = (formData.get("fileType") as AllowedFileType) || "CERTIFICATE";
    const isPublic = formData.get("isPublic") === "true";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await saveUploadedBuffer(
      buffer,
      file.name,
      file.type,
      fileType,
      session.userId,
      isPublic
    );

    return NextResponse.json({
      success: true,
      file: result,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
