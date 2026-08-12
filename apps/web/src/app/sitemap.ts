import type { MetadataRoute } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const supabase = createAdminClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  const [productsResult, categoriesResult, sellersResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false }),
    supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false }),
    supabase
      .from("sellers")
      .select("shop_slug, updated_at")
      .eq("verification_status", "approved")
      .eq("is_active", true)
      .order("updated_at", { ascending: false }),
  ]);

  const productRoutes: MetadataRoute.Sitemap = (productsResult.data || []).map(
    (product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "daily",
      priority: 0.7,
    })
  );

  const categoryRoutes: MetadataRoute.Sitemap = (categoriesResult.data || []).map(
    (category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  const sellerRoutes: MetadataRoute.Sitemap = (sellersResult.data || []).map(
    (seller) => ({
      url: `${baseUrl}/sellers/${seller.shop_slug}`,
      lastModified: new Date(seller.updated_at),
      changeFrequency: "weekly",
      priority: 0.5,
    })
  );

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...sellerRoutes,
  ];
}
