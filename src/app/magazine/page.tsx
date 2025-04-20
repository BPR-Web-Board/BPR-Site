'use client'
//example hero usage
import NavigationBar from "../components/NavigationBar/NavigationBar"
import ArticleHero from "../components/ArticleHero/ArticleHero"
export default function magazine()
{
    return
    (
        <div className="article-page">
              <NavigationBar />
              <ArticleHero
                title="Dark Days for the Petrodollar"
                subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                authors="DAVID PINTO AND TIANYU ZHOU"
                backgroundImage="/path/to/your-article-background.jpg"
              />
              {/* Rest of article content */}
            </div>
    )
}