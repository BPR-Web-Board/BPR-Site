import React from "react";
import SectionGridWithRealData from "../components/SectionGrid/SectionGridWithRealData";

export default function SectionGridRealDataPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <div className="container mt-5 mb-5">
          <h1 className="mb-4">Section Grid with Real Data</h1>
          <p className="mb-5">
            This page demonstrates the SectionGrid component with real data from
            the WordPress API for different sections.
          </p>
        </div>

        {/* United States Section */}
        <div className="mb-7">
          <SectionGridWithRealData
            categorySlug="united-states"
            sectionTitle="United States"
            maxPosts={8}
            gridColumns={2}
          />
        </div>

        {/* World Section */}
        <div className="mb-7">
          <SectionGridWithRealData
            categorySlug="world"
            sectionTitle="World"
            maxPosts={8}
            gridColumns={2}
          />
        </div>

        {/* Culture Section */}
        <div className="mb-7">
          <SectionGridWithRealData
            categorySlug="culture"
            sectionTitle="Culture"
            maxPosts={8}
            gridColumns={2}
          />
        </div>

        {/* Science & Technology Section */}
        <div className="mb-7">
          <SectionGridWithRealData
            categorySlug="science-technology"
            sectionTitle="Science & Technology"
            maxPosts={8}
            gridColumns={2}
          />
        </div>
      </div>
    </main>
  );
}
