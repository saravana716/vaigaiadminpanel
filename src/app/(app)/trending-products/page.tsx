'use client';

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TrendingProductsTable } from "@/components/products/trending-products-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function TrendingProductsPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Trending Products"
        description="View and manage trending products."
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Trending Product
        </Button>
      </PageHeader>
      <TrendingProductsTable isFormOpen={isFormOpen} onFormOpenChange={setIsFormOpen} />
    </div>
  );
}
