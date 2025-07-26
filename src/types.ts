export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  profileUrl: string;
  profilePicture?: string;
  connectionsCount?: number;
  followersCount?: number;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  skills?: string[];
  current: boolean;
  createdAt: Date;
}

export interface Education {
  id: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills?: string[];
  createdAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  endorsements: number;
  featured: boolean;
  createdAt: Date;
}

export interface Post {
  id: string;
  content: string;
  publishedAt: Date;
  likes: number;
  comments: number;
  shares: number;
  url: string;
  imageUrls?: string[];
  createdAt: Date;
}

export interface Connection {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  profileUrl: string;
  company?: string;
  location?: string;
  connectedAt?: Date;
  createdAt: Date;
}

export interface SyncConfig {
  email: string;
  password: string;
  syncInterval: number; // minutes
  enableHeadless: boolean;
  maxRetries: number;
}