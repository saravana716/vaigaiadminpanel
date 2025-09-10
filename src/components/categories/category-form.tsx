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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { categorySchema } from '@/lib/schemas';
import type { Category } from '@/lib/types';
import { Textarea } from '../ui/textarea';

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CategoryFormData, file?: File) => void;
  initialData?: Category | null;
  isSubmitting?: boolean;
}

export function CategoryForm({ isOpen, onOpenChange, onSubmit, initialData, isSubmitting }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.imageUrl || null);
  const [imageFile, setImageFile] = React.useState<File | undefined>(undefined);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (values: CategoryFormData) => {
    onSubmit(values, imageFile);
  };
  
  const formTitle = initialData ? 'Edit Category' : 'Create Category';
  const formDescription = initialData
    ? "Make changes to your existing category here."
    : "Add a new category to your store.";

  React.useEffect(() => {
    form.reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
        imageUrl: initialData?.imageUrl || '',
    });
    setImagePreview(initialData?.imageUrl || null);
    setImageFile(undefined);
  }, [initialData, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Electronics" {...field} />
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
                    <Textarea rows={4} placeholder="Describe the category..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  {imagePreview && (
                    <div className="mt-2">
                       <Image
                         src={imagePreview}
                         alt="Image Preview"
                         width={100}
                         height={100}
                         className="rounded-md"
                         data-ai-hint="category image"
                       />
                    </div>
                  )}
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                  </FormControl>
                  <FormMessage />
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
