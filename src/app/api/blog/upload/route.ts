import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUploadedFile, UnsupportedImageTypeError } from "@/lib/upload";

const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 },
    );
  }

  try {
    const url = await saveUploadedFile(file);
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof UnsupportedImageTypeError) {
      return NextResponse.json(
        { error: "File contents do not match a supported image format." },
        { status: 400 },
      );
    }
    console.error("[blog/upload] Failed to save file:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
