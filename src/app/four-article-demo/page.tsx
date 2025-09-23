import FourArticleGrid from "../components/FourArticleGrid";
import { enhancePosts } from "../lib/enhancePost";
import { getPostsByCategorySlug, getAllCategories } from "../lib/wordpress";

// Fetch sample posts for demo - fetch more for multi-row examples
const [economyPosts, worldPosts, usPosts, magazinePosts] = await Promise.all([
  getPostsByCategorySlug("economy", 8), // Get 8 for 2-row example
  getPostsByCategorySlug("world", 4),
  getPostsByCategorySlug("usa", 12), // Get 12 for 3-row example
  getPostsByCategorySlug("mag", 4),
]);

const categories = await getAllCategories();
const enhancedEconomyPosts = await enhancePosts(economyPosts, categories);
const enhancedWorldPosts = await enhancePosts(worldPosts, categories);
const enhancedUsPosts = await enhancePosts(usPosts, categories);
const enhancedMagazinePosts = await enhancePosts(magazinePosts, categories);

export default function FourArticleDemoPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-white)",
        padding: "2rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-primary-serif)",
            fontSize: "2.5rem",
            textAlign: "center",
            marginBottom: "3rem",
            color: "var(--color-black)",
          }}
        >
          Four Article Grid Demo
        </h1>

        {/* Single Row Example - Economy Category WITHOUT bounding lines */}
        <FourArticleGrid
          posts={enhancedEconomyPosts}
          categoryName="Economy"
          numberOfRows={1}
          showCategoryTitle={true}
          showBoundingLines={false}
        />

        <div style={{ height: "4rem" }}></div>

        {/* Single Row Example - World Category WITH bounding lines */}
        <FourArticleGrid
          posts={enhancedWorldPosts}
          categoryName="World"
          numberOfRows={1}
          showCategoryTitle={true}
          showBoundingLines={true}
        />

        <div style={{ height: "4rem" }}></div>

        {/* Two Row Example - Economy Category */}
        <FourArticleGrid
          posts={enhancedEconomyPosts}
          categoryName="Economy - 2 Rows"
          numberOfRows={2}
          showCategoryTitle={true}
          showBoundingLines={true}
        />

        <div style={{ height: "4rem" }}></div>

        {/* Three Row Example - US Category */}
        <FourArticleGrid
          posts={enhancedUsPosts}
          categoryName="USA - 3 Rows"
          numberOfRows={3}
          showCategoryTitle={true}
          showBoundingLines={true}
        />

        <div style={{ height: "4rem" }}></div>

        {/* Example without category title (for use as "Keep Reading" section) */}
        <div
          style={{
            padding: "2rem",
            backgroundColor: "var(--color-light-gray)",
            borderRadius: "0.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-primary-serif)",
              fontSize: "1.75rem",
              marginBottom: "2rem",
              color: "var(--color-black)",
            }}
          >
            Keep Reading
          </h2>
          <FourArticleGrid
            posts={enhancedMagazinePosts}
            numberOfRows={1}
            showCategoryTitle={false}
            showBoundingLines={true}
            className="keep-reading-section"
          />
        </div>
      </div>
    </div>
  );
}
