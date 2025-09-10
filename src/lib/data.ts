import type { Category, Product } from './types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    imageUrl: 'https://placehold.co/400x300.png',
    createdAt: new Date('2023-01-15T09:30:00'),
  },
  {
    id: 'cat-2',
    name: 'Books',
    imageUrl: 'https://placehold.co/400x300.png',
    createdAt: new Date('2023-02-20T14:00:00'),
  },
  {
    id: 'cat-3',
    name: 'Clothing',
    imageUrl: 'https://placehold.co/400x300.png',
    createdAt: new Date('2023-03-10T11:45:00'),
  },
  {
    id: 'cat-4',
    name: 'Home Goods',
    imageUrl: 'https://placehold.co/400x300.png',
    createdAt: new Date('2023-04-05T18:20:00'),
  },
  {
    id: 'cat-5',
    name: 'Sports',
    imageUrl: 'https://placehold.co/400x300.png',
    createdAt: new Date('2023-05-22T08:00:00'),
  },
];

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Smartphone X',
    description: 'Latest model with advanced features and a stunning display.',
    category: 'Electronics',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    createdAt: new Date('2023-01-16T10:00:00'),
  },
  {
    id: 'prod-2',
    name: 'The Grand Novel',
    description: 'A captivating story of adventure and discovery.',
    category: 'Books',
    images: ['https://placehold.co/600x400.png'],
    createdAt: new Date('2023-02-21T11:00:00'),
  },
  {
    id: 'prod-3',
    name: 'Running Shoes',
    description: 'Comfortable and stylish shoes for your daily run.',
    category: 'Sports',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    createdAt: new Date('2023-05-23T12:00:00'),
  },
  {
    id: 'prod-4',
    name: 'Designer T-Shirt',
    description: 'A high-quality t-shirt with a unique design.',
    category: 'Clothing',
    images: ['https://placehold.co/600x400.png'],
    createdAt: new Date('2023-03-11T13:00:00'),
  },
  {
    id: 'prod-5',
    name: 'Coffee Maker',
    description: 'Brew the perfect cup of coffee every morning.',
    category: 'Home Goods',
    images: ['https://placehold.co/600x400.png'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    createdAt: new Date('2023-04-06T14:00:00'),
  },
];
