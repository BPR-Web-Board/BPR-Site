import React from 'react';
import './ArticleGrid.css';
import { Post } from '../../../lib/wordpress.d';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleGridProps {
  mainArticle: Post;
  sideArticles: Post[];
  authorMap: Map<number, string>;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ mainArticle, sideArticles, authorMap }) => {
  // Filter side articles to only include those with authors we want to map
  const filteredSideArticles = sideArticles.filter(article => 
    authorMap.has(article.author)
  );

  return (
    <div className="article-grid">
      <div className="article-grid__content">
        {/* Main Article */}
        <Link href={`/article/${mainArticle.slug}`} className="article-grid__main">
          <div className="article-grid__main-image">
            {mainArticle.featured_media && (
              <Image
                src={`/api/placeholder/800/450`} // Replace with actual image URL when available
                alt={mainArticle.title.rendered}
                width={800}
                height={450}
                className="article-grid__image"
              />
            )}
          </div>
          <div className="article-grid__main-text">
            <h2 className="article-grid__main-headline">
              {mainArticle.title.rendered}
            </h2>
            <p className="article-grid__byline">
              By {authorMap.get(mainArticle.author) || 'Unknown Author'}
            </p>
          </div>
        </Link>

        {/* Side Articles */}
        <div className="article-grid__side">
          {filteredSideArticles.map((article) => (
            <Link 
              key={article.id} 
              href={`/article/${article.slug}`} 
              className="article-grid__side-article"
            >
              <div className="article-grid__side-text">
                <h3 className="article-grid__side-headline">
                  {article.title.rendered}
                </h3>
                <p className="article-grid__byline">
                  By {authorMap.get(article.author)}
                </p>
              </div>
              <div className="article-grid__side-image">
                {article.featured_media && (
                  <Image
                    src={`/api/placeholder/300/200`} // Replace with actual image URL when available
                    alt={article.title.rendered}
                    width={300}
                    height={200}
                    className="article-grid__image"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleGrid;
