import React from "react";
import { Metadata } from "next";
import {
  getAllPosts,
  getCategoryBySlug,
  getAllCategories,
  getAuthorById,
  getFeaturedMediaById,
} from "@/lib/wordpress";
import { Category } from "@/lib/wordpress.d";
import {
  FeaturedArticlePreview,
  StandardArticlePreview,
  ListArticlePreview,
} from "@/components/ArticlePreview";
import styles from "./WorldPage.module.css";

export const metadata: Metadata = {
  title: "World News | Brown Political Review",
  description:
    "Global news coverage and analysis from the Brown Political Review.",
};

// Helper function to get only sub-categories of a parent category
async function getSubCategories(
  parentCategorySlug: string
): Promise<Category[]> {
  const allCategories = await getAllCategories();
  const parentCategory = await getCategoryBySlug(parentCategorySlug);

  if (!parentCategory) return [];

  return allCategories.filter(
    (category) => category.parent === parentCategory.id
  );
}

export default async function WorldPage() {
  // Get the World category
  const worldCategory = await getCategoryBySlug("world");

  if (!worldCategory) {
    throw new Error("World category not found");
  }

  // Get subcategories of World (regions like AFRICA, AMERICAS, etc.)
  const regions = await getSubCategories("world");

  // Get world news posts
  const posts = await getAllPosts({ category: worldCategory.id.toString() });

  // Separate posts for different sections
  const featuredPost = posts[0]; // First post as featured
  const secondaryPosts = posts.slice(1, 4); // Next 3 posts for secondary section
  const remainingPosts = posts.slice(4); // Rest for the grid

  // Fetch additional data for featured post
  const featuredPostAuthor = featuredPost
    ? await getAuthorById(featuredPost.author)
    : null;
  const featuredPostMedia =
    featuredPost?.featured_media > 0
      ? await getFeaturedMediaById(featuredPost.featured_media)
      : null;

  // Fetch data for secondary posts
  const secondaryPostsData = await Promise.all(
    secondaryPosts.map(async (post) => {
      const author = await getAuthorById(post.author);
      const media =
        post.featured_media > 0
          ? await getFeaturedMediaById(post.featured_media)
          : null;
      return { post, author, media };
    })
  );

  // Fetch data for remaining posts
  const remainingPostsData = await Promise.all(
    remainingPosts.map(async (post) => {
      const author = await getAuthorById(post.author);
      const media =
        post.featured_media > 0
          ? await getFeaturedMediaById(post.featured_media)
          : null;
      return { post, author, media };
    })
  );

  return (
    <main className={styles.worldPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>World News</h1>

        {/* Region Navigation */}
        <nav className={styles.regionNav}>
          <ul className={styles.regionList}>
            {regions.map((region) => (
              <li key={region.id} className={styles.regionItem}>
                <a href={`#${region.slug}`} className={styles.regionLink}>
                  {region.name.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Featured Article Section */}
        {featuredPost && (
          <section className={styles.featuredSection}>
            <FeaturedArticlePreview
              post={featuredPost}
              author={featuredPostAuthor}
              category={worldCategory}
              featuredMedia={featuredPostMedia}
            />
          </section>
        )}

        {/* Secondary Articles Section */}
        <section className={styles.secondarySection}>
          <div className={styles.secondaryGrid}>
            {secondaryPostsData.map(({ post, author, media }) => (
              <StandardArticlePreview
                key={post.id}
                post={post}
                author={author}
                category={worldCategory}
                featuredMedia={media}
              />
            ))}
          </div>
        </section>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Articles Grid Section */}
        <section className={styles.articlesGrid}>
          {remainingPostsData.map(({ post, author, media }) => (
            <StandardArticlePreview
              key={post.id}
              post={post}
              author={author}
              category={worldCategory}
              featuredMedia={media}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
