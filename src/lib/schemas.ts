import { z } from 'zod';

export const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export const categorySchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  imageUrl: z.any().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  images: z.any().optional(),
  videoUrl: z.any().refine(value => value, { message: 'Please upload a video.' }),
});
