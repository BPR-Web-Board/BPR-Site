import React from "react";
import SectionGridDemo from "../components/SectionGrid/SectionGridDemo";

export default function SectionGridDemoPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <h1 className="container mt-5 mb-4">Section Grid Demo</h1>
        <p className="container mb-5">
          This page demonstrates the SectionGrid component for the "United
          States" section.
        </p>
        <SectionGridDemo />
      </div>
    </main>
  );
}
