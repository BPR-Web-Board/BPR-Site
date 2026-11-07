import Link from "next/link";
import { Search } from "lucide-react";
import { api, getAllCategories } from "../lib/wordpress";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { Post } from "../lib/types";
import SmallArticlePreview from "../components/shared/SmallArticlePreview/SmallArticlePreview";
import "../components/WordPressPuzzlePage/content-pages.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search | Brown Political Review" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 280) : "";
  const page = typeof params.page === "string" && /^\d+$/.test(params.page) ? Math.max(1, Math.min(10000, Number(params.page))) : 1;
  let result;
  let failed = false;
  if (query) {
    try {
      const [response, categories] = await Promise.all([
        api.get<Post[]>("/wp-json/wp/v2/posts", { params: { search: query, page, per_page: 12 } }),
        getAllCategories(),
      ]);
      result = { articles: await enhancePreviewPosts(response.data, categories), pages: Number(response.headers["x-wp-totalpages"] || 1), total: Number(response.headers["x-wp-total"] || response.data.length) };
    } catch (error) {
      if ((error as { response?: { data?: { code?: string } } }).response?.data?.code === "rest_post_invalid_page_number") {
        result = { articles: [], pages: 0, total: 0 };
      } else {
        failed = true;
      }
    }
  }
  const pageLink = (number: number) => `/search?${new URLSearchParams({ q: query, page: String(number) })}`;
  return <main className="backend-content-page">
    <h1 className="section-heading-rule">Search</h1>
    <form className="content-search-form" role="search" action="/search">
      <input type="search" name="q" aria-label="Search articles" placeholder="Search articles…" defaultValue={query} maxLength={280} required />
      <button type="submit" className="content-search-submit" aria-label="Search">
        <Search size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </form>
    {!query && <p>Enter a term to search BPR articles.</p>}
    {failed && <p className="site-state site-state-error" role="alert">Search is temporarily unavailable. Please try again.</p>}
    {result && <>
      <p>{result.total ? `${result.total} results for “${query}”` : `No results on this page for “${query}”. Try another term or return to the first page.`}</p>
      <div className="search-results">{result.articles.map(article => <SmallArticlePreview key={article.id} article={article} showDate />)}</div>
      <nav className="search-pagination" aria-label="Search results pages">
        {page > 1 && <Link className="site-action" href={pageLink(page - 1)}>Previous</Link>}
        {result.pages > 0 && <span>Page {page} of {result.pages}</span>}
        {page < result.pages && <Link className="site-action" href={pageLink(page + 1)}>Next</Link>}
      </nav>
    </>}
  </main>;
}
