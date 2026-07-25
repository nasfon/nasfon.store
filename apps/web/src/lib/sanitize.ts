const ALLOWED_TAGS = new Set([
  "b", "i", "em", "strong", "p", "br", "ul", "ol", "li",
]);

const ALLOWED_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizePlainText(input: string, maxLength = 1000): string {
  return input
    .replace(/[<>&"'/]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizePhone(input: string): string {
  return input.replace(/[^0-9+\-() ]/g, "").trim();
}

export function sanitizeName(input: string): string {
  return input
    .replace(/[<>&"'/\\]/g, "")
    .trim()
    .slice(0, 100);
}

export function sanitizeSearchQuery(input: string): string {
  return input
    .replace(/[<>&"'/\\;()]/g, "")
    .trim()
    .slice(0, 200);
}

export function validateFileUpload(
  filename: string,
  size: number,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSize = 5 * 1024 * 1024
): { valid: boolean; error?: string } {
  if (size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` };
  }

  const ext = filename.split(".").pop()?.toLowerCase();
  const allowedExts = allowedTypes.flatMap((t) => {
    const type = t.split("/")[1];
    if (type === "jpeg") return ["jpeg", "jpg"];
    return [type];
  });

  if (ext && !allowedExts.includes(ext)) {
    return { valid: false, error: "Invalid file type. Allowed: " + allowedTypes.join(", ") };
  }

  return { valid: true };
}
