"use client";

import Link from "next/link";
import { getCategoryLink, stripHtml } from "../../../lib/utils";
import "./CategoryPills.css";

type PillCategory = { id: number; slug: string; name: string; parent?: number };

type CategoryPillsProps = {
  categories?: PillCategory[];
  /** Only the article page should pass true — grids keep tags as plain labels. */
  clickable?: boolean;
};

export default function CategoryPills({
  categories = [],
  clickable = false,
}: CategoryPillsProps) {
  const unique = Array.from(
    new Map(
      categories
        .filter((category) => category.slug !== "uncategorized" && category.name.trim())
        .map((category) => [category.id, category])
    ).values()
  );
  if (!unique.length) return null;

  return (
    <div className="category-pills" role="list" aria-label="Article categories">
      {unique.map((category) => {
        const label = stripHtml(category.name);
        const href = clickable ? getCategoryLink(category) : null;
        if (!href) {
          return (
            <span key={category.id} className="category-pill" role="listitem">
              {label}
            </span>
          );
        }
        return (
          <Link
            key={category.id}
            href={href}
            className="category-pill category-pill-link"
            role="listitem"
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
