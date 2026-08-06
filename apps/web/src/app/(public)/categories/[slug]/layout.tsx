import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = createAdminClient();
    const { data: category } = await supabase
      .from("categories")
      .select("name, description")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!category) return { title: "Category Not Found" };

    const title = category.name;
    const description =
      category.description?.slice(0, 160) ||
      `Shop ${category.name} at Market by NasFon. Genuine products with clear pricing and trusted delivery in Nigeria.`;
    const url = `/categories/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "website",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return { title: "Category Not Found" };
  }
}

export default function CategoryDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
