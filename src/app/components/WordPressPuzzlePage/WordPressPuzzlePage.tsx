import { notFound } from "next/navigation";
import { getPageBySlug } from "../../lib/wordpress";
import { stripHtml } from "../../lib/utils";
import "./content-pages.css";

export default async function WordPressPuzzlePage({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  const content = page.content.rendered
    .replace(/<div\b([^>]*class="pm-embed-div"[^>]*)>\s*<\/div>/gi, (_, attributes: string) => {
      const attribute = (name: string) => attributes.match(new RegExp(`${name}="([^"]*)"`, "i"))?.[1];
      const id = attribute("data-id");
      const set = attribute("data-set");
      if (!id || !set) return "";
      const query = new URLSearchParams({ id, set, embed: "wp" });
      return `<iframe class="puzzle-frame" title="BPR crossword puzzle" src="https://puzzleme.amuselabs.com/pmm/crossword?${query.toString().replace(/&/g, "&amp;")}" loading="lazy" allow="fullscreen"></iframe>`;
    })
    .replace(/https?:\/\/brownpoliticalreview\.org\/(puzzles(?:-archives)?)\//g, "/$1");
  return <main className="backend-content-page">
    <h1>{stripHtml(page.title.rendered)}</h1>
    <div className="wordpress-puzzle-content" dangerouslySetInnerHTML={{ __html: content }} />
  </main>;
}
