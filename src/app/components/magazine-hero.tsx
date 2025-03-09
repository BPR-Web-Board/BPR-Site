import React from 'react';
import './magazine-hero.css';

interface HeroProps {
  issueNumber: string;
  issueSeason: string;
  issueYear: string;
  title: string;
  releaseDate: string;
  paragraph: string;
  linkUrl?: string;
  linkText?: string;
  imageSrc: string;
}

const Hero: React.FC<HeroProps> = ({
  issueNumber,
  issueSeason,
  issueYear,
  title,
  releaseDate,
  paragraph,
  linkUrl = "#",
  linkText = "Read the full issue",
  imageSrc
}) => {
  return (
    <div className="hero">
      <div className="hero-container">
        {/* Left Side Content */}
        <div className="hero-content">
          <div className="hero-issue-label">
            <p>Issue {issueNumber} | {issueSeason} {issueYear}</p>
          </div>
          
          <h1 className="hero-title">{title}</h1>
          
          <div className="hero-date">
            <p>Out {releaseDate}</p>
          </div>
          
          <div className="hero-paragraph">
            <p>{paragraph}</p>
          </div>
          
          <div className="hero-link">
            <a href={linkUrl}>{linkText}</a>
          </div>
        </div>
        
        {/* Right Side Image */}
        <div className="hero-image-container">
          <div className="hero-image-wrapper">
            <img src={imageSrc} alt={title} className="hero-image" />
            <div className="hero-magazine-label">
              <h2>BROWN</h2>
              <h3>POLITICAL</h3>
              <h4>REVIEW</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage with dummy data
const HeroWithDummyData: React.FC = () => {
  const dummyData = {
    issueNumber: "02",
    issueSeason: "Fall",
    issueYear: "2024",
    title: "Silence",
    releaseDate: "December 01, 2024",
    paragraph: "Horem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Risus sems, ut interdum tellus elit sed risus. Adfasd fadfadsfasdfasdfa sdfasdfasdf fvs",
    linkUrl: "#",
    linkText: "Read the full issue",
    imageSrc: "/api/placeholder/400/600"
  };

  return <Hero {...dummyData} />;
};

export { HeroWithDummyData };
export default Hero;