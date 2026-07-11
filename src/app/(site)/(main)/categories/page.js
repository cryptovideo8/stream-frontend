"use client";

import { useState } from "react";
import { useGetGenericMasterByKeyQuery } from "../../../store/api/commonApi";
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

// A helper to map specific category names to icons, falling back to a generic one
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('music')) return MusicalNoteIcon;
  if (name.includes('game') || name.includes('gaming')) return PuzzlePieceIcon;
  if (name.includes('movie') || name.includes('film') || name.includes('video')) return PlayIcon;
  if (name.includes('entertainment') || name.includes('fun')) return SparklesIcon;
  return RectangleStackIcon;
};

const CategoriesPage = () => {
  const { data: categoryData = [], isLoading } = useGetGenericMasterByKeyQuery("category");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search query
  const filteredCategories = categoryData.filter(cat => 
    cat.value.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (cat.desc && cat.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-12">
      {/* Hero Section */}
      <div className="relative py-12 px-6 overflow-hidden mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-red-45/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ background: 'linear-gradient(135deg, #fff 0%, #a0a0a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Explore Categories
          </h1>
          <p className="text-grey-60 text-base max-w-xl mb-8">
            Discover thousands of high-quality videos across your favorite genres. 
            Find exactly what you're looking for.
          </p>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-dark-10/50 backdrop-blur-md rounded-2xl pl-12 pr-4 text-white placeholder-grey-60 border border-white/10 focus:outline-none focus:border-red-45/50 focus:ring-1 focus:ring-red-45/50 transition-all shadow-xl"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-60" />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-dark-12/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 h-[160px] animate-pulse">
                <div className="w-10 h-10 rounded-full bg-white/5 mb-4" />
                <div className="w-3/4 h-5 bg-white/5 rounded-md mb-2" />
                <div className="w-full h-4 bg-white/5 rounded-md mb-1" />
                <div className="w-2/3 h-4 bg-white/5 rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 text-center">
            <TagIcon className="h-12 w-12 text-grey-60 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No categories found</h3>
            <p className="text-grey-60">Try adjusting your search query to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredCategories.map((category, index) => {
              const Icon = getCategoryIcon(category.value);
              return (
                <Link 
                  key={category._id || index} 
                  href={`/?category=${encodeURIComponent(category.value)}`}
                  className="group relative bg-dark-10 hover:bg-dark-15 border border-white/5 hover:border-red-45/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(227,0,0,0.12)] overflow-hidden flex flex-col h-[160px]"
                >
                  {/* Subtle red gradient accent that appears on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-45/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon wrapper */}
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-auto group-hover:scale-110 group-hover:bg-red-45/10 transition-all duration-300 relative z-10">
                    <Icon className="h-5 w-5 text-grey-60 group-hover:text-red-45 transition-colors" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 mt-4">
                    <h2 className="text-base font-bold text-white group-hover:text-red-45 transition-colors mb-1 line-clamp-1">
                      {category.value}
                    </h2>
                    <p className="text-xs text-grey-60 line-clamp-2 leading-relaxed">
                      {category.desc || "Explore videos in this category"}
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
