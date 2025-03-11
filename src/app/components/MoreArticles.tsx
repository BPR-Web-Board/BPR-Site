import React from 'react';
import './MoreArticles.css';

interface ArticleProps {
  title: string;
  link: string;
  author: string;
}

const mainArticle: ArticleProps = {
  title: "Digital Disaster: Crypto And America’s Financial Future",
  link: "/articles/digital-disaster",
  author: "BY DAVID PINTO",
};

const sideArticles: ArticleProps[] = [
  {
    title: "Gorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.",
    link: "/articles/gorem-ipsum",
    author: "BY DAVID PINTO",
  },
  {
    title: "Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua",
    link: "/articles/sed-do-eiusmod",
    author: "BY DAVID PINTO",
  },
  {
    title: "Ut Enim Ad Minim Veniam, Quis Nostrud Exercitation Ullamco",
    link: "/articles/ut-enim",
    author: "BY DAVID PINTO",
  },
];

export default function MoreArticles() {
  return (
    <section className="keep-reading">
      <h2 className="keep-reading__title">Keep Reading</h2>

      <div className="keep-reading__content">
        {/* Left Column: Main Article */}
        <div className="keep-reading__main-article">
          <div className="keep-reading__main-image" />
          <div className="keep-reading__main-text">
            <a href={mainArticle.link} className="keep-reading__main-headline">
              {mainArticle.title}
            </a>
            <p className="keep-reading__byline">{mainArticle.author}</p>
          </div>
        </div>

        {/* Right Column: 3 Smaller Articles */}
        <div className="keep-reading__side-articles">
          {sideArticles.map((article, idx) => (
            <div className="keep-reading__side-article" key={idx}>
              <div className="keep-reading__side-text">
                <a href={article.link} className="keep-reading__side-headline">
                  {article.title}
                </a>
                <p className="keep-reading__byline">{article.author}</p>
              </div>
              <div className="keep-reading__side-image" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
