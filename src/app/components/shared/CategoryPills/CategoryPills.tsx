import { stripHtml } from "../../../lib/utils";
import "./CategoryPills.css";

type PillCategory = { id: number; slug: string; name: string; parent?: number };

export default function CategoryPills({ categories = [] }: { categories?: PillCategory[] }) {
  const unique = Array.from(new Map(categories.filter(category => category.slug !== "uncategorized" && category.name.trim()).map(category => [category.id, category])).values());
  if (!unique.length) return null;
  return <div className="category-pills" role="list" aria-label="Article categories">
    {unique.map(category => <span key={category.id} className="category-pill" role="listitem">{stripHtml(category.name)}</span>)}
  </div>;
}
