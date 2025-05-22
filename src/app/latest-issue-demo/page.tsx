import React from "react";
import LatestIssueGrid from "../components/LatestIssueGrid/LatestIssueGrid";
import { EnhancedPost } from "../lib/types";

// Reuse the mock data from KeepReadingMockDemo
import mockPostsData from "../components/KeepReading/KeepReadingMockDemo";

const mockPosts: EnhancedPost[] = (mockPostsData as any).default ? (mockPostsData as any).default : (mockPostsData as EnhancedPost[]);

const LatestIssueDemoPage = () => (
  <div style={{ background: "#f8f8f8", padding: 32, minHeight: "100vh" }}>
    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Latest IssueGrid Demo</h1>
    <LatestIssueGrid posts={mockPosts} title="Latest Issue (Demo)" />
  </div>
);

export default LatestIssueDemoPage;
