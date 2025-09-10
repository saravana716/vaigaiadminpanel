'use client'

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Product } from '@/lib/types';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface ProductViewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Product | null;
}

export function ProductViewDialog({ isOpen, onOpenChange, product }: ProductViewDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <DialogDescription>
                <Badge variant="outline">{product.category}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>

              {product.images && product.images.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Images</h3>
                  <Carousel className="w-full max-w-xl mx-auto">
                    <CarouselContent>
                      {product.images.map((src, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Image
                              src={src}
                              alt={`${product.name} image ${index + 1}`}
                              width={800}
                              height={600}
                              className="w-full h-auto object-cover rounded-lg aspect-video"
                              data-ai-hint="product image"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-12" />
                    <CarouselNext className="mr-12" />
                  </Carousel>
                </div>
              )}

              {product.videoUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Video</h3>
                  <video src={product.videoUrl} controls className="w-full rounded-md" />
                </div>
              )}
            </div>
            <DialogFooter className="sticky bottom-0 bg-background pt-6 pr-0 pb-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
