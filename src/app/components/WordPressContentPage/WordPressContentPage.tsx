import { notFound } from "next/navigation";
import { getPageBySlug } from "../../lib/wordpress";
import { stripHtml } from "../../lib/utils";
import { hydrateLazyEmbeds } from "../../lib/mediaPreview";
import "../WordPressPuzzlePage/content-pages.css";

export default async function WordPressContentPage({ slug, section }: { slug: string; section?: string }) {
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  let content = page.content.rendered;
  if (section) {
    const headings = Array.from(content.matchAll(/<h([2-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi));
    const heading = headings.find(match => stripHtml(match[2]).trim().toLowerCase() === section.toLowerCase());
    if (!heading || heading.index === undefined) notFound();
    const next = headings.find(match => match.index! > heading.index! && Number(match[1]) <= Number(heading[1]));
    content = content.slice(heading.index + heading[0].length, next?.index);
  }
  const routes: Record<string, string> = { about: "/about/story", masthead: "/about/masthead", join: "/about/join", "write-for-bpr": "/about/pitch", "high-school-program": "/about/high-school-program", donate: "/donate", "all-issues": "/magazine/issues", "issues-archive": "/magazine/issues", puzzles: "/puzzles", "puzzles-archives": "/puzzles-archives" };
  content = content.replace(/href=(['"])https?:\/\/(?:www\.)?brownpoliticalreview\.org\/(about|masthead|join|write-for-bpr|high-school-program|donate|all-issues|issues-archive|puzzles|puzzles-archives)\/?(?=[#?'"])/gi,
    (_, quote: string, path: string) => `href=${quote}${routes[path.toLowerCase()]}`);
  content = hydrateLazyEmbeds(content);
  return <main className="backend-content-page backend-information-page">
    <h1>{section || stripHtml(page.title.rendered)}</h1>
    <div className="wordpress-page-content" dangerouslySetInnerHTML={{ __html: content }} />
  </main>;
}
