'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import NavigationBar from "../components/NavigationBar/NavigationBar";
import Footer from "../components/Footer/Footer";
import './eboard.css';

// Define the type for an EBoard member
interface EBoardMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

// Sample data - normally would be fetched from API
const sampleMembers: EBoardMember[] = [
  {
    id: "jane-doe",
    name: "Jane Doe",
    role: "President",
    description: "Jane leads our organization with a focus on community engagement and sustainable growth.",
    imageUrl: "/api/placeholder/300/300"
  },
  {
    id: "john-smith",
    name: "John Smith",
    role: "Vice President",
    description: "John oversees our operations and strategic partnerships across multiple initiatives.",
    imageUrl: "/api/placeholder/300/300"
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    role: "Treasurer",
    description: "Sarah manages our financial planning and ensures responsible allocation of resources.",
    imageUrl: "/api/placeholder/300/300"
  },
  {
    id: "michael-chen",
    name: "Michael Chen",
    role: "Secretary",
    description: "Michael documents our proceedings and coordinates internal communications.",
    imageUrl: "/api/placeholder/300/300"
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    role: "Events Director",
    description: "Priya organizes our community events and manages our public engagement strategy.",
    imageUrl: "/api/placeholder/300/300"
  },
  {
    id: "david-williams",
    name: "David Williams",
    role: "Technical Director",
    description: "David leads our technical initiatives and digital presence strategy.",
    imageUrl: "/api/placeholder/300/300"
  }
];

export default function MeetTheEBoard() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<EBoardMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch with a delay
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call:
        // const response = await fetch('/api/eboard-members');
        // const data = await response.json();
        
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setMembers(sampleMembers);
        setLoading(false);
      } catch (err) {
        setError("Failed to load executive board members. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Meet the Executive Board</title>
        <meta name="description" content="Get to know the executive board members who lead our organization" />
      </Head>

      <NavigationBar />
      
      <main className="eboard-main">
        <div className="eboard-container">
          <div className="eboard-header">
            <h1 className="eboard-title">Meet the Executive Board</h1>
            <p className="eboard-subtitle">
              The dedicated team behind our mission and vision
            </p>
          </div>

          {loading ? (
            <div className="eboard-loading">
              <div className="eboard-loading-spinner"></div>
              <p>Loading executive board members...</p>
            </div>
          ) : error ? (
            <div className="eboard-error">{error}</div>
          ) : (
            <div className="eboard-grid">
              {members.map((member) => (
                <Link 
                  key={member.id} 
                  href={`/meet-the-eboard/${member.id}`}
                  className="eboard-member-link"
                >
                  <div className="eboard-member">
                    <div className="eboard-member-image-container">
                      <img 
                        src={member.imageUrl} 
                        alt={`${member.name}, ${member.role}`} 
                        className="eboard-member-image"
                      />
                    </div>
                    <div className="eboard-member-content">
                      <h2 className="eboard-member-name">{member.name}</h2>
                      <h3 className="eboard-member-role">{member.role}</h3>
                      <p className="eboard-member-description">{member.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}