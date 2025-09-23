import React from "react";
import FeaturedArticleLayout from "../components/FeaturedArticleLayout";
import { enhancePosts } from "../lib/enhancePost";
import { getPostsByCategorySlug, getAllCategories } from "../lib/wordpress";

const usaPosts = await getPostsByCategorySlug("usa", 10);
const categories = await getAllCategories();
const enhancedUsaPosts = await enhancePosts(usaPosts, categories);

const worldPosts = await getPostsByCategorySlug("world", 10);
const enhancedWorldPosts = await enhancePosts(worldPosts, categories);

const magazinePosts = await getPostsByCategorySlug("mag", 10);
const enhancedMagazinePosts = await enhancePosts(magazinePosts, categories);

export default function FeaturedArticleDemo() {
  return (
    <div className="page-container">
      <main className="main-content">
        <div
          style={{ padding: "64px 32px", maxWidth: "1440px", margin: "0 auto" }}
        >
          <header style={{ marginBottom: "64px", textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "var(--font-primary-serif)",
                fontSize: "48px",
                marginBottom: "16px",
                color: "#000",
              }}
            >
              Featured Article Layout Demo
            </h1>
            <p
              style={{
                fontFamily: "var(--font-primary-text)",
                fontSize: "18px",
                color: "#666",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Layout component featuring one large article on the left and a
              list of smaller articles on the right in two columns.
            </p>
          </header>

          {/* Demo with Local Category */}
          <section style={{ marginBottom: "80px" }}>
            <FeaturedArticleLayout
              title="Local"
              category="USA"
              posts={enhancedUsaPosts}
              maxArticles={7}
              featuredIndex={0}
            />
          </section>

          {/* Demo with World Category */}
          <section style={{ marginBottom: "80px" }}>
            <FeaturedArticleLayout
              title="World News"
              category="World"
              posts={enhancedWorldPosts}
              maxArticles={7}
              featuredIndex={1}
            />
          </section>

          {/* Demo with Magazine Category */}
          <section style={{ marginBottom: "80px" }}>
            <FeaturedArticleLayout
              title="Magazine"
              category="Magazine"
              posts={enhancedMagazinePosts}
              maxArticles={7}
              featuredIndex={0}
            />
          </section>

          <section
            style={{
              padding: "32px",
              backgroundColor: "#f8f8f8",
              borderRadius: "8px",
              marginTop: "64px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-primary-serif)",
                fontSize: "24px",
                marginBottom: "16px",
                color: "#000",
              }}
            >
              Component Features
            </h3>
            <ul
              style={{
                fontFamily: "var(--font-primary-text)",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#444",
              }}
            >
              <li>
                Featured article layout with large image and prominent display
              </li>
              <li>Six smaller articles arranged in 2x3 grid on the right</li>
              <li>
                Configurable featured article selection (featuredIndex prop)
              </li>
              <li>Fetches real WordPress API data by category</li>
              <li>
                Exact typography: Playfair Display for title, Libre Franklin for
                articles
              </li>
              <li>Responsive design: stacks vertically on mobile devices</li>
              <li>Proper divider lines between list articles</li>
              <li>Smart text truncation for consistent spacing</li>
              <li>Author bylines and date formatting</li>
              <li>Hover effects and proper link handling</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
