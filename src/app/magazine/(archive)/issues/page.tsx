import IssueArchive from "../../../components/IssueArchive/IssueArchive";
import { getIssueArchiveSources } from "../../../lib/wordpress";
import { parseIssues } from "../../../lib/issues";

export const revalidate = 1800;

export default async function AllIssuesPage() {
  const issues = parseIssues(await getIssueArchiveSources());
  return <section aria-label="Issues" className="archive-issues"><IssueArchive issues={issues} /></section>;
}
