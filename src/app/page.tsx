import Image from "next/image";
import Footer from "./components/Footer/Footer";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import KeepReading from "./components/KeepReading";
import KeepReadingMockDemo from "./components/KeepReading/KeepReadingMockDemo";
import LatestIssueGrid from "./components/LatestIssueGrid/LatestIssueGrid";
import { getAllPosts, getFeaturedMediaById } from "./lib/wordpress";
import type { Post, EnhancedPost } from "./lib/types";

export default async function Home() {
  // Try to fetch real posts from WordPress
  let posts: Post[] = [];
  let enhancedPosts: EnhancedPost[] = [];
  try {
    posts = await getAllPosts();
    // Hydrate posts with featured_media_obj
    enhancedPosts = await Promise.all(
      posts.map(async (post) => {
        let featured_media_obj = null;
        if (post.featured_media && typeof post.featured_media === "number") {
          try {
            featured_media_obj = await getFeaturedMediaById(post.featured_media);
          } catch {}
        }
        return { ...post, featured_media_obj };
      })
    );
  } catch (e) {
    // Ignore error, fallback to mock
  }
  return (
    <div className="">
      <NavigationBar />
      <main className="">
        <Image
          src="/logo/logo.svg"
          alt="The Brown Political Review Logo"
          width={280}
          height={70}
          priority
        />
        {/* Latest Issue Grid Demo */}
        <div style={{ margin: "48px 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>Latest Issue (Real Data)</h2>
          <LatestIssueGrid posts={enhancedPosts} title="Latest Issue" />
        </div>
        {/* Real data demo */}
        <div style={{ margin: "48px 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>Keep Reading (Real Data)</h2>
          <KeepReading posts={enhancedPosts} title="Keep Reading" />
        </div>
        {/* Mock data demo */}
        <div style={{ margin: "48px 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>Keep Reading (Mock Data)</h2>
          <KeepReadingMockDemo />
        </div>
      </main>
      <Footer />
    </div>
  );
}
