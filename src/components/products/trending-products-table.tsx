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
import type { Product, Category } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Loader2, Eye } from "lucide-react"
import { ProductForm } from "./product-form"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { z } from "zod"
import { productSchema } from "@/lib/schemas"
import { ProductViewDialog } from "./product-view-dialog"

interface TrendingProductsTableProps {
  isFormOpen: boolean;
  onFormOpenChange: (isOpen: boolean) => void;
}

type ProductFormData = z.infer<typeof productSchema>;

const getPathFromUrl = (url: string) => {
  if (!url) return null;
  const parts = url.split('/storage/v1/object/public/vaigai/');
  return parts.length > 1 ? parts[1] : null;
};

export function TrendingProductsTable({ isFormOpen, onFormOpenChange }: TrendingProductsTableProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const { toast } = useToast()

  const fetchTrendingProductsAndCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Categories
      const { data: categoriesData, error: catError } = await supabase
        .from("categories")
        .select("*");
      if (catError) throw catError;
      setCategories(categoriesData as Category[]);

      // Fetch Trending Products
      const { data: productsData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("isTrending", true)
        .order("createdAt", { ascending: false });
      if (prodError) throw prodError;
      
      const parsedProducts = (productsData || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
      })) as Product[];
      setProducts(parsedProducts);
    } catch (error) {
      console.error("Error fetching trending data: ", error);
      toast({
        title: "Error fetching trending data",
        description: "Could not load trending products or categories from the database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchTrendingProductsAndCategories();
  }, [fetchTrendingProductsAndCategories]);
  
  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    onFormOpenChange(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        // Delete images and video from storage
        const filesToDelete: string[] = [];
        for (const imageUrl of selectedProduct.images) {
           const path = getPathFromUrl(imageUrl);
           if (path) filesToDelete.push(path);
        }

        if (selectedProduct.videoUrl) {
           const path = getPathFromUrl(selectedProduct.videoUrl);
           if (path) filesToDelete.push(path);
        }
        
        if (filesToDelete.length > 0) {
           try {
              await supabase.storage.from('vaigai').remove(filesToDelete);
           } catch (storageError) {
              console.warn("Could not delete files from storage:", storageError)
           }
        }
        
        // Delete doc from database
        const { error } = await supabase
          .from("products")
          .delete()
          .eq('id', selectedProduct.id);
        
        if (error) throw error;

        toast({
          title: "Product Deleted",
          description: `Product "${selectedProduct.name}" has been deleted.`,
        })
        fetchTrendingProductsAndCategories(); // Refresh data
      } catch (error) {
         console.error("Error deleting product:", error);
         toast({
            title: "Error Deleting Product",
            description: "An error occurred while trying to delete the product.",
            variant: "destructive",
         })
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
      }
    }
  };

  const handleFormSubmit = async (values: ProductFormData, imageFiles: File[], videoFile?: File) => {
     setIsSubmitting(true);
     try {
        let imageUrls: string[] = values.images || [];
        let videoUrl: string = selectedProduct?.videoUrl || '';
        
        if (imageFiles.length > 0) {
          const uploadPromises = imageFiles.map(async file => {
            const filePath = `products/images/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('vaigai').upload(filePath, file);
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('vaigai').getPublicUrl(filePath);
            return publicUrl;
          });
          const newImageUrls = await Promise.all(uploadPromises);
          imageUrls = [...imageUrls, ...newImageUrls];
        }

        if (videoFile) {
          if (videoUrl) {
             try {
                const oldPath = getPathFromUrl(videoUrl);
                if (oldPath) {
                   await supabase.storage.from('vaigai').remove([oldPath]);
                }
             } catch (e) {
                console.warn("Old video deletion failed", e)
             }
          }
          const filePath = `products/videos/${Date.now()}_${videoFile.name}`;
          const { error: uploadError } = await supabase.storage.from('vaigai').upload(filePath, videoFile);
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage.from('vaigai').getPublicUrl(filePath);
          videoUrl = publicUrl;
        }

        if (selectedProduct) {
            // Edit
            const { error } = await supabase
              .from("products")
              .update({ ...values, images: imageUrls, videoUrl })
              .eq('id', selectedProduct.id);
            
            if (error) throw error;
            toast({ title: "Product Updated", description: `Product "${values.name}" has been updated.` });
        } else {
            // Create
            if (imageUrls.length === 0) {
              imageUrls.push("https://placehold.co/600x400.png");
            }
            
            const { error } = await supabase
              .from("products")
              .insert({ ...values, images: imageUrls, videoUrl, isTrending: true });
            
            if (error) throw error;
            toast({ title: "Trending Product Created", description: `Product "${values.name}" has been created as trending.` });
        }
        fetchTrendingProductsAndCategories(); // Refresh data
        onFormOpenChange(false);
        setSelectedProduct(null);
     } catch (error) {
        console.error("Error saving trending product:", error);
        toast({
            title: "Error Saving Trending Product",
            description: "An unexpected error occurred.",
            variant: "destructive",
        });
     } finally {
        setIsSubmitting(false);
     }
  }

  // When form is closed, reset selected product
  React.useEffect(() => {
    if (!isFormOpen) {
      setSelectedProduct(null);
    }
  }, [isFormOpen]);
  
  // When view dialog is closed, reset selected product
  React.useEffect(() => {
    if (!isViewDialogOpen) {
      setSelectedProduct(null);
    }
  }, [isViewDialogOpen]);

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
              <TableHead>Category</TableHead>
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
            ) : products.length === 0 ? (
               <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No trending products found.
                    </TableCell>
                </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.images[0] || "https://placehold.co/64x64.png"}
                      width="64"
                      data-ai-hint="product image"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt as Date).toLocaleDateString()}
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
                        <DropdownMenuItem onSelect={() => handleView(product)}>
                           <Eye className="mr-2 h-4 w-4" />
                           View
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(product)} className="text-destructive focus:text-destructive">
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
        <ProductForm
            isOpen={isFormOpen}
            onOpenChange={onFormOpenChange}
            onSubmit={handleFormSubmit}
            initialData={selectedProduct ? { ...selectedProduct, isTrending: true } : { isTrending: true } as ProductFormData}
            categories={categories}
            isSubmitting={isSubmitting}
        />
      )}

      {isViewDialogOpen && selectedProduct && (
        <ProductViewDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          product={selectedProduct}
        />
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{selectedProduct?.name}".
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
