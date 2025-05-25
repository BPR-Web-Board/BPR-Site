import React from "react";
import SectionGrid from "./SectionGrid";
import { EnhancedPost } from "../../lib/types";

// Mock data for demo purposes - using type assertion to handle missing properties
const mockPosts = [
  {
    id: 1,
    title: {
      rendered: "Understanding the Economic Impact of Recent Policy Changes",
    },
    excerpt: {
      rendered:
        "An in-depth analysis of how recent policy decisions are reshaping the American economic landscape and what it means for different sectors.",
      protected: false,
    },
    author: 101,
    author_name: "Maria Johnson",
    slug: "economic-impact-policy-changes",
    date: "2023-09-15T14:30:00",
    featured_media: 1001,
    featured_media_obj: {
      id: 1001,
      source_url: "/images/demo/economy.jpg",
      alt_text: "US Capitol building with financial district in background",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
    categories_obj: [
      {
        id: 5,
        name: "United States",
        slug: "united-states",
        count: 0,
        description: "",
        link: "",
        taxonomy: "category",
        parent: 0,
        meta: [],
      },
    ],
  },
  {
    id: 2,
    title: { rendered: "The Supreme Court's Latest Rulings Explained" },
    excerpt: {
      rendered:
        "A breakdown of the most significant Supreme Court decisions this term and their implications for constitutional law.",
      protected: false,
    },
    author: 102,
    author_name: "James Wilson",
    slug: "supreme-court-rulings-explained",
    date: "2023-09-10T09:15:00",
    featured_media: 1002,
    featured_media_obj: {
      id: 1002,
      source_url: "/images/demo/supreme-court.jpg",
      alt_text: "Supreme Court building",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
  },
  {
    id: 3,
    title: { rendered: "Tech Innovation Hubs Reshaping Rural America" },
    excerpt: {
      rendered:
        "How technology companies are establishing new innovation centers in rural areas and the impact on local communities.",
      protected: false,
    },
    author: 103,
    author_name: "Sarah Chen",
    slug: "tech-innovation-rural-america",
    date: "2023-09-08T11:45:00",
    featured_media: 1003,
    featured_media_obj: {
      id: 1003,
      source_url: "/images/demo/tech-rural.jpg",
      alt_text: "Modern tech office in rural setting",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
  },
  {
    id: 4,
    title: { rendered: "Climate Policy and Industrial Development" },
    excerpt: {
      rendered:
        "An analysis of how new climate policies are influencing industrial development across different states.",
      protected: false,
    },
    author: 104,
    author_name: "Michael Rivera",
    slug: "climate-policy-industrial-development",
    date: "2023-09-05T15:20:00",
    featured_media: 1004,
    featured_media_obj: {
      id: 1004,
      source_url: "/images/demo/climate-industry.jpg",
      alt_text: "Solar panels at industrial facility",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
  },
  {
    id: 5,
    title: { rendered: "Healthcare Access in Underserved Communities" },
    excerpt: {
      rendered:
        "Investigating the challenges and potential solutions for improving healthcare access in underserved regions.",
      protected: false,
    },
    author: 105,
    author_name: "Elena Rodriguez",
    slug: "healthcare-access-underserved-communities",
    date: "2023-09-03T10:00:00",
    featured_media: 1005,
    featured_media_obj: {
      id: 1005,
      source_url: "/images/demo/healthcare.jpg",
      alt_text: "Rural healthcare clinic",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
  },
  {
    id: 6,
    title: { rendered: "Education Reform Initiatives Gain Momentum" },
    excerpt: {
      rendered:
        "A look at the latest education reform initiatives across states and their potential impact on student outcomes.",
      protected: false,
    },
    author: 106,
    author_name: "Daniel Kim",
    slug: "education-reform-initiatives",
    date: "2023-09-01T14:10:00",
    featured_media: 1006,
    featured_media_obj: {
      id: 1006,
      source_url: "/images/demo/education.jpg",
      alt_text: "Modern classroom with students",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
  },
  {
    id: 7,
    title: { rendered: "The Changing Landscape of American Agriculture" },
    excerpt: {
      rendered:
        "How technology and climate change are transforming farming practices across the American heartland.",
      protected: false,
    },
    author: 107,
    author_name: "Thomas Miller",
    slug: "changing-landscape-american-agriculture",
    date: "2023-08-28T09:30:00",
    featured_media: 1007,
    featured_media_obj: {
      id: 1007,
      source_url: "/images/demo/agriculture.jpg",
      alt_text: "Modern farm with technology integration",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
  },
  {
    id: 8,
    title: { rendered: "Infrastructure Investment in Urban Centers" },
    excerpt: {
      rendered:
        "How federal infrastructure funding is being allocated to revitalize America's urban centers and improve public transportation.",
      protected: false,
    },
    author: 108,
    author_name: "Alicia Washington",
    slug: "infrastructure-investment-urban-centers",
    date: "2023-08-25T13:15:00",
    featured_media: 1008,
    featured_media_obj: {
      id: 1008,
      source_url: "/images/demo/infrastructure.jpg",
      alt_text: "Urban infrastructure construction",
      date: "",
      slug: "",
      type: "",
      link: "",
      title: { rendered: "" },
      author: 0,
      caption: { rendered: "" },
      media_type: "",
      mime_type: "",
      media_details: { width: 0, height: 0, file: "", sizes: {} },
    },
    categories: [5],
  },
] as EnhancedPost[];

const SectionGridDemo: React.FC = () => {
  return (
    <div
      className="section-grid-demo-container"
      style={{ maxWidth: "1280px", margin: "0 auto" }}
    >
      <SectionGrid
        posts={mockPosts}
        sectionTitle="United States"
        maxPosts={8}
        gridColumns={2}
      />
    </div>
  );
};

export default SectionGridDemo;
