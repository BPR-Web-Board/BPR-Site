import React from 'react';
import './SmallArticles.css';
import { Post } from '../../../lib/wordpress.d';
import Image from 'next/image';
import Link from 'next/link';

interface SmallArticlesProps {
  articles: Post[];
  authorMap: Map<number, string>;
}

const SmallArticles: React.FC<SmallArticlesProps> = ({ articles, authorMap }) => {
  return (
    <div className="small-articles">
      <div className="small-articles__grid">
        {articles.map((article) => (
          <Link 
            key={article.id} 
            href={`/article/${article.slug}`} 
            className="small-articles__article"
          >
            <div className="small-articles__image-container">
              {article.featured_media && (
                <Image
                  src={`/api/placeholder/400/300`} // Replace with actual image URL when available
                  alt={article.title.rendered}
                  width={400}
                  height={300}
                  className="small-articles__image"
                />
              )}
            </div>
            <div className="small-articles__content">
              <h2 className="small-articles__title">
                {article.title.rendered}
              </h2>
              <p className="small-articles__byline">
                By {authorMap.get(article.author) || 'Unknown Author'}
              </p>
              {article.excerpt && (
                <div 
                  className="small-articles__excerpt"
                  dangerouslySetInnerHTML={{ __html: article.excerpt.rendered }}
                />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SmallArticles;
