import { Timestamp } from "firebase/firestore";

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
  createdAt: Date | Timestamp;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  videoUrl: string;
  createdAt: Date | Timestamp;
};
