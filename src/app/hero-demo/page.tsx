import React from "react";
import Hero from "../components/Hero";
import { enhancePosts } from "../lib/enhancePost";
import { getAllPosts, getAllCategories } from "../lib/wordpress";

// Fetch posts for demo
const posts = await getAllPosts();
const categories = await getAllCategories();
const enhancedPosts = await enhancePosts(posts.slice(0, 10), categories);

const HeroDemoPage = () => {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Hero posts={enhancedPosts} preferredCategory="united-states" />
    </div>
  );
};

export default HeroDemoPage;
