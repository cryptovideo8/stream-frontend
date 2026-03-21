"use client";

// import { useGetGenericMasterByKeyQuery } from '../../store/api/commonApi
import { useGetGenericMasterByKeyQuery } from "../../../store/api/commonApi";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";

const CategoriesPage = () => {
  const { data: categoryData = [], isLoading } = useGetGenericMasterByKeyQuery("category");

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar">
        <h1 className="text-2xl font-bold mb-6 sticky top-0 bg-white py-4">Categories</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} className="max-w-[280px]">
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar">
      {/* <h1 className="text-2xl font-bold mb-6 sticky top-0 bg-black py-4 z-10">Categories</h1> */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categoryData.map((category) => (
          <Link 
            key={category.id} 
            href={`/?category=${encodeURIComponent(category.value)}`}
          >
            <Card className="hover:shadow-lg transition-shadow max-w-[280px]">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{category.value}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-gray-400 text-sm">{category.desc || "No description available"}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
