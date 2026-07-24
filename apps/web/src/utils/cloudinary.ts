const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function cloudinaryUrl(url: string, options?: { width?: number; height?: number; quality?: string; format?: string }): string {
  if (!url || !cloudName || !url.includes(`cloudinary.com/${cloudName}`)) {
    return url;
  }

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transforms: string[] = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.format) transforms.push(`f_${options.format}`);
  transforms.push(`q_${options?.quality || "auto"}`);

  return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
}
