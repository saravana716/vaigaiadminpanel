'use client'

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { productSchema } from '@/lib/schemas';
import type { Product, Category } from '@/lib/types';
import { X } from 'lucide-react';

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: ProductFormData, imageFiles: File[], videoFile?: File) => void;
  initialData?: Product | null;
  categories: Category[];
  isSubmitting?: boolean;
}

export function ProductForm({ isOpen, onOpenChange, onSubmit, initialData, categories, isSubmitting }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      images: initialData?.images || [],
      videoUrl: initialData?.videoUrl || '',
      isTrending: initialData?.isTrending || false,
    },
  });

  const [imagePreviews, setImagePreviews] = React.useState<string[]>(initialData?.images || []);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(initialData?.videoUrl || null);
  const [videoFile, setVideoFile] = React.useState<File | undefined>(undefined);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImageFiles(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      form.setValue('videoUrl', file); // Set the file object for validation
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
       const newPreviews = imagePreviews.filter((_, i) => i !== index);
       setImagePreviews(newPreviews);
       form.setValue('images', newPreviews);
    } else {
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        const newFiles = imageFiles.filter((_, i) => i !== (index - (initialData?.images?.length ?? 0)) )
        setImagePreviews(newPreviews);
        setImageFiles(newFiles);
    }
  }

  const handleSubmit = (values: ProductFormData) => {
    onSubmit(values, imageFiles, videoFile);
  };

  const formTitle = initialData ? 'Edit Product' : 'Create Product';
  const formDescription = initialData
    ? "Make changes to your existing product here."
    : "Add a new product to your store.";

  React.useEffect(() => {
    form.reset({
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      images: initialData?.images || [],
      videoUrl: initialData?.videoUrl || '',
      isTrending: initialData?.isTrending || false,
    });
    setImagePreviews(initialData?.images || []);
    setVideoPreview(initialData?.videoUrl || null);
    setImageFiles([]);
    setVideoFile(undefined);
  }, [initialData, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{formDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Smartphone X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Describe the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="-" disabled>No categories found</SelectItem>
                      ) : (
                        categories.map(cat => (
                           <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                    {imagePreviews.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                           {imagePreviews.map((src, i) => (
                              <div key={i} className="relative">
                                <Image
                                  src={src}
                                  alt={`Preview ${i+1}`}
                                  width={100}
                                  height={100}
                                  className="rounded-md object-cover aspect-square"
                                  data-ai-hint="product image"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6"
                                  onClick={() => removeImage(i, i < (initialData?.images?.length || 0))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                           ))}
                        </div>
                    )}
                  <FormControl>
                    <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Video</FormLabel>
                  {videoPreview && (
                    <div className="mt-2">
                       <video src={videoPreview} controls className="w-full rounded-md" />
                    </div>
                  )}
                  <FormControl>
                    <Input type="file" accept="video/*" onChange={handleVideoChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isTrending"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Trending Product</FormLabel>
                    <DialogDescription>
                      Mark this product as trending.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 bg-background pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
