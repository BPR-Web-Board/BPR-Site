"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./PodcastPage.css";

// Type definitions
interface PodcastItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  image: string;
  spotifyUrl: string;
  authors?: string[];
  description?: string;
}

interface SectionData {
  title: string;
  podcasts: PodcastItem[];
}

const PodcastPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [featuredPodcast, setFeaturedPodcast] = useState<PodcastItem | null>(
    null
  );
  const [beyondArticlePodcasts, setBeyondArticlePodcasts] = useState<
    PodcastItem[]
  >([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch featured podcast (this would be replaced with your actual API call)
    const fetchFeaturedPodcast = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/featured-podcast');
        // const data = await response.json();

        // Mock data for demonstration
        const data = {
          id: "featured-1",
          title: "Dark Days for the Petrodollar",
          date: "October 11, 2023",
          duration: "26:56",
          image: "/images/featured-podcast.jpg",
          spotifyUrl: "https://open.spotify.com/episode/123456",
          authors: ["David Pinto", "Tianyu Zhou"],
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus.",
        };

        setFeaturedPodcast(data);
      } catch (err) {
        setError("Failed to load featured podcast");
        console.error(err);
      }
    };

    // Fetch podcasts for Beyond the Article section
    const fetchBeyondArticlePodcasts = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/beyond-article-podcasts');
        // const data = await response.json();

        // Mock data for demonstration - now with 3 podcasts for the new layout
        const data = [
          {
            id: "beyond-1",
            title: "Dark Days for the Petrodollar",
            date: "October 11, 2023",
            duration: "26:56",
            image: "/images/beyond-podcast-1.jpg",
            spotifyUrl: "https://open.spotify.com/episode/123456",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus.",
          },
          {
            id: "beyond-2",
            title: "Dark Days for the Petrodollar",
            date: "October 11, 2023",
            duration: "26:56",
            image: "/images/election-podcast.jpg",
            spotifyUrl: "https://open.spotify.com/episode/789012",
          },
          {
            id: "beyond-3",
            title: "Dark Days for the Petrodollar",
            date: "October 11, 2023",
            duration: "26:56",
            image: "/images/election-podcast.jpg",
            spotifyUrl: "https://open.spotify.com/episode/345678",
          },
        ];

        setBeyondArticlePodcasts(data);
      } catch (err) {
        setError("Failed to load Beyond the Article podcasts");
        console.error(err);
      }
    };

    // Fetch section data from Spotify API
    const fetchSectionData = async () => {
      try {
        // This would be replaced with actual Spotify API calls
        // const response = await fetch('/api/spotify-sections');
        // const data = await response.json();

        // Mock data for demonstration
        const data = [
          {
            title: "Interviews",
            podcasts: Array(4)
              .fill(null)
              .map((_, i) => ({
                id: `interview-${i}`,
                title: "Dark Days for the Petrodollar",
                date: "October 11, 2023",
                duration: "26:56",
                image: "/images/interview-podcast.jpg",
                spotifyUrl: `https://open.spotify.com/episode/interview${i}`,
              })),
          },
          {
            title: "US",
            podcasts: Array(4)
              .fill(null)
              .map((_, i) => ({
                id: `us-${i}`,
                title: "Dark Days for the Petrodollar",
                date: "October 11, 2023",
                duration: "26:56",
                image: "/images/us-podcast.jpg",
                spotifyUrl: `https://open.spotify.com/episode/us${i}`,
              })),
          },
        ];

        setSections(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load section data");
        console.error(err);
        setLoading(false);
      }
    };

    fetchFeaturedPodcast();
    fetchBeyondArticlePodcasts();
    fetchSectionData();
  }, []);

  const handlePodcastClick = (spotifyUrl: string) => {
    window.open(spotifyUrl, "_blank", "noopener,noreferrer");
  };

  const handleMoreEpisodes = (sectionTitle: string) => {
    // Using Next.js App Router navigation
    router.push(`/podcasts/section/${sectionTitle.toLowerCase()}`);
  };

  if (loading) {
    return <div className="loading">Loading podcasts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="podcast-page">
      <h1 className="page-title">Podcast</h1>

      {/* Featured Podcast */}
      {featuredPodcast && (
        <div className="featured-podcast">
          <div className="featured-content">
            <div
              className="featured-image-container"
              onClick={() => handlePodcastClick(featuredPodcast.spotifyUrl)}
            >
              <img
                src={featuredPodcast.image}
                alt={featuredPodcast.title}
                className="featured-image"
              />
            </div>
            <div className="featured-info">
              <div className="podcast-date">{featuredPodcast.date}</div>
              <h2 className="podcast-title">{featuredPodcast.title}</h2>
              <div className="podcast-duration">
                <span className="duration-icon">▶</span>{" "}
                {featuredPodcast.duration}
              </div>
              <p className="podcast-description">
                {featuredPodcast.description}
              </p>
              {featuredPodcast.authors && (
                <div className="podcast-authors">
                  BY {featuredPodcast.authors.join(" AND ")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Beyond the Article Section - Updated to match the design in the image */}
      <div className="section">
        <h2 className="section-title">Beyond the Article</h2>
        <div className="beyond-article-layout">
          {beyondArticlePodcasts.length > 0 && (
            <div
              className="beyond-article-main"
              onClick={() =>
                handlePodcastClick(beyondArticlePodcasts[0].spotifyUrl)
              }
            >
              <div className="beyond-article-main-image-container">
                <img
                  src={beyondArticlePodcasts[0].image}
                  alt={beyondArticlePodcasts[0].title}
                  className="beyond-article-main-image"
                />
              </div>
              <div className="beyond-article-main-info">
                <div className="podcast-date">
                  {beyondArticlePodcasts[0].date}
                </div>
                <h3 className="podcast-title">
                  {beyondArticlePodcasts[0].title}
                </h3>
                <div className="podcast-duration">
                  <span className="duration-icon">▶</span>{" "}
                  {beyondArticlePodcasts[0].duration}
                </div>
                {beyondArticlePodcasts[0].description && (
                  <p className="podcast-description">
                    {beyondArticlePodcasts[0].description}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="beyond-article-sidebar">
            {beyondArticlePodcasts.slice(1, 3).map((podcast) => (
              <div
                key={podcast.id}
                className="beyond-article-sidebar-item"
                onClick={() => handlePodcastClick(podcast.spotifyUrl)}
              >
                <div className="beyond-article-sidebar-image-container">
                  <img
                    src={podcast.image}
                    alt={podcast.title}
                    className="beyond-article-sidebar-image"
                  />
                </div>
                <div className="beyond-article-sidebar-info">
                  <div className="podcast-date">{podcast.date}</div>
                  <h3 className="podcast-title">{podcast.title}</h3>
                  <div className="podcast-duration">
                    <span className="duration-icon">▶</span> {podcast.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Sections from Spotify API */}
      {sections.map((section) => (
        <div key={section.title} className="section">
          <h2 className="section-title">{section.title}</h2>
          <div className="podcast-grid">
            {section.podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="podcast-card"
                onClick={() => handlePodcastClick(podcast.spotifyUrl)}
              >
                <div className="podcast-image-container">
                  <img
                    src={podcast.image}
                    alt={podcast.title}
                    className="podcast-image"
                  />
                </div>
                <h3 className="podcast-card-title">{podcast.title}</h3>
                <div className="podcast-duration">
                  <span className="duration-icon">▶</span> {podcast.duration}
                </div>
              </div>
            ))}
          </div>
          <button
            className="more-episodes-btn"
            onClick={() => handleMoreEpisodes(section.title)}
          >
            More episodes
          </button>
        </div>
      ))}
    </div>
  );
};

export default PodcastPage;
