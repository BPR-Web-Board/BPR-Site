import Image from "next/image";
import Footer from "./components/Footer/Footer";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import KeepReading from "./components/KeepReading";
import KeepReadingMockDemo from "./components/KeepReading/KeepReadingMockDemo";
import { getAllPosts } from "./lib/wordpress";
import type { Post } from "./lib/types";

export default async function Home() {
  // Try to fetch real posts from WordPress
  let posts: Post[] = [];
  try {
    posts = await getAllPosts();
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
        {/* Real data demo */}
        <div style={{ margin: "48px 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>Keep Reading (Real Data)</h2>
          <KeepReading posts={posts as any} title="Keep Reading" />
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
