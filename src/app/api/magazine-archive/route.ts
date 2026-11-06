import { NextRequest, NextResponse } from "next/server";
import { enhancePosts } from "../../lib/enhancePost";
import { parseIssues } from "../../lib/issues";
import {
  api,
  getAllCategories,
  getIssueArchiveSources,
  getTagBySlug,
} from "../../lib/wordpress";
import type { Post } from "../../lib/types";

const LIST_POST_PARAMS = {
  _embed: "author,wp:featuredmedia",
  _fields: [
    "id",
    "date",
    "date_gmt",
    "modified",
    "modified_gmt",
    "slug",
    "status",
    "type",
    "link",
    "title",
    "excerpt",
    "author",
    "featured_media",
    "format",
    "categories",
    "tags",
    "meta",
    "guid",
    "_links",
    "_embedded",
  ].join(","),
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "12", 10);
    const query = (searchParams.get("q") || "").trim().slice(0, 280);
    const issueSlug = (searchParams.get("issue") || "").trim();
    const categorySlug = (searchParams.get("category") || "").trim();
    const order = searchParams.get("sort") === "oldest" ? "asc" : "desc";

    if (page < 1 || perPage < 1 || perPage > 100) {
      return NextResponse.json(
        { error: "Invalid page or per_page parameter" },
        { status: 400 }
      );
    }

    const [categories, sources] = await Promise.all([
      getAllCategories(),
      issueSlug ? getIssueArchiveSources() : Promise.resolve([]),
    ]);

    const magCategory = categories.find((entry) => entry.slug === "mag");
    if (!magCategory) {
      return NextResponse.json({ posts: [], page, per_page: perPage, total: 0 });
    }

    const categoryIds = [magCategory.id];
    if (categorySlug) {
      const extra = categories.find((entry) => entry.slug === categorySlug);
      if (extra && extra.id !== magCategory.id) categoryIds.push(extra.id);
    }

    let tagId: number | undefined;
    if (issueSlug) {
      const issue = parseIssues(sources).find((entry) => entry.slug === issueSlug);
      if (issue) {
        if (typeof issue.issueTag === "number") {
          tagId = issue.issueTag;
        } else {
          const tag = await getTagBySlug(String(issue.issueTag)).catch(() => undefined);
          if (tag?.id) tagId = tag.id;
        }
      }
    }

    const response = await api.get<Post[]>("/wp-json/wp/v2/posts", {
      params: {
        ...LIST_POST_PARAMS,
        categories: categoryIds.join(","),
        tags: tagId,
        search: query || undefined,
        page,
        per_page: perPage,
        orderby: "date",
        order,
      },
    });

    const enhancedPosts = await enhancePosts(response.data || [], categories);

    return NextResponse.json(
      {
        posts: enhancedPosts,
        page,
        per_page: perPage,
        total: Number(response.headers["x-wp-total"] || enhancedPosts.length),
        total_pages: Number(response.headers["x-wp-totalpages"] || 1),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching magazine archive:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch magazine articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
