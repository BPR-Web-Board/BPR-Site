import Link from "next/link";
import { api, getAllCategories } from "../lib/wordpress";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { Post } from "../lib/types";
import SmallArticlePreview from "../components/shared/SmallArticlePreview/SmallArticlePreview";

export default async function SearchResults({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  let result: { articles: Awaited<ReturnType<typeof enhancePreviewPosts>>; pages: number; total: number } | null =
    null;
  let failed = false;

  try {
    const [response, categories] = await Promise.all([
      api.get<Post[]>("/wp-json/wp/v2/posts", {
        params: { search: query, page, per_page: 12 },
      }),
      getAllCategories(),
    ]);
    result = {
      articles: await enhancePreviewPosts(response.data, categories),
      pages: Number(response.headers["x-wp-totalpages"] || 1),
      total: Number(response.headers["x-wp-total"] || response.data.length),
    };
  } catch (error) {
    if (
      (error as { response?: { data?: { code?: string } } }).response?.data
        ?.code === "rest_post_invalid_page_number"
    ) {
      result = { articles: [], pages: 0, total: 0 };
    } else {
      failed = true;
    }
  }

  if (failed) {
    return (
      <p className="site-state site-state-error" role="alert">
        Search is temporarily unavailable. Please try again.
      </p>
    );
  }

  if (!result) return null;

  const pageLink = (number: number) =>
    `/search?${new URLSearchParams({ q: query, page: String(number) })}`;

  return (
    <>
      <p>
        {result.total
          ? `${result.total} results for “${query}”`
          : `No results on this page for “${query}”. Try another term or return to the first page.`}
      </p>
      <div className="search-results">
        {result.articles.map((article) => (
          <SmallArticlePreview key={article.id} article={article} showDate />
        ))}
      </div>
      <nav className="search-pagination" aria-label="Search results pages">
        {page > 1 && (
          <Link className="site-action" href={pageLink(page - 1)}>
            Previous
          </Link>
        )}
        {result.pages > 0 && (
          <span>
            Page {page} of {result.pages}
          </span>
        )}
        {page < result.pages && (
          <Link className="site-action" href={pageLink(page + 1)}>
            Next
          </Link>
        )}
      </nav>
    </>
  );
}
