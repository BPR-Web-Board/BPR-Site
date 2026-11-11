import { notFound, permanentRedirect } from "next/navigation";
import { getAllCategories, getPostBySlug } from "../lib/wordpress";
import { getArticleLink } from "../lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyArticleSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post?.id) notFound();

  const categories = await getAllCategories();
  const categories_obj = categories.filter((category) =>
    post.categories?.includes(category.id)
  );

  permanentRedirect(
    getArticleLink({
      id: post.id,
      slug: post.slug,
      categories_obj,
    })
  );
}
