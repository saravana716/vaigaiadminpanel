'use client'

import * as React from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PageHeader } from "@/components/shared/page-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Shapes } from "lucide-react"

export default function DashboardPage() {
  const [productCount, setProductCount] = React.useState(0);
  const [categoryCount, setCategoryCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        setProductCount(productsSnapshot.size);
        setCategoryCount(categoriesSnapshot.size);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Here's a summary of your store's data."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatsCard 
              title="Total Products"
              value={productCount.toString()}
              icon={Package}
              description="The total number of products in your store."
            />
            <StatsCard 
              title="Total Categories"
              value={categoryCount.toString()}
              icon={Shapes}
              description="The total number of categories for your products."
            />
          </>
        )}
      </div>
    </div>
  )
}
