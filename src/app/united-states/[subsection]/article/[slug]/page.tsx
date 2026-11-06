import { Metadata } from "next";
import ArticlePageContent from "../../../../components/ArticleView/ArticlePageContent";
import { getPostBySlug } from "../../../../lib/wordpress";
import { getArticlePlainMeta } from "../../../../lib/utils";

interface PageProps {
  params: Promise<{ subsection: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    const { title, description } = getArticlePlainMeta(post);
    return {
      title: `${title} - Brown Political Review`,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.modified,
      },
    };
  } catch {
    return {
      title: "Article Not Found - Brown Political Review",
      description: "The requested article could not be found.",
    };
  }
}

export default async function UnitedStatesSubsectionArticlePage({ params }: PageProps) {
  const { slug, subsection } = await params;
  return <ArticlePageContent slug={slug} relatedCategorySlug={subsection} />;
}
