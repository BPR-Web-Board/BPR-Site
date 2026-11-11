export default function IssuePdfMeta({ theme }: { theme?: string }) {
  if (!theme) return null;
  return <p className="issue-pdf-theme">{theme}</p>;
}
