// ArticleHero.tsx
import React from 'react';
import './ArticleHero.css';

interface ArticleHeroProps {
  title: string;
  subtitle: string;
  authors: string;
  backgroundImage: string;
}

const ArticleHero: React.FC<ArticleHeroProps> = ({
  title,
  subtitle,
  authors,
  backgroundImage,
}) => {
  return (
    <div 
      className="article-hero" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="article-hero-content">
        <div className="article-hero-text">
          <h1 className="article-title">{title}</h1>
          <p className="article-subtitle">{subtitle}</p>
          <div className="article-authors">BY {authors}</div>
        </div>
      </div>
      <div className="article-hero-enter">
        <span>ENTER</span>
        <div className="arrow-down"></div>
      </div>
    </div>
  );
};

export default ArticleHero;