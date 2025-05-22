import React from "react";
import KeepReading from "./KeepReading";

// Minimal mock EnhancedPost type for demo
const mockPosts = [
  {
    id: 1,
    slug: "mock-article-1",
    title: { rendered: "Mock Article One" },
    excerpt: { rendered: "<p>This is a mock excerpt for article one.</p>", protected: false },
    author_name: "Jane Doe",
    author_obj: { name: "Jane Doe" },
    featured_media_obj: {
      source_url: "/logo/logo.svg",
      alt_text: "Mock image alt text",
    },
    categories: [{ slug: "united-states" }],
    section: "united-states",
  },
  {
    id: 2,
    slug: "mock-article-2",
    title: { rendered: "Mock Article Two" },
    excerpt: { rendered: "<p>This is a mock excerpt for article two.</p>", protected: false },
    author_name: "John Smith",
    author_obj: { name: "John Smith" },
    featured_media_obj: null,
    categories: [{ slug: "world" }],
    section: "world",
  },
  {
    id: 3,
    slug: "mock-article-3",
    title: { rendered: "Mock Article Three" },
    excerpt: { rendered: "<p>This is a mock excerpt for article three.</p>", protected: false },
    author_name: "Staff Writer",
    author_obj: { name: "Staff Writer" },
    featured_media_obj: null,
    categories: [{ slug: "united-states" }],
    section: "united-states",
  },
];

const KeepReadingMockDemo = () => (
  <div style={{ background: "#f8f8f8", padding: 32 }}>
    <KeepReading posts={mockPosts as any} title="Mock Keep Reading" />
  </div>
);

export default KeepReadingMockDemo;
