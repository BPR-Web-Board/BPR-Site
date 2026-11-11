import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getPageBySlug } from "../../lib/wordpress";
import { stripHtml } from "../../lib/utils";
import { hydrateLazyEmbeds } from "../../lib/mediaPreview";
import "./content-pages.css";

export default async function WordPressPuzzlePage({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  const content = hydrateLazyEmbeds(
    page.content.rendered
    .replace(/<div\b([^>]*class="pm-embed-div"[^>]*)>\s*<\/div>/gi, (_, attributes: string) => {
      const attribute = (name: string) => attributes.match(new RegExp(`${name}="([^"]*)"`, "i"))?.[1];
      const id = attribute("data-id");
      const set = attribute("data-set");
      if (!id || !set) return "";
      const query = new URLSearchParams({ id, set, embed: "wp" });
      return `<iframe class="puzzle-frame" title="BPR crossword puzzle" src="https://puzzleme.amuselabs.com/pmm/crossword?${query.toString().replace(/&/g, "&amp;")}" loading="lazy" allow="fullscreen"></iframe>`;
    })
    .replace(/https?:\/\/brownpoliticalreview\.org\/(puzzles(?:-archives)?)\//g, "/$1")
  );
  const headerLink = slug === "puzzles"
    ? {
        href: "/puzzles-archives",
        eyebrow: "Want to play another crossword?",
        cta: "Explore the Puzzles Archives",
      }
    : slug === "puzzles-archives"
      ? {
          href: "/puzzles",
          eyebrow: "Looking for this week’s crossword?",
          cta: "Play our current puzzle",
        }
      : null;
  return <main className="backend-content-page">
    <header className={`puzzle-page-header${headerLink ? " puzzle-page-header--with-link" : ""}`}>
      <h1>{stripHtml(page.title.rendered)}</h1>
      {headerLink ? (
        <Link href={headerLink.href} className="puzzle-archives-link">
          <span className="puzzle-archives-link-text">
            {headerLink.eyebrow}
            <span className="puzzle-archives-link-cta">{headerLink.cta}</span>
          </span>
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      ) : null}
    </header>
    <div className="wordpress-puzzle-content" dangerouslySetInnerHTML={{ __html: content }} />
  </main>;
}
