import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore product categories at Market by NasFon — phone accessories and more, organized for easy shopping.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Categories",
    description:
      "Explore product categories at Market by NasFon — phone accessories and more, organized for easy shopping.",
    url: "/categories",
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
