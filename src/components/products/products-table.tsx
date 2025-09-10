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
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { z } from "zod"
import { productSchema } from "@/lib/schemas"
import { ProductViewDialog } from "./product-view-dialog"

interface ProductsTableProps {
  isFormOpen: boolean;
  onFormOpenChange: (isOpen: boolean) => void;
}

type ProductFormData = z.infer<typeof productSchema>;

export function ProductsTable({ isFormOpen, onFormOpenChange }: ProductsTableProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const { toast } = useToast()

  const fetchProductsAndCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Categories
      const catQuerySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = catQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(categoriesData);

      // Fetch Products
      const prodQuerySnapshot = await getDocs(collection(db, "products"));
      const productsData = prodQuerySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
        } as Product
      });
      setProducts(productsData.sort((a,b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()));
    } catch (error) {
      console.error("Error fetching data: ", error);
      toast({
        title: "Error fetching data",
        description: "Could not load products or categories from the database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);
  
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
        // Delete images from storage
        for (const imageUrl of selectedProduct.images) {
           try {
              const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef);
           } catch (storageError) {
              console.warn("Could not delete image, it might not exist:", imageUrl, storageError)
           }
        }

        // Delete video from storage
        if (selectedProduct.videoUrl) {
           try {
              const videoRef = ref(storage, selectedProduct.videoUrl);
              await deleteObject(videoRef);
           } catch (storageError) {
              console.warn("Could not delete video, it might not exist:", selectedProduct.videoUrl, storageError)
           }
        }
        
        // Delete doc from firestore
        await deleteDoc(doc(db, "products", selectedProduct.id));

        toast({
          title: "Product Deleted",
          description: `Product "${selectedProduct.name}" has been deleted.`,
        })
        fetchProductsAndCategories(); // Refresh data
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
        let imageUrls: string[] = selectedProduct?.images || values.images || [];
        let videoUrl: string = selectedProduct?.videoUrl || '';
        
        if (imageFiles.length > 0) {
          const uploadPromises = imageFiles.map(async file => {
            const storageRef = ref(storage, `products/images/${Date.now()}_${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            return getDownloadURL(uploadResult.ref);
          });
          const newImageUrls = await Promise.all(uploadPromises);
          imageUrls = [...values.images, ...newImageUrls];
        }

        if (videoFile) {
          const videoStorageRef = ref(storage, `products/videos/${Date.now()}_${videoFile.name}`);
          const uploadResult = await uploadBytes(videoStorageRef, videoFile);
          videoUrl = await getDownloadURL(uploadResult.ref);
        }

        if (selectedProduct) {
            // Edit
            const productRef = doc(db, "products", selectedProduct.id);
            await updateDoc(productRef, { ...values, images: imageUrls, videoUrl });
            toast({ title: "Product Updated", description: `Product "${values.name}" has been updated.` });
        } else {
            // Create
            if (imageUrls.length === 0) {
              imageUrls.push("https://placehold.co/600x400.png");
            }
            await addDoc(collection(db, "products"), { ...values, images: imageUrls, videoUrl, createdAt: serverTimestamp() });
            toast({ title: "Product Created", description: `Product "${values.name}" has been created.` });
        }
        fetchProductsAndCategories(); // Refresh data
        onFormOpenChange(false);
        setSelectedProduct(null);
     } catch (error) {
        console.error("Error saving product:", error);
        toast({
            title: "Error Saving Product",
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
                        No products found.
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
            initialData={selectedProduct}
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
