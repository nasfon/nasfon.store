import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 capitalize">{slug}</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-full py-16 text-center text-gray-400">
          Products in this category will appear here.
        </div>
      </div>
    </div>
  );
}
