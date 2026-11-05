import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MagazineArticles from "../components/MagazineArticles/MagazineArticles";
import IssuePdfPreview from "../components/IssuePdfPreview/IssuePdfPreview";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { formatIssueHeading, getIssueThemeCss, parseIssues } from "../lib/issues";
import { getAllCategories, getIssueArchiveSources, getPostsByCategorySlug } from "../lib/wordpress";
import "../components/IssuePdfPreview/IssuePdfPreview.css";
import "./issues/[issue]/issue.css";

export const revalidate = 1800;

export default async function MagazinePage() {
  const [categories, posts, sources] = await Promise.all([
    getAllCategories(),
    getPostsByCategorySlug("mag", { per_page: 100 }),
    getIssueArchiveSources(),
  ]);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  const recent = posts.filter(post => new Date(post.date) >= cutoff);
  const latestIssue = parseIssues(sources)[0];
  const themeCss = latestIssue ? getIssueThemeCss(latestIssue) : "";
  const heading = latestIssue ? formatIssueHeading(latestIssue.title) : "Magazine";
  const previewPdf = latestIssue?.pdf ?? null;
  const hasCover = Boolean(latestIssue?.cover?.url);
  const issueHeader = latestIssue ? (
    <header className={`issue-edition-header${hasCover ? "" : " issue-edition-header--plain"}`}>
      <nav className="issue-edition-nav" aria-label="Issue navigation">
        <Link href="/magazine/issues" className="issue-nav-link">
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
          Previous Issues
        </Link>
        <h1 className="issue-edition-kicker">{heading}</h1>
      </nav>
    </header>
  ) : null;
  const pdfStage = previewPdf ? (
    <section className="issue-pdf-stage" aria-label={`${heading} PDF preview`}>
      <IssuePdfPreview url={previewPdf} title={heading} cover={latestIssue?.cover?.url} />
    </section>
  ) : null;

  return (
    <main className={`page-container${themeCss ? " issue-edition" : ""}`}>
      {themeCss ? <style>{themeCss}</style> : null}
      <MagazineArticles
        posts={await enhancePreviewPosts(recent, categories)}
        title={heading}
        intro={hasCover ? <>{issueHeader}{pdfStage}</> : issueHeader}
        afterHero={!hasCover ? pdfStage : null}
        coverHero={hasCover ? latestIssue?.cover : null}
        archiveHref={null}
      />
    </main>
  );
}
