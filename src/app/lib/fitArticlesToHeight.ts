export type MeasuredArticle = { id: number; height: number };
export type FittedArticles = { columns: number[][]; overflow: number[] };

export function fitArticlesToHeight(articles: MeasuredArticle[], height: number, gap: number, columnCount: number): FittedArticles {
  const columns: number[][] = Array.from({ length: columnCount }, () => []);
  const used = columns.map(() => 0);
  const overflow: number[] = [];
  for (const article of articles) {
    const choices = used.map((value, index) => ({ index, value }))
      .filter(({ index, value }) => value + (columns[index].length ? gap : 0) + article.height <= height + .5)
      .sort((a, b) => a.value - b.value);
    if (!choices.length) { overflow.push(article.id); continue; }
    const index = choices[0].index;
    used[index] += (columns[index].length ? gap : 0) + article.height;
    columns[index].push(article.id);
  }
  return { columns, overflow };
}

export function fitStackedSideColumns(compact: FittedArticles, articles: MeasuredArticle[], height: number, gap: number): FittedArticles {
  const heights = new Map(articles.map(article => [article.id, article.height]));
  const columns = compact.columns.map(column => {
    if (column.length >= 4) return column;
    for (let rows = column.length; rows > 0; rows--) {
      const available = (height - gap * (rows - 1)) / rows;
      const fitting = column.filter(id => (heights.get(id) ?? Infinity) <= available + .5).slice(0, rows);
      if (fitting.length === rows) return fitting;
    }
    return [];
  });
  const visible = new Set(columns.flat());
  return { columns, overflow: articles.filter(article => !visible.has(article.id)).map(article => article.id) };
}
