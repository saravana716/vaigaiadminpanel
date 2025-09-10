'use client'

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProductsTable } from "@/components/products/products-table";

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="Manage your products."
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>
      <ProductsTable isFormOpen={isFormOpen} onFormOpenChange={setIsFormOpen} />
    </div>
  );
}
