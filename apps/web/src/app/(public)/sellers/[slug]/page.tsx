import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, CheckCircle2, Store } from "lucide-react";
import * as sellerService from "@/services/seller.service";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";

interface SellerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const seller = await sellerService.getSellerBySlug(slug);
    const title = seller.shop_name;
    const description =
      seller.business_description?.slice(0, 160) ||
      `Shop ${seller.shop_name} on Market by NasFon. Verified seller with trusted delivery in Nigeria.`;

    return {
      title,
      description,
      alternates: { canonical: `/sellers/${slug}` },
      openGraph: {
        title,
        description,
        url: `/sellers/${slug}`,
        type: "website",
        images: seller.shop_logo_url
          ? [{ url: seller.shop_logo_url, width: 1200, height: 630, alt: seller.shop_name }]
          : undefined,
      },
    };
  } catch {
    return { title: "Seller Not Found" };
  }
}

export default async function SellerProfilePage({ params }: SellerPageProps) {
  const { slug } = await params;
  let seller;
  try {
    seller = await sellerService.getSellerBySlug(slug);
  } catch {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, featured_image, selling_price, compare_price")
    .eq("seller_id", seller.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative h-28 w-28 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center shrink-0">
            {seller.shop_logo_url ? (
              <Image src={seller.shop_logo_url} alt={seller.shop_name} fill className="object-cover" />
            ) : (
              <Store size={40} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{seller.shop_name}</h1>
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 size={14} /> Verified Seller
              </Badge>
            </div>
            {seller.business_description && (
              <p className="mt-2 text-gray-600">{seller.business_description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" /> {seller.shop_address}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={16} className="text-gray-400" /> {seller.contact_phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={16} className="text-gray-400" /> {seller.contact_email}
              </span>
            </div>
          </div>
        </div>

        {seller.verification_documents && seller.verification_documents.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Verification Documents</h3>
            <div className="flex flex-wrap gap-4">
              {seller.verification_documents.map((docUrl: string, idx: number) => (
                <a
                  key={idx}
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-24 w-24 rounded-lg border overflow-hidden relative hover:opacity-90"
                >
                  <Image src={docUrl} alt={`Verification Doc ${idx + 1}`} fill className="object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Products from {seller.shop_name}</h2>
        {(!products || products.length === 0) ? (
          <p className="text-gray-500">No products available from this seller yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  {product.featured_image ? (
                    <Image src={product.featured_image} alt={product.name} fill className="object-cover group-hover:scale-105 transition" />
                  ) : null}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="mt-1 font-bold text-black">₦{product.selling_price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
