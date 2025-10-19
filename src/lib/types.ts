

import type { Timestamp } from 'firebase/firestore';

export type User = {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: 'Administrator' | 'Moderator' | 'Author' | 'User' | 'Business Owner';
    status: 'Active' | 'Suspended';
    verified: boolean;
    createdAt: Timestamp;
    lastLogin?: Timestamp;
    favoriteCars?: string[];
    favoriteBusinesses?: string[];
}

export type Vehicle = {
    id: string;
    name: string;
    // Overview
    make: string;
    model: string;
    year: number;
    price: number;
    bodyType: string;
    driveType: 'FWD' | 'RWD' | 'AWD/4WD';
    fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
    doors: number;
    seats: number;
    variants: string[];
    // Performance & Safety
    engine: string;
    transmission: 'Manual' | 'Automatic' | 'CVT' | 'DCT';
    displacement: string;
    cylinders: number;
    horsepower: string;
    torque: string;
    brakeSpec: string; 
    tireSpec: string;
    airbags: number;
    acceleration: string; 
    topSpeed: string;
    suspension: string;
    // Description
    description: string;
    // Features
    exteriorFeatures: string[];
    interiorFeatures: string[];
    comfortAndConvenience: string[];
    safetyFeatures: string[];
    infotainment: string[];
    // Technical Specification
    length: number;
    width: number;
    height: number;
    wheelbase: number;
    groundClearance: number;
    vehicleWeight: number; 
    maxPayload: number;
    bootSpace: number;
    dragCoefficient: number;
    // Media
    imageUrls: string[];
    
    createdAt?: Timestamp;
};


export type BlogPost = {
    id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    authorId: string;
    imageUrl: string;
    excerpt: string;
    category: string;
    tags: string[];
    readTime: number;
    date: string; // Stored as a string like 'YYYY-MM-DD'
    createdAt?: Timestamp | string;
    updatedAt?: Timestamp | string;
};

export type Business = {
    id: string;
    title: string;
    ownerId: string;
    ownerName?: string;
    category: string;
    description: string;
    address: string;
    location: string; // Country
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    socials: {
        twitter: string;
        facebook: string;
        instagram: string;
    };
    mainImageUrl: string;
    galleryImageUrls: string[];
    servicesOffered?: string[];
    createdAt: Timestamp | string;
    updatedAt?: Timestamp | string;
    verified: boolean;
    featured: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'edit-pending';
    openingHours?: string;
    closingHours?: string;
    averageRating?: number;
    reviewCount?: number;
};

export type Activity = {
    id: string;
    description: string;
    type: 'user' | 'business' | 'listing' | 'review' | 'data' | 'blog' | 'question' | 'category' | 'claim';
    timestamp: Timestamp;
    userId?: string;
    relatedId?: string;
    read?: boolean;
};

export type Answer = {
  id: string;
  body: string;
  author: string;
  authorId: string;
  authorAvatarUrl?: string;
  createdAt: Timestamp;
  votes: number;
  accepted: boolean;
  upvotedBy: string[];
  downvotedBy: string[];
};

export type Question = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author: string;
  authorId: string;
  createdAt: Timestamp;
  views: number;
  votes: number;
  answers: Answer[];
  upvotedBy: string[];
  downvotedBy: string[];
};

export type SecuritySettings = {
    allowRegistration: boolean;
    defaultUserRole: 'User' | 'Business Owner' | 'Author';
};

export type SeoSettings = {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    robotsTxt: string;
    siteTitle: string;
};

export type Settings = {
    id: 'security' | 'seo';
    data: SecuritySettings | SeoSettings;
};

export type Reply = {
    id: string;
    author: string;
    authorId: string;
    authorAvatarUrl?: string;
    date: Timestamp;
    text: string;
};

export type Comment = {
    id: string;
    postId: string;
    author: string;
    authorId: string;
    authorAvatarUrl?: string;
    date: Timestamp;
    text: string;
    replies: Reply[];
};

export type Review = {
    id: string;
    itemId: string;
    itemType: 'business' | 'vehicle';
    itemTitle: string;
    userId: string;
    author: string;
    authorAvatarUrl?: string;
    rating: number;
    text: string;
    createdAt: Timestamp | string;
};

export type Category = {
    id: string;
    name: string;
    imageUrl?: string;
    createdAt?: Timestamp | string;
}

export type BusinessClaim = {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  userEmail: string;
  verificationDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
};
