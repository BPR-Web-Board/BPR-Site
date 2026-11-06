import { getIssueArchiveSources } from "../../lib/wordpress";
import { getIssueThemeCss, parseIssues } from "../../lib/issues";

export default async function MagazineHomeLayout({ children }: { children: React.ReactNode }) {
  const latestIssue = parseIssues(await getIssueArchiveSources())[0];
  const themeCss = latestIssue ? getIssueThemeCss(latestIssue) : "";

  return (
    <>
      {themeCss ? <style>{themeCss}</style> : null}
      {children}
    </>
  );
}
