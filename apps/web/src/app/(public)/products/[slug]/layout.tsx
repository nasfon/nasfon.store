import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = createAdminClient();
    const { data: product } = await supabase
      .from("products")
      .select("id, name, description, selling_price, featured_image, category:categories(name)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!product) return { title: "Product Not Found" };

    const title = product.name;
    const description =
      product.description?.slice(0, 160) ||
      `${product.name} at Market by NasFon. Genuine product with clear pricing and trusted delivery in Nigeria.`;
    const url = `/products/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "website",
        images: product.featured_image
          ? [{ url: product.featured_image, width: 1200, height: 630, alt: product.name }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: product.featured_image ? [product.featured_image] : undefined,
      },
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
