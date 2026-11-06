import { getIssueArchiveSources } from "../../../lib/wordpress";
import { getIssueThemeCss, parseIssues } from "../../../lib/issues";

export default async function IssueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ issue: string }>;
}) {
  const { issue: slug } = await params;
  const issue = parseIssues(await getIssueArchiveSources()).find((entry) => entry.slug === slug);
  const themeCss = issue ? getIssueThemeCss(issue) : "";

  return (
    <>
      {themeCss ? <style>{themeCss}</style> : null}
      {children}
    </>
  );
}
