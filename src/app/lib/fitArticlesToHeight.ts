export type MeasuredArticle = { id: number; height: number };
export type FittedArticles = { columns: number[][]; overflow: number[] };

export function fitArticlesToHeight(articles: MeasuredArticle[], height: number, gap: number, columnCount: number): FittedArticles {
  const columns: number[][] = Array.from({ length: columnCount }, () => []);
  const used = columns.map(() => 0);
  const overflow: number[] = [];
  const originalIndex = new Map(articles.map((article, index) => [article.id, index]));
  // Prefer taller cards (usually image previews) so they keep side-column space over text-only rows.
  const ordered = [...articles].sort(
    (a, b) => b.height - a.height || originalIndex.get(a.id)! - originalIndex.get(b.id)!
  );
  for (const article of ordered) {
    const choices = used.map((value, index) => ({ index, value }))
      .filter(({ index, value }) => value + (columns[index].length ? gap : 0) + article.height <= height + .5)
      .sort((a, b) => a.value - b.value);
    if (!choices.length) { overflow.push(article.id); continue; }
    const index = choices[0].index;
    used[index] += (columns[index].length ? gap : 0) + article.height;
    columns[index].push(article.id);
  }
  for (const column of columns) {
    column.sort((a, b) => originalIndex.get(a)! - originalIndex.get(b)!);
  }
  overflow.sort((a, b) => originalIndex.get(a)! - originalIndex.get(b)!);
  return { columns, overflow };
}

export function fitStackedSideColumns(compact: FittedArticles, articles: MeasuredArticle[], height: number, gap: number): FittedArticles {
  const heights = new Map(articles.map(article => [article.id, article.height]));
  const columns = compact.columns.map(column => {
    // Dense equal-row grids keep their packed set; sparse stacked columns only
    // keep cards whose natural heights fit (flex can still weight image slots).
    if (column.length >= 4) return column;
    const kept: number[] = [];
    let used = 0;
    for (const id of column) {
      const articleHeight = heights.get(id) ?? Infinity;
      const next = used + (kept.length ? gap : 0) + articleHeight;
      if (next <= height + .5) {
        kept.push(id);
        used = next;
      }
    }
    return kept;
  });
  const visible = new Set(columns.flat());
  return { columns, overflow: articles.filter(article => !visible.has(article.id)).map(article => article.id) };
}
