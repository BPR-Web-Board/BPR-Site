import { getIssueArchiveSources, getTagBySlug } from "./wordpress";
import { formatIssueHeading, parseIssues } from "./issues";

export const SPECIAL_FEATURE_TAG = "special-feature";

export type ArticleIssueRef = {
  slug: string;
  heading: string;
};

export type ArticleMagazineMeta = {
  issue: ArticleIssueRef | null;
  specialFeature: boolean;
};

export async function findIssueForPost(post: {
  tags?: number[];
}): Promise<ArticleIssueRef | null> {
  const tagIds = new Set((post.tags || []).filter((id) => Number.isFinite(id)));
  if (tagIds.size === 0) return null;

  const issues = parseIssues(await getIssueArchiveSources());
  for (const issue of issues) {
    if (typeof issue.issueTag === "number" && tagIds.has(issue.issueTag)) {
      return { slug: issue.slug, heading: formatIssueHeading(issue.title) };
    }
  }

  const stringIssues = issues.filter(
    (issue): issue is typeof issue & { issueTag: string } =>
      typeof issue.issueTag === "string"
  );
  const matches = await Promise.all(
    stringIssues.map(async (issue) => {
      const tag = await getTagBySlug(issue.issueTag).catch(() => undefined);
      if (!tag?.id || !tagIds.has(tag.id)) return null;
      return { slug: issue.slug, heading: formatIssueHeading(issue.title) };
    })
  );
  return matches.find(Boolean) ?? null;
}

export async function isSpecialFeaturePost(post: {
  tags?: number[];
}): Promise<boolean> {
  const tagIds = post.tags || [];
  if (tagIds.length === 0) return false;
  const tag = await getTagBySlug(SPECIAL_FEATURE_TAG).catch(() => undefined);
  return Boolean(tag?.id && tagIds.includes(tag.id));
}

export async function getArticleMagazineMeta(post: {
  tags?: number[];
}): Promise<ArticleMagazineMeta> {
  const [issue, specialFeature] = await Promise.all([
    findIssueForPost(post),
    isSpecialFeaturePost(post),
  ]);
  return { issue, specialFeature };
}
