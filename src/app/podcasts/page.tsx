import React from "react";
import { Metadata } from "next";
import {
  getAllCategories,
  getPostsByCategorySlug,
} from "../lib/wordpress";
import { enhancePosts } from "../lib/enhancePost";
import FeaturedPodcast from "../components/FeaturedPodcast";
import PodcastGrid from "../components/PodcastGrid";
import "./podcasts.css";

export const metadata: Metadata = {
  title: "Podcasts | Brown Political Review",
  description:
    "Listen to the latest podcasts from Brown Political Review. Featuring in-depth conversations, news analysis, and interviews with experts.",
};

async function getPodcastsByCategory(slug: string, limit: number = 12) {
  try {
    const posts = await getPostsByCategorySlug(slug, limit);
    return posts || [];
  } catch (error) {
    console.error(`Error fetching podcasts for category ${slug}:`, error);
    return [];
  }
}

export default async function PodcastsPage() {
  try {
    // Fetch all categories first
    const allCategories = await getAllCategories();

    // Fetch podcasts from main BPR Radio category and related categories
    const [bprRadioPosts, worldPodcasts, usPodcasts, magazinePodcasts] =
      await Promise.all([
        getPodcastsByCategory("bpradio", 8),
        getPodcastsByCategory("world", 8),
        getPodcastsByCategory("united-states", 8),
        getPodcastsByCategory("magazine", 8),
      ]);

    // Enhance all posts with metadata
    const enhancedBprRadio = await enhancePosts(bprRadioPosts, allCategories);
    const enhancedWorld = await enhancePosts(worldPodcasts, allCategories);
    const enhancedUS = await enhancePosts(usPodcasts, allCategories);
    const enhancedMagazine = await enhancePosts(magazinePodcasts, allCategories);

    // Get featured podcast (latest from BPR Radio)
    const featuredPodcast =
      enhancedBprRadio.length > 0 ? enhancedBprRadio[0] : null;

    // Get related podcasts for "Beyond the Article" section
    const relatedPodcasts =
      enhancedBprRadio.length > 1 ? enhancedBprRadio.slice(1, 5) : [];

    return (
      <div className="podcasts-page">
        {/* Hero Section */}
        <section className="podcasts-hero">
          <div className="podcasts-hero-content">
            <h1 className="podcasts-hero-title">Podcast</h1>
            <p className="podcasts-hero-subtitle">
              Explore in-depth conversations, analysis, and interviews from
              Brown Political Review
            </p>
          </div>
        </section>

        {/* Featured Podcast Section */}
        {featuredPodcast && (
          <section className="podcasts-featured-section">
            <FeaturedPodcast podcast={featuredPodcast} />
          </section>
        )}

        {/* Beyond the Article Section */}
        {relatedPodcasts.length > 0 && (
          <section className="podcasts-beyond-section">
            <div className="section-container">
              <h2 className="section-title">Beyond the Article</h2>
              <PodcastGrid
                podcasts={relatedPodcasts}
                showTitle={false}
                numberOfRows={1}
                className="beyond-podcast-grid"
              />
              <a href="#" className="more-episodes-link">
                More episodes
              </a>
            </div>
          </section>
        )}

        {/* World Podcasts Section */}
        {enhancedWorld.length > 0 && (
          <section className="podcasts-section">
            <PodcastGrid
              podcasts={enhancedWorld}
              title="World"
              numberOfRows={1}
              className="podcasts-world-grid"
            />
          </section>
        )}

        {/* US Podcasts Section */}
        {enhancedUS.length > 0 && (
          <section className="podcasts-section">
            <PodcastGrid
              podcasts={enhancedUS}
              title="US"
              numberOfRows={1}
              className="podcasts-us-grid"
            />
          </section>
        )}

        {/* Magazine Podcasts Section */}
        {enhancedMagazine.length > 0 && (
          <section className="podcasts-section">
            <PodcastGrid
              podcasts={enhancedMagazine}
              title="Magazine"
              numberOfRows={1}
              className="podcasts-magazine-grid"
            />
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading podcasts page:", error);
    return (
      <div className="podcasts-page">
        <section className="podcasts-error">
          <div className="error-container">
            <h1>Podcasts</h1>
            <p>
              Unable to load podcasts at this time. Please try again later.
            </p>
          </div>
        </section>
      </div>
    );
  }
}
