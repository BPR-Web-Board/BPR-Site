export default function ArticleTitle({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
