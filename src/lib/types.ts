export type User = {
  name: string;
  email: string;
  avatarUrl: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: Date | string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  videoUrl: string;
  createdAt: Date | string;
  isTrending: boolean;
};

export type ContactSubmission = {
  id: string;
  company?: string;
  email: string;
  eventDate?: string;
  inquiryType?: string;
  message?: string;
  name: string;
  phone?: string;
  subject?: string;
  timestamp: Date | string;
};

