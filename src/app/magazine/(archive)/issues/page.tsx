import IssueArchive from "../../../components/IssueArchive/IssueArchive";
import { getIssueArchiveSources } from "../../../lib/wordpress";
import { parseIssues } from "../../../lib/issues";

export const revalidate = 1800;

export default async function AllIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sortOldest = params.sort === "oldest";
  const issues = [...parseIssues(await getIssueArchiveSources())].sort((a, b) =>
    sortOldest ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
  );

  return (
    <section aria-label="Issues" className="archive-issues">
      <IssueArchive issues={issues} />
    </section>
  );
}
