"use client";

import React, { useEffect } from "react";
import "./SpotifyEmbed.css";

export interface SpotifyEmbedProps {
  spotifyUrl: string;
  height?: number;
  width?: string;
  className?: string;
}

const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({
  spotifyUrl,
  height = 152,
  width = "100%",
  className = "",
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Extract Spotify URI from URL
  const spotifyUri = extractSpotifyUri(spotifyUrl);

  useEffect(() => {
    // Load Spotify embed script if not already loaded
    if (!window.spotifyEmbedScript) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/oembed";
      script.async = true;
      document.body.appendChild(script);
      window.spotifyEmbedScript = script;
    } else if (window.spotifyEmbedScript) {
      // Re-process embeds if script is already loaded
      const spotifyWindow = window as unknown as {
        spotify?: {
          embed?: {
            processEmbeds?: () => void;
          };
        };
      };
      if (spotifyWindow.spotify?.embed?.processEmbeds) {
        spotifyWindow.spotify.embed.processEmbeds();
      }
    }
  }, [spotifyUrl]);

  if (!spotifyUri) {
    return (
      <div className={`spotify-embed-error ${className}`}>
        <p>Invalid Spotify URL</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`spotify-embed-container ${className}`}
      style={{
        height: `${height}px`,
        width: width,
      }}
    >
      <iframe
        style={{
          borderRadius: "12px",
          border: "0",
          width: "100%",
          height: "100%",
        }}
        src={`https://open.spotify.com/embed/episode/${spotifyUri}?utm_source=generator`}
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Embed"
      />
    </div>
  );
};

// Helper function to extract Spotify URI from URL
function extractSpotifyUri(url: string): string | null {
  try {
    // Handle various Spotify URL formats
    // Format 1: spotify:episode:XXXXX
    if (url.includes("spotify:")) {
      const match = url.match(/spotify:episode:([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    }

    // Format 2: https://open.spotify.com/episode/XXXXX
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");
    const episodeIndex = pathSegments.indexOf("episode");

    if (episodeIndex !== -1 && episodeIndex < pathSegments.length - 1) {
      return pathSegments[episodeIndex + 1].split("?")[0];
    }

    return null;
  } catch {
    // If URL parsing fails, try regex extraction
    const regex = /episode\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

// Extend Window interface to support Spotify script
declare global {
  interface Window {
    spotifyEmbedScript?: HTMLScriptElement;
    spotify?: {
      embed?: {
        processEmbeds?: () => void;
      };
    };
  }
}

export default SpotifyEmbed;
