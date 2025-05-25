import React from "react";
import SectionGridWithRealData from "../components/SectionGrid/SectionGridWithRealData";

export default function UnitedStatesPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <SectionGridWithRealData
          categorySlug="united-states"
          sectionTitle="United States"
          maxPosts={8}
          gridColumns={2}
        />
      </div>
    </main>
  );
}
