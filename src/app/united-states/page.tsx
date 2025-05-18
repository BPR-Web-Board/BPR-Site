import React from "react";
import { Metadata } from "next";
import { getAllCategories } from "@/app/lib/wordpress";
import { getEnhancedPosts, EnhancedPost } from "@/app/lib/enhanced-wordpress";
import NavigationBar from "@/app/components/NavigationBar/NavigationBar";
import Footer from "@/app/components/Footer/Footer";
import SectionPage from "@/app/components/SectionPage/SectionPage";

export const metadata: Metadata = {
  title: "United States - Brown Political Review",
  description:
    "Explore political analysis and commentary on US politics, law, economy, public policy, and more from Brown Political Review.",
};

export default async function UnitedStatesPage() {
  try {
    // Fetch US section categories
    const allCategories = await getAllCategories();
    console.log("allCategories", allCategories);
    const usCategories = allCategories.filter(
      (cat) =>
        cat.slug.includes("united-states") ||
        [
          "law",
          "economy",
          "science",
          "local",
          "public-policy",
          "culture",
          "foreign-policy",
        ].includes(cat.slug)
    );

    // Fetch enhanced posts with author and media information
    const enhancedPosts = await getEnhancedPosts({ category: "20" }, 20);

    console.log("enhancedPosts", enhancedPosts);

    // For demo purposes, let's assume the first post is the featured one
    const featuredPost =
      enhancedPosts.length > 0 ? enhancedPosts[0] : undefined;

    return (
      <div className="page-container">
        <NavigationBar />
        <main className="main-content">
          <SectionPage
            title="United States"
            featuredPost={featuredPost}
            posts={enhancedPosts.slice(1)}
            categories={usCategories}
            className="united-states-section"
          />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error in UnitedStatesPage:", error);

    // Return a fallback UI in case of error
    return (
      <div className="page-container">
        <NavigationBar />
        <main className="main-content">
          <div className="section-page">
            <h1 className="section-title">United States</h1>
            <div className="error-message">
              <p>
                An error occurred while loading content. Please try again later.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
