import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Issue } from "../../lib/issues";
import OptimizedImage from "../shared/OptimizedImage/OptimizedImage";
import "./IssueArchive.css";

export default function IssueArchive({ issues }: { issues: Issue[] }) {
  if (!issues.length) return <p>No issues are available yet.</p>;
  return <div className="issue-archive-grid">
    {issues.map(issue => {
      const fallback = <span className="issue-cover-fallback" role="img" aria-label="Cover image unavailable">
        <BookOpen size={32} strokeWidth={1.5} aria-hidden="true" />
        <span>Cover unavailable</span>
      </span>;
      return <article key={issue.id} className="issue-card" aria-labelledby={`issue-title-${issue.id}`}>
        <Link href={`/magazine/issues/${issue.slug}`} className="issue-cover" aria-label={`Articles from ${issue.title}`}>
          <span className="issue-cover-surface">
            {issue.cover ? <OptimizedImage src={issue.cover.url} alt={issue.cover.alt || `${issue.title} cover`} fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="issue-cover-image" errorFallback={fallback} /> : fallback}
          </span>
          <span className="issue-cover-curl" aria-hidden="true" />
        </Link>
        <div className="issue-details">
          <h2 id={`issue-title-${issue.id}`}>
            <Link href={`/magazine/issues/${issue.slug}`}>{issue.title}</Link>
          </h2>
        </div>
      </article>;
    })}
  </div>;
}
