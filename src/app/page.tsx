import React from "react";
import Hero from "./components/Hero";
import "./mainStyle.css";
import ArticleLayout from "./components/ArticleLayout/ArticleLayout";
import { enhancePreviewPosts } from "./lib/enhancePost";
import { getAllPosts, getPostsByCategorySlug } from "./lib/wordpress";
import { getAllCategories } from "./lib/wordpress";
import ArticlePreviewGrid from "./components/ArticlePreviewGrid";
import FourArticleGrid from "./components/FourArticleGrid";
import { PageContentManager } from "./lib/contentManager";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, categories, usaPosts, worldPosts, culturePosts, lawPosts] =
    await Promise.all([
      getAllPosts({ per_page: 25 }),
      getAllCategories(),
      getPostsByCategorySlug("usa", { per_page: 16 }),
      getPostsByCategorySlug("world", { per_page: 14 }),
      getPostsByCategorySlug("culture", { per_page: 12 }),
      getPostsByCategorySlug("law", { per_page: 10 }),
    ]);

  const [
    enhancedPosts,
    enhancedUsaPosts,
    enhancedWorldPosts,
    enhancedCulturePosts,
    enhancedLawPosts,
  ] = await Promise.all([
    enhancePreviewPosts(posts.slice(0, 25), categories),
    enhancePreviewPosts(usaPosts, categories),
    enhancePreviewPosts(worldPosts, categories),
    enhancePreviewPosts(culturePosts, categories),
    enhancePreviewPosts(lawPosts, categories),
  ]);

  const contentManager = new PageContentManager();

  const heroPool = contentManager.combineUniquePosts(
    enhancedPosts.filter((post) => post.featured_media_obj?.source_url),
    enhancedPosts,
    enhancedUsaPosts,
    enhancedWorldPosts,
    enhancedCulturePosts
  );
  const heroArticles = contentManager.selectArticles(heroPool, 5, {
    allowPartial: true,
  });
  const previewArticles = contentManager.selectArticles(
    contentManager.combineUniquePosts(enhancedPosts, enhancedUsaPosts),
    8,
    { allowPartial: true }
  );

  const usaPool = contentManager.ensureContent(enhancedUsaPosts, enhancedPosts);
  const usaNewsArticles = contentManager.selectArticles(usaPool, 8, {
    allowPartial: true,
  });

  const worldHeroArticles = contentManager.selectArticles(
    contentManager.combineUniquePosts(
      enhancedWorldPosts.filter((post) => post.featured_media_obj?.source_url),
      enhancedWorldPosts
    ),
    5,
    { allowPartial: true }
  );
  const worldLayoutArticles = contentManager.selectArticles(
    enhancedWorldPosts,
    5,
    { allowPartial: true }
  );
  const worldGrid = contentManager.selectArticles(enhancedWorldPosts, 4, {
    allowPartial: true,
  });

  const cultureArticles = contentManager.selectArticles(
    enhancedCulturePosts,
    8,
    { allowPartial: true }
  );

  const lawArticles = contentManager.selectArticles(enhancedLawPosts, 5, {
    allowPartial: true,
  });

  if (
    !heroArticles.length &&
    !previewArticles.length &&
    !usaNewsArticles.length &&
    !worldLayoutArticles.length &&
    !worldGrid.length &&
    !worldHeroArticles.length &&
    !cultureArticles.length &&
    !lawArticles.length
  ) {
    throw new Error("Homepage content unavailable from WordPress");
  }

  return (
    <div className="page-container">
      <div className="featured-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} priority={true} />
        )}
        <div className="article-layout-wrapper">
          {previewArticles.length > 0 && (
            <ArticlePreviewGrid articles={previewArticles} />
          )}
        </div>
      </div>
      <div className="main-content">
        {usaNewsArticles.length > 0 && (
          <div className="two-column-layout-wrapper">
            <FourArticleGrid
              posts={usaNewsArticles}
              categoryName="United States"
              numberOfRows={Math.ceil(usaNewsArticles.length / 4)}
              className="width-constrained"
            />
          </div>
        )}

        {worldHeroArticles.length > 0 && <Hero posts={worldHeroArticles} />}

        {(worldLayoutArticles.length > 0 || worldGrid.length > 0) && (
          <div className="two-column-layout-wrapper">
            {worldLayoutArticles.length > 0 && (
              <ArticleLayout posts={worldLayoutArticles} categoryName="World" />
            )}
            {worldGrid.length > 0 && (
              <FourArticleGrid
                posts={worldGrid}
                categoryName="World"
                showCategoryTitle={false}
                numberOfRows={1}
                className="width-constrained"
              />
            )}
          </div>
        )}

        {cultureArticles.length > 0 && (
          <div className="two-column-layout-wrapper">
            <FourArticleGrid
              posts={cultureArticles}
              categoryName="Culture"
              numberOfRows={Math.ceil(cultureArticles.length / 4)}
              className="width-constrained"
            />
          </div>
        )}

        {lawArticles.length > 0 && (
          <ArticleLayout posts={lawArticles} categoryName="Law & Justice" />
        )}
      </div>
    </div>
  );
}
