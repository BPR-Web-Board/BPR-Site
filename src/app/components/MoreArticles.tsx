import React from 'react';
import './MoreArticles.css';
import { Post } from '../../../lib/wordpress.d'; 


interface MoreArticlesProps {
  mainArticle?: Post; 
  sideArticles?: Post[]; 
  authorMap: Map<number, string>;
}

export default function MoreArticles({ mainArticle, sideArticles, authorMap }: MoreArticlesProps) {
  // If mainArticle or sideArticles are undefined, show a loading state
  if (!mainArticle || !sideArticles) {
    return <div>Loading...</div>;
  }

  const getAuthorName = (authorId: number) => authorMap.get(authorId) || 'Unknown Author';

  return (
    <section className="keep-reading">
      <h2 className="keep-reading__title">Keep Reading</h2>

      <div className="keep-reading__content">
        {/* Left Column: Main Article */}
        <div className="keep-reading__main-article">
          <div className="keep-reading__main-image" />
          <div className="keep-reading__main-text">
            <a href={mainArticle.link} className="keep-reading__main-headline">
              {mainArticle.title.rendered}
            </a>
            <p className="keep-reading__byline">BY {getAuthorName(mainArticle.author)}</p>
          </div>
        </div>

        {/* Right Column: Side Articles */}
        <div className="keep-reading__side-articles">
          {sideArticles.map((article, idx) => (
            <div className="keep-reading__side-article" key={idx}>
              <div className="keep-reading__side-text">
                <a href={article.link} className="keep-reading__side-headline">
                  {article.title.rendered}
                </a>
                <p className="keep-reading__byline">BY {getAuthorName(article.author)}</p>
              </div>
              <div className="keep-reading__side-image" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}