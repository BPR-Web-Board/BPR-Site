import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import IssuePdfPreview from "../../../components/IssuePdfPreview/IssuePdfPreview";
import IssuePdfMeta from "../../../components/IssuePdfPreview/IssuePdfMeta";
import MagazineArticles from "../../../components/MagazineArticles/MagazineArticles";
import { getAllCategories, getIssueArchiveSources, getIssuePosts, getTagBySlug } from "../../../lib/wordpress";
import { enhancePreviewPosts } from "../../../lib/enhancePost";
import { formatIssueHeading, getIssueThemeCss, parseIssues } from "../../../lib/issues";
import { SPECIAL_FEATURE_TAG } from "../../../lib/articleIssue";
import "../../../components/IssuePdfPreview/IssuePdfPreview.css";
import "./issue.css";

export const revalidate = 1800;

export default async function IssueArticlesPage({ params }: { params: Promise<{ issue: string }> }) {
  const { issue: slug } = await params;
  const issue = parseIssues(await getIssueArchiveSources()).find(issue => issue.slug === slug);
  if (!issue) notFound();
  const [posts, categories, specialFeatureTag] = await Promise.all([
    getIssuePosts(issue.issueTag),
    getAllCategories(),
    getTagBySlug(SPECIAL_FEATURE_TAG).catch(() => undefined),
  ]);
  const articles = await enhancePreviewPosts(posts, categories);
  const specialFeatureId = specialFeatureTag?.id;
  const specialFeaturePosts = specialFeatureId
    ? articles.filter((post) => post.tags?.includes(specialFeatureId))
    : [];
  const remainingPosts = specialFeatureId
    ? articles.filter((post) => !post.tags?.includes(specialFeatureId))
    : articles;
  const themeCss = getIssueThemeCss(issue);
  const previewPdf = issue.pdf;
  const heading = formatIssueHeading(issue.title);
  const intro = <>
    <header className="issue-edition-header">
      <nav className="issue-edition-nav" aria-label="Issue navigation">
        <Link href="/magazine/issues" className="issue-nav-link">
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
          Archive
        </Link>
        <h1 className="issue-edition-kicker">{heading}</h1>
      </nav>
    </header>
    {previewPdf ? (
      <section className="issue-pdf-stage" aria-label={`${heading} PDF preview`}>
        <IssuePdfPreview url={previewPdf} title={heading} cover={issue.cover?.url} />
        <IssuePdfMeta theme={issue.theme} />
      </section>
    ) : null}
  </>;
  return <main className={`page-container${themeCss ? " issue-edition" : ""}`}>
    {themeCss ? <style>{themeCss}</style> : null}
    <MagazineArticles
      posts={remainingPosts}
      specialFeaturePosts={specialFeaturePosts}
      title={issue.title}
      intro={intro}
      coverHero={issue.cover}
      archiveHref={null}
      emptyMessage="No articles have been added to this issue yet."
    />
  </main>;
}
