import Link from "next/link";
import { getCategories } from "@/services/category.service";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      {categories.length === 0 ? (
        <p className="mt-12 text-center text-gray-400">No categories yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={`group relative flex items-center justify-center overflow-hidden rounded-xl shadow-md transition hover:shadow-lg ${cat.image_url ? "" : "bg-gradient-to-br from-primary/40 to-primary/20"}`}
              style={cat.image_url ? { backgroundImage: `url(${cat.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative flex aspect-[3/2] w-full items-center justify-center">
                {!cat.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/80">{cat.name.charAt(0)}</span>
                  </div>
                )}
                <h3 className="px-3 text-center text-sm font-semibold text-white drop-shadow-sm">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}