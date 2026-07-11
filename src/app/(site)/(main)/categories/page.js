"use client";

import { useMemo, useState } from "react";
import { useGetGenericMasterByKeyQuery } from "../../../store/api/commonApi";
import { useGetCategoryCountsQuery } from "../../../store/api/videoApi";
import Link from "next/link";
import { 
  MagnifyingGlassIcon, 
  RectangleStackIcon, 
  TagIcon,
  PlayIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('music')) return MusicalNoteIcon;
  if (name.includes('game') || name.includes('gaming')) return PuzzlePieceIcon;
  if (name.includes('movie') || name.includes('film') || name.includes('video')) return PlayIcon;
  if (name.includes('entertainment') || name.includes('fun')) return SparklesIcon;
  return RectangleStackIcon;
};

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const CategoriesPage = () => {
  const { data: categoryData = [], isLoading } = useGetGenericMasterByKeyQuery("category");
  const { data: categoryCounts = [], isLoading: countsLoading } = useGetCategoryCountsQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const countMap = useMemo(() => {
    const map = new Map();
    for (const row of categoryCounts) {
      if (row.category) {
        map.set(row.category.toLowerCase(), row.count);
      }
    }
    return map;
  }, [categoryCounts]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = categoryData
      .filter((cat) =>
        cat.value.toLowerCase().includes(q) ||
        (cat.desc && cat.desc.toLowerCase().includes(q))
      )
      .map((cat) => ({
        ...cat,
        count: countMap.get(cat.value.toLowerCase()) ?? 0,
      }));

    if (!q) {
      list.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.value.localeCompare(b.value);
      });
    }

    return list;
  }, [categoryData, searchQuery, countMap]);

  const loading = isLoading || countsLoading;

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-12">
      {/* Hero Section */}
      <div className="relative py-12 px-6 overflow-hidden mb-8 border-b theme-hairline">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-red-45/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight gradient-text">
            Explore Categories
          </h1>
          <p className="text-grey-60 text-base max-w-xl mb-8">
            Discover thousands of high-quality videos across your favorite genres. 
            Find exactly what you&apos;re looking for.
          </p>
          
          <div className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-dark-10/50 backdrop-blur-md rounded-2xl pl-12 pr-4 text-primary placeholder-grey-60 border border-dark-25 focus:outline-none focus:border-red-45/50 focus:ring-1 focus:ring-red-45/50 transition-all shadow-xl"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-60" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-dark-12 border border-dark-20/40 rounded-2xl p-5 h-[160px] animate-pulse">
                <div className="w-10 h-10 rounded-full bg-dark-20/40 mb-4" />
                <div className="w-3/4 h-5 bg-dark-20/40 rounded-md mb-2" />
                <div className="w-full h-4 bg-dark-20/40 rounded-md mb-1" />
                <div className="w-2/3 h-4 bg-dark-20/40 rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 text-center">
            <TagIcon className="h-12 w-12 text-grey-60 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-primary mb-2">No categories found</h3>
            <p className="text-grey-60">Try adjusting your search query to find what you&apos;re looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredCategories.map((category, index) => {
              const Icon = getCategoryIcon(category.value);
              return (
                <Link 
                  key={category.value || index} 
                  href={`/?category=${encodeURIComponent(category.value)}`}
                  className="group relative bg-dark-10 hover:bg-dark-15 border border-dark-20/40 hover:border-red-45/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(227,0,0,0.12)] overflow-hidden flex flex-col h-[160px]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-45/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-start justify-between mb-auto relative z-10">
                    <div className="w-10 h-10 rounded-full bg-dark-20/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-45/10 transition-all duration-300">
                      <Icon className="h-5 w-5 text-grey-60 group-hover:text-red-45 transition-colors" />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums px-2 py-1 rounded-md bg-dark-20 text-grey-60 group-hover:bg-red-45/10 group-hover:text-red-55 transition-colors">
                      {formatCount(category.count)}
                    </span>
                  </div>
                  
                  <div className="relative z-10 mt-4">
                    <h2 className="text-base font-bold text-primary group-hover:text-red-45 transition-colors mb-1 line-clamp-1">
                      {category.value}
                    </h2>
                    <p className="text-xs text-grey-60 line-clamp-1 leading-relaxed">
                      {category.count === 1 ? '1 video' : `${formatCount(category.count)} videos`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
