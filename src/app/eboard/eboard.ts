export interface EBoardMember {
    id: string;
    name: string;
    role: string;
    description: string;
    imageUrl: string;
  }
  
  // In a real application, this would likely be fetched from an API
  // This file would be imported by a data service
  export const getEBoardMembers = async (): Promise<EBoardMember[]> => {
    // Mock API call - in production this would be a real fetch
    return [
      {
        id: "jane-doe",
        name: "Jane Doe",
        role: "President",
        description: "Jane leads our organization with a focus on community engagement and sustainable growth.",
        imageUrl: "/images/eboard/jane-doe.jpg"
      },
      {
        id: "john-smith",
        name: "John Smith",
        role: "Vice President",
        description: "John oversees our operations and strategic partnerships across multiple initiatives.",
        imageUrl: "/images/eboard/john-smith.jpg"
      },
      // Add more members as needed
    ];
  };