'use client'

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CategoriesTable } from "@/components/categories/categories-table";

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="Manage your product categories."
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>
      <CategoriesTable isFormOpen={isFormOpen} onFormOpenChange={setIsFormOpen} />
    </div>
  );
}
