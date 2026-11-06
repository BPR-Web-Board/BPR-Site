import { Suspense, type ReactNode } from "react";
import ArchiveControls from "../../components/ArchiveControls/ArchiveControls";
import MagazineNavigation from "../../components/MagazineNavigation/MagazineNavigation";
import { formatIssueHeading, parseIssues } from "../../lib/issues";
import { getAllCategories, getIssueArchiveSources } from "../../lib/wordpress";
import "../../mainStyle.css";
import "../../components/WordPressPuzzlePage/content-pages.css";
import "../../components/ArchiveControls/ArchiveControls.css";
import "./archive.css";

export const metadata = { title: "Archive | Brown Political Review" };

const ARCHIVE_CATEGORY_SLUGS = [
  "united-states",
  "usa",
  "world",
  "culture",
  "interviews",
  "multimedia",
] as const;

export default async function ArchiveLayout({ children }: { children: ReactNode }) {
  const [sources, categories] = await Promise.all([
    getIssueArchiveSources(),
    getAllCategories(),
  ]);

  const issues = parseIssues(sources).map((issue) => ({
    slug: issue.slug,
    title: formatIssueHeading(issue.title),
  }));

  const categoryOptions = ARCHIVE_CATEGORY_SLUGS
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category))
    .map((category) => ({ slug: category.slug, name: category.name }));

  return (
    <main className="page-container">
      <div className="archive-content">
        <header className="archive-header">
          <h1 className="archive-title">Archive</h1>
        </header>
        <div className="archive-toolbar">
          <MagazineNavigation />
          <Suspense fallback={null}>
            <ArchiveControls issues={issues} categories={categoryOptions} />
          </Suspense>
        </div>
        <div className="archive-panel">{children}</div>
      </div>
    </main>
  );
}
