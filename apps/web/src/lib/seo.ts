export const siteConfig = {
  name: "Market",
  tagline: "Trusted Online Shopping",
  domain: "market.nasfon.com",
  url: process.env.APP_URL || "https://market.nasfon.com",
  description:
    "Market by NasFon — Nigeria's trusted online store for genuine phone accessories and more. Safe, secure, and simple shopping for first-time buyers.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Market",
  },
  twitter: {
    card: "summary_large_image",
    site: "@nasfon",
  },
  contact: {
    email: "support@market.nasfon.com",
  },
} as const;

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
