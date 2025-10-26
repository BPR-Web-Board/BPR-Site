import React from "react";
import Hero from "../components/Hero";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";
import FourArticleGrid from "../components/FourArticleGrid";
import ArticleLayout from "../components/ArticleLayout/ArticleLayout";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import ArticleCarousel from "../components/ArticleCarousel";
import ArticleGrid from "../components/ArticleGrid";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import { enhancePosts } from "../lib/enhancePost";
import { getAllPosts, getPostsByCategorySlug } from "../lib/wordpress";
import { getAllCategories } from "../lib/wordpress";
import "../mainStyle.css";

export default async function ComponentsDemoPage() {
  // Fetch all posts and categories
  const allPosts = await getAllPosts();
  const categories = await getAllCategories();

  // Enhance posts
  const enhancedAllPosts = await enhancePosts(
    allPosts.slice(0, 30),
    categories
  );

  // Fetch posts from different categories for variety
  const usaPosts = await getPostsByCategorySlug("usa", 15);
  const enhancedUsaPosts = await enhancePosts(usaPosts, categories);

  const culturePosts = await getPostsByCategorySlug("usa", 15);
  const enhancedCulturePosts = await enhancePosts(culturePosts, categories);

  const economyPosts = await getPostsByCategorySlug("economy", 15);
  const enhancedEconomyPosts = await enhancePosts(economyPosts, categories);

  const asiaPacificPosts = await getPostsByCategorySlug("asia-pacific", 15);
  const enhancedAsiaPacificPosts = await enhancePosts(
    asiaPacificPosts,
    categories
  );

  const europePosts = await getPostsByCategorySlug("europe", 15);
  const enhancedEuropePosts = await enhancePosts(europePosts, categories);

  const middleEastPosts = await getPostsByCategorySlug("middle-east", 15);
  const enhancedMiddleEastPosts = await enhancePosts(
    middleEastPosts,
    categories
  );

  const environmentPosts = await getPostsByCategorySlug("environment", 12);
  const enhancedEnvironmentPosts = await enhancePosts(
    environmentPosts,
    categories
  );

  const educationPosts = await getPostsByCategorySlug("education", 12);
  const enhancedEducationPosts = await enhancePosts(educationPosts, categories);

  const electionsPosts = await getPostsByCategorySlug("elections", 12);
  const enhancedElectionsPosts = await enhancePosts(electionsPosts, categories);

  const technologyPosts = await getPostsByCategorySlug("usa", 10);
  const enhancedTechnologyPosts = await enhancePosts(
    technologyPosts,
    categories
  );

  return (
    <div className="page-container">
      <div style={{ padding: "2rem 0" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "2.5rem",
            marginBottom: "1rem",
          }}
        >
          BPR Components Demo
        </h1>
        <p
          style={{
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto 3rem",
            color: "#666",
          }}
        >
          This page showcases all the display components with real data from
          different categories. Use this to evaluate which components to keep
          and use in the final design.
        </p>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            1. Hero Component
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Large featured article with full-width image background
          </p>
          <Hero posts={enhancedAllPosts} />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            2. Hero Component (with Preferred Category)
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Hero that prefers articles from a specific category (USA)
          </p>
          <Hero posts={enhancedAllPosts} preferredCategory="usa" />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            3. Article Preview Grid
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Three-column layout: 2 medium articles (left), 1 large featured
            (center), 5 small articles (right)
          </p>
          <ArticlePreviewGrid articles={enhancedAllPosts.slice(0, 10)} />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            4. Four Article Grid (1 Row)
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Grid of 4 articles in a single row with bounding lines - Culture
            category
          </p>
          <FourArticleGrid
            posts={enhancedCulturePosts}
            categoryName="CULTURE"
            showCategoryTitle={true}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            5. Four Article Grid (2 Rows)
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Grid of 8 articles in 2 rows with bounding lines - United States
            category
          </p>
          <FourArticleGrid
            posts={enhancedUsaPosts}
            categoryName="UNITED STATES"
            showCategoryTitle={true}
            numberOfRows={2}
            showBoundingLines={true}
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            6. Four Article Grid (Without Category Title)
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Same grid but without category title - Economy posts
          </p>
          <FourArticleGrid
            posts={enhancedEconomyPosts}
            categoryName="ECONOMY"
            showCategoryTitle={false}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            7. Article Layout
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Layout with one large featured article and 4 smaller sidebar
            articles - Asia/Pacific
          </p>
          <ArticleLayout
            posts={enhancedAsiaPacificPosts.slice(0, 5)}
            categoryName="ASIA/PACIFIC"
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            8. Two Column Article Layout
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Side-by-side columns with featured articles and secondary articles -
            Europe vs Middle East
          </p>
          <TwoColumnArticleLayout
            leftColumnTitle="EUROPE"
            rightColumnTitle="MIDDLE EAST"
            leftColumnArticles={enhancedEuropePosts.slice(0, 5)}
            rightColumnArticles={enhancedMiddleEastPosts.slice(0, 5)}
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            9. Article Carousel
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Interactive carousel with navigation - Environment articles
          </p>
          <ArticleCarousel
            title="ENVIRONMENT"
            posts={enhancedEnvironmentPosts}
            maxArticles={5}
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            10. Article Grid
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            2x2 grid with horizontal divider between rows - Education
          </p>
          <ArticleGrid
            posts={enhancedEducationPosts}
            categoryName="EDUCATION"
            maxArticles={4}
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            11. Article Split Showcase
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Large featured story paired with a grid of supporting articles -
            Global highlights
          </p>
          <ArticleSplitShowcase
            posts={enhancedAllPosts.slice(0, 7)}
            sectionTitle="GLOBAL HIGHLIGHTS"
            maxSecondary={6}
            mainPlacement="left"
          />
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            12. Mixed Layout Example 1
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Combining Hero + Article Preview Grid + Four Article Grid
          </p>
          <div className="featured-content">
            <Hero posts={enhancedElectionsPosts} />
            <div className="article-layout-wrapper">
              <ArticlePreviewGrid
                articles={enhancedElectionsPosts.slice(0, 10)}
              />
              <FourArticleGrid
                posts={enhancedElectionsPosts}
                categoryName="ELECTIONS"
                showCategoryTitle={true}
                numberOfRows={1}
                showBoundingLines={true}
              />
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            13. Mixed Layout Example 2
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            Combining Hero + Two Column Layout + Article Layout
          </p>
          <div className="main-content">
            <Hero
              posts={enhancedTechnologyPosts}
              preferredCategory="technology"
            />
            <div className="two-column-layout-wrapper">
              <TwoColumnArticleLayout
                leftColumnTitle="TECHNOLOGY"
                rightColumnTitle="TECHNOLOGY"
                leftColumnArticles={enhancedTechnologyPosts.slice(0, 3)}
                rightColumnArticles={enhancedTechnologyPosts.slice(3, 8)}
              />
            </div>
            <div className="two-column-layout-wrapper">
              <ArticleLayout
                posts={enhancedTechnologyPosts.slice(0, 5)}
                categoryName="TECHNOLOGY"
              />
              <FourArticleGrid
                posts={enhancedTechnologyPosts}
                categoryName="TECHNOLOGY"
                showCategoryTitle={false}
                numberOfRows={1}
                showBoundingLines={true}
              />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0 0",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            14. Footer Component
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#666",
            }}
          >
            The Footer component is automatically included in the root layout
            and appears at the bottom of every page
          </p>
        </div>

        {/* Summary Section */}
        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            margin: "3rem 0",
            padding: "2rem 0",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Component Summary
          </h2>
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              padding: "0 2rem",
            }}
          >
            <ul style={{ lineHeight: "1.8", fontSize: "1rem" }}>
              <li>
                <strong>Hero</strong> - Full-width featured article with
                background image
              </li>
              <li>
                <strong>ArticlePreviewGrid</strong> - Asymmetric 3-column grid
                with various article sizes
              </li>
              <li>
                <strong>FourArticleGrid</strong> - Uniform 4-column grid,
                configurable rows
              </li>
              <li>
                <strong>ArticleLayout</strong> - Featured article with sidebar
                previews
              </li>
              <li>
                <strong>TwoColumnArticleLayout</strong> - Side-by-side category
                sections
              </li>
              <li>
                <strong>ArticleCarousel</strong> - Interactive slideshow with
                navigation
              </li>
              <li>
                <strong>ArticleGrid</strong> - 2x2 grid with dividers
              </li>
              <li>
                <strong>ArticleSplitShowcase</strong> - Featured article with aligned supporting headlines
              </li>
              <li>
                <strong>Footer</strong> - Site footer
              </li>
            </ul>
            <p style={{ marginTop: "2rem", color: "#666" }}>
              All components are populated with real data from different
              categories including USA, Culture, Economy, Asia/Pacific, Europe,
              Middle East, Environment, Education, Elections, and Technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
