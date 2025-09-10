'use client'

import * as React from "react"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { Category } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import { CategoryForm } from "./category-form"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { z } from "zod"
import { categorySchema } from "@/lib/schemas"

interface CategoriesTableProps {
  isFormOpen: boolean;
  onFormOpenChange: (isOpen: boolean) => void;
}

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoriesTable({ isFormOpen, onFormOpenChange }: CategoriesTableProps) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)
  const { toast } = useToast()

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
        } as Category
      });
      setCategories(categoriesData.sort((a,b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()));
    } catch (error) {
      console.error("Error fetching categories: ", error);
      toast({
        title: "Error fetching categories",
        description: "Could not load categories from the database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    onFormOpenChange(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      try {
        // Delete image from storage
        if (selectedCategory.imageUrl) {
            const imageRef = ref(storage, selectedCategory.imageUrl);
            await deleteObject(imageRef);
        }
        // Delete doc from firestore
        await deleteDoc(doc(db, "categories", selectedCategory.id));

        toast({
          title: "Category Deleted",
          description: `Category "${selectedCategory.name}" has been deleted.`,
        })
        fetchCategories(); // Refresh data
      } catch (error) {
         console.error("Error deleting category:", error);
         toast({
            title: "Error Deleting Category",
            description: "An error occurred while trying to delete the category.",
            variant: "destructive",
         })
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
      }
    }
  };

  const handleFormSubmit = async (values: CategoryFormData, file?: File) => {
     setIsSubmitting(true);
     try {
        let imageUrl = selectedCategory?.imageUrl || '';
        let existingImageUrl = selectedCategory?.imageUrl || '';

        if (file) {
            if (existingImageUrl) {
                try {
                    const oldImageRef = ref(storage, existingImageUrl);
                    await deleteObject(oldImageRef);
                } catch (e) {
                    console.warn("Old image deletion failed, it might not exist", e)
                }
            }
            const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(uploadResult.ref);
        }

        if (selectedCategory) {
            // Edit
            const categoryRef = doc(db, "categories", selectedCategory.id);
            await updateDoc(categoryRef, { ...values, imageUrl });
            toast({ title: "Category Updated", description: `Category "${values.name}" has been updated.` });
        } else {
            // Create
            await addDoc(collection(db, "categories"), { ...values, imageUrl, createdAt: serverTimestamp() });
            toast({ title: "Category Created", description: `Category "${values.name}" has been created.` });
        }
        fetchCategories(); // Refresh data
        onFormOpenChange(false);
        setSelectedCategory(null);
     } catch (error) {
        console.error("Error saving category:", error);
        toast({
            title: "Error Saving Category",
            description: "An unexpected error occurred.",
            variant: "destructive",
        });
     } finally {
        setIsSubmitting(false);
     }
  }

  // When form is closed, reset selected category
  React.useEffect(() => {
    if (!isFormOpen) {
      setSelectedCategory(null);
    }
  }, [isFormOpen]);

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No categories found.
                    </TableCell>
                </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={category.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={category.imageUrl || "https://placehold.co/64x64.png"}
                      width="64"
                      data-ai-hint="category image"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {category.description}
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt as Date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEdit(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(category)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <CategoryForm
            isOpen={isFormOpen}
            onOpenChange={onFormOpenChange}
            onSubmit={handleFormSubmit}
            initialData={selectedCategory}
            isSubmitting={isSubmitting}
        />
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              "{selectedCategory?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
