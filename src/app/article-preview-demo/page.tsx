import React from "react";
import FourColumnArticleGrid from "../components/FourColumnArticleGrid";
import TwoColumnArticleList from "../components/TwoColumnArticleList";

export default function ArticlePreviewDemo() {
  return (
    <div className="page-container">
      <main className="main-content">
        <div
          style={{ padding: "64px 32px", maxWidth: "1440px", margin: "0 auto" }}
        >
          <header style={{ marginBottom: "64px", textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "var(--font-primary-serif)",
                fontSize: "48px",
                marginBottom: "16px",
                color: "#000",
              }}
            >
              Article Preview Components Demo
            </h1>
            <p
              style={{
                fontFamily: "var(--font-primary-text)",
                fontSize: "18px",
                color: "#666",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Two configurable article preview components with different layouts
              and styling.
            </p>
          </header>

          {/* Four Column Grid Demo */}
          <section style={{ marginBottom: "120px" }}>
            <h2
              style={{
                fontFamily: "var(--font-primary-serif)",
                fontSize: "32px",
                marginBottom: "32px",
                color: "#000",
                textAlign: "center",
              }}
            >
              Four Column Article Grid
            </h2>
            <p
              style={{
                fontFamily: "var(--font-primary-text)",
                fontSize: "16px",
                color: "#666",
                marginBottom: "48px",
                textAlign: "center",
              }}
            >
              Full article previews with images, titles, authors, and excerpts
              in a 4-column layout
            </p>
            <FourColumnArticleGrid
              title="World News"
              category="world"
              maxArticles={4}
            />
          </section>

          {/* Two Column List Demos */}
          <section style={{ marginBottom: "80px" }}>
            <h2
              style={{
                fontFamily: "var(--font-primary-serif)",
                fontSize: "32px",
                marginBottom: "32px",
                color: "#000",
                textAlign: "center",
              }}
            >
              Two Column Article Lists
            </h2>
            <p
              style={{
                fontFamily: "var(--font-primary-text)",
                fontSize: "16px",
                color: "#666",
                marginBottom: "48px",
                textAlign: "center",
              }}
            >
              Compact article previews with images, titles, and authors in a
              2-column layout
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "80px",
                marginBottom: "80px",
              }}
            >
              <TwoColumnArticleList
                title="Foreign Policy"
                category="world"
                maxArticles={6}
              />

              <TwoColumnArticleList
                title="Culture"
                category="magazine"
                maxArticles={6}
              />
            </div>
          </section>

          {/* Additional Examples */}
          <section style={{ marginBottom: "80px" }}>
            <h2
              style={{
                fontFamily: "var(--font-primary-serif)",
                fontSize: "32px",
                marginBottom: "48px",
                color: "#000",
                textAlign: "center",
              }}
            >
              Additional Examples
            </h2>

            <div style={{ marginBottom: "80px" }}>
              <FourColumnArticleGrid
                title="World News"
                category="world"
                maxArticles={4}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "80px",
              }}
            >
              <TwoColumnArticleList
                title="United States"
                category="united-states"
                maxArticles={6}
              />

              <TwoColumnArticleList
                title="Science"
                category="magazine"
                maxArticles={6}
              />
            </div>
          </section>

          <section
            style={{
              padding: "32px",
              backgroundColor: "#f8f8f8",
              borderRadius: "8px",
              marginTop: "64px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-primary-serif)",
                fontSize: "24px",
                marginBottom: "16px",
                color: "#000",
              }}
            >
              Component Features
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "32px",
              }}
            >
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-primary-sans)",
                    fontSize: "18px",
                    marginBottom: "12px",
                    color: "#000",
                  }}
                >
                  FourColumnArticleGrid
                </h4>
                <ul
                  style={{
                    fontFamily: "var(--font-primary-text)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#444",
                  }}
                >
                  <li>4-column responsive grid layout</li>
                  <li>318×272px images with excerpts</li>
                  <li>Inter font for titles (22px, bold)</li>
                  <li>Crimson Text for excerpts (18px)</li>
                  <li>Configurable article count</li>
                  <li>Responsive: 4→3→2→1 columns</li>
                </ul>
              </div>

              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-primary-sans)",
                    fontSize: "18px",
                    marginBottom: "12px",
                    color: "#000",
                  }}
                >
                  TwoColumnArticleList
                </h4>
                <ul
                  style={{
                    fontFamily: "var(--font-primary-text)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#444",
                  }}
                >
                  <li>2-column compact layout</li>
                  <li>316×179px images, no excerpts</li>
                  <li>Libre Franklin for titles (24px, bold)</li>
                  <li>Author bylines only</li>
                  <li>Configurable article count</li>
                  <li>Responsive: 2→1 columns</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
