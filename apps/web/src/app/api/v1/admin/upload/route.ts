import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser } from "@/lib/api";

const IMAGE_MAGIC_BYTES: { signature: number[]; mime: string }[] = [
  { signature: [0xFF, 0xD8, 0xFF], mime: "image/jpeg" },
  { signature: [0x89, 0x50, 0x4E, 0x47], mime: "image/png" },
  { signature: [0x52, 0x49, 0x46, 0x46], mime: "image/webp" },
  { signature: [0x47, 0x49, 0x46, 0x38], mime: "image/gif" },
];

function validateImageMagicBytes(buffer: Buffer): boolean {
  return IMAGE_MAGIC_BYTES.some(({ signature }) =>
    signature.every((byte, i) => buffer[i] === byte)
  );
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireUser(request);
    if (error) return error;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return errorResponse("Cloudinary not configured", [], 500);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided");
    }

    if (!file.type.startsWith("image/")) {
      return errorResponse("File must be an image");
    }

    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("File too large (max 5MB)");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateImageMagicBytes(buffer)) {
      return errorResponse("File content does not match image format");
    }

    const base64 = buffer.toString("base64");

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "products";
    const params: Record<string, string | number> = { timestamp, folder };
    const signature = await generateSignature(params, apiSecret);

    const uploadData = new FormData();
    uploadData.append("file", `data:${file.type};base64,${base64}`);
    uploadData.append("folder", folder);
    uploadData.append("timestamp", String(timestamp));
    uploadData.append("api_key", apiKey);
    uploadData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadData }
    );

    const result = await response.json();

    if (!response.ok) {
      return errorResponse(result.error?.message || "Upload failed", [], 400);
    }

    return successResponse({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Upload failed", [], 500);
  }
}

async function generateSignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const encoder = new TextEncoder();
  const data = encoder.encode(sorted + apiSecret);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
