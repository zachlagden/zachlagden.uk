import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

type SniffedImage = "jpeg" | "png" | "gif" | "webp";

const EXT_FOR: Record<SniffedImage, string> = {
  jpeg: ".jpg",
  png: ".png",
  gif: ".gif",
  webp: ".webp",
};

function sniffImageType(buffer: Buffer): SniffedImage | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "gif";
  }

  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

export class UnsupportedImageTypeError extends Error {
  constructor() {
    super(
      "Uploaded file is not a supported image (jpeg, png, gif, webp).",
    );
    this.name = "UnsupportedImageTypeError";
  }
}

export async function saveUploadedFile(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const sniffed = sniffImageType(buffer);
  if (!sniffed) {
    throw new UnsupportedImageTypeError();
  }

  const ext = EXT_FOR[sniffed];
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);

  await writeFile(filePath, buffer);

  return `/uploads/${uniqueName}`;
}
