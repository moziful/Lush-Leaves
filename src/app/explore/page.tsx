"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch, FiSliders, FiX, FiCheck, FiChevronRight, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PlantCard from "@/components/PlantCard";
import PlantDetailModal from "@/components/PlantDetailModal";

interface Plant {
  id: string;
  title: string;
  scientificName: string;
  category: string;
  short: string;
  description: string;
  price: number;
  image: string;
  difficulty: "Easy" | "Medium" | "Hard";
  watering: string;
  sunlight: string;
  temperature: string;
  detailedCare: string[];
  commonProblems: { problem: string; solution: string }[];
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceFilter, selectedDifficulties]);

  // Fetch plants from the backend API
  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await fetch("/api/plants");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPlants(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch plants from API:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlants();
  }, []);

  // Read search params on load or changes (supports deep-linking via ?plantId=)
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
    const plantId = searchParams.get("plantId");
    if (plantId) {
      const match = plants.find((p) => p.id === plantId);
      if (match) {
        setSelectedPlant(match);
      }
    }
  }, [searchParams, plants]);

  const categories = ["All", "Foliage", "Succulents", "Flowers", "Pet Friendly"];
  const priceFilters = [
    { label: "All Prices", value: "All" },
    { label: "Under $20", value: "under20" },
    { label: "$20 to $50", value: "20to50" },
    { label: "Over $50", value: "over50" }
  ];
  const difficulties = ["Easy", "Medium", "Hard"];

  // Helper to toggle difficulties
  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  // Clear all filters helper
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setPriceFilter("All");
    setSelectedDifficulties([]);
    setSortBy("default");
  };

  // Get active filter count
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    priceFilter !== "All" ||
    selectedDifficulties.length > 0;

  // Filtering Logic
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.short.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "All" || plant.category === selectedCategory;

    let matchesPrice = true;
    if (priceFilter === "under20") {
      matchesPrice = plant.price < 20;
    } else if (priceFilter === "20to50") {
      matchesPrice = plant.price >= 20 && plant.price <= 50;
    } else if (priceFilter === "over50") {
      matchesPrice = plant.price > 50;
    }

    const matchesDifficulty =
      selectedDifficulties.length === 0 || selectedDifficulties.includes(plant.difficulty);

    return matchesSearch && matchesCategory && matchesPrice && matchesDifficulty;
  });

  // Sorting Logic
  const sortedPlants = [...filteredPlants].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    } else if (sortBy === "price-desc") {
      return b.price - a.price;
    } else if (sortBy === "name-asc") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "name-desc") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  // Slicing Logic for Pagination
  const indexOfLastPlant = currentPage * itemsPerPage;
  const indexOfFirstPlant = indexOfLastPlant - itemsPerPage;
  const currentPlants = sortedPlants.slice(indexOfFirstPlant, indexOfLastPlant);
  const totalPages = Math.ceil(sortedPlants.length / itemsPerPage);

  // Count helper for categories
  const getCategoryCount = (cat: string) => {
    if (cat === "All") return plants.length;
    return plants.filter((p) => p.category === cat).length;
  };

  const renderFiltersPanel = () => (
    <div className="space-y-7">
      
      {/* Search Input Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-forest-dark/40">
          Search
        </h3>
        <div className="relative flex items-center w-full">
          <FiSearch className="absolute left-4 h-4 w-4 text-forest/50" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sage/15 bg-cream py-3 pl-10 pr-4 text-xs font-bold text-forest-dark placeholder-forest/40 outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15"
          />
        </div>
      </div>

      <hr className="border-sage/15" />

      {/* Category Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-forest-dark/40">
          Categories
        </h3>
        <div className="flex flex-col gap-1">
          {categories.map((category) => {
            const count = getCategoryCount(category);
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setIsMobileFilterOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-forest/10 text-forest"
                    : "text-forest-dark/70 hover:bg-cream hover:text-forest-dark"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FiChevronRight className={`text-[10px] transition-transform ${isActive ? "rotate-90 text-forest" : "text-forest/35"}`} />
                  {category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-forest text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-sage/15" />

      {/* Price Segment Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-forest-dark/40">
          Price Range
        </h3>
        <div className="flex flex-col gap-1.5">
          {priceFilters.map((filter) => {
            const isActive = priceFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => {
                  setPriceFilter(filter.value);
                  setIsMobileFilterOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "text-forest bg-forest/5"
                    : "text-forest-dark/70 hover:bg-cream hover:text-forest-dark"
                }`}
              >
                <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
                  isActive ? "border-forest bg-forest text-white" : "border-sage/35 bg-white"
                }`}>
                  {isActive && <FiCheck className="h-3 w-3" />}
                </div>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-sage/15" />

      {/* Difficulty Care Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-forest-dark/40">
          Care Level
        </h3>
        <div className="flex flex-col gap-1.5">
          {difficulties.map((diff) => {
            const isActive = selectedDifficulties.includes(diff);
            return (
              <button
                key={diff}
                onClick={() => toggleDifficulty(diff)}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "text-forest bg-forest/5"
                    : "text-forest-dark/70 hover:bg-cream hover:text-forest-dark"
                }`}
              >
                <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
                  isActive ? "border-forest bg-forest text-white" : "border-sage/35 bg-white"
                }`}>
                  {isActive && <FiCheck className="h-3 w-3" />}
                </div>
                <span>{diff} Care</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-sage/15" />

      {/* Sort Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-forest-dark/40">
          Sort Catalog
        </h3>
        <div className="relative flex items-center w-full">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-sage/15 bg-cream py-2.5 px-3 text-xs font-bold text-forest-dark outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15 appearance-none cursor-pointer"
          >
            <option value="default">Sort by Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Alphabetical: A-Z</option>
            <option value="name-desc">Alphabetical: Z-A</option>
          </select>
        </div>
      </div>

    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sage/15 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tight text-forest-dark sm:text-4xl">
            Explore Our <span className="text-forest">Collection</span>
          </h1>
          <p className="text-sm text-forest/60 font-medium">
            Find the perfect green addition for your home, office, or patio.
          </p>
        </div>
        {!loading && (
          <span className="text-xs font-extrabold text-forest-dark bg-sage/10 border border-sage/15 rounded-xl px-4 py-2 self-start sm:self-auto">
            Showing {sortedPlants.length} of {plants.length} Plants
          </span>
        )}
      </div>

      {/* Main Split Layout Container */}
      <div className="flex gap-8 relative items-start">
        
        {/* 1. Left Sidebar Filter (Desktop) */}
        <div className="hidden lg:block w-64 shrink-0 bg-white border border-sage/20 rounded-2xl p-6 shadow-sm sticky top-24">
          <div className="flex items-center justify-between border-b border-sage/15 pb-4 mb-5">
            <span className="text-sm font-black text-forest-dark uppercase tracking-wider">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-black text-terracotta hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
          {renderFiltersPanel()}
        </div>

        {/* 2. Right Side Content Column */}
        <div className="flex-1 w-full flex flex-col gap-6">
          
          {/* Mobile Filters Trigger (only visible on mobile/tablet) */}
          <div className="lg:hidden w-full">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-sage/25 bg-white py-3.5 text-sm font-bold text-forest-dark hover:bg-cream shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <FiFilter className="text-base" />
              <span>Open Filters & Sorting</span>
            </button>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-forest-dark/45 mr-1">Active:</span>
              
              {/* Category tag */}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-forest/5 border border-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")} className="hover:text-terracotta cursor-pointer"><FiX className="h-3.5 w-3.5" /></button>
                </span>
              )}

              {/* Price tag */}
              {priceFilter !== "All" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-forest/5 border border-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
                  Price: {priceFilters.find(f => f.value === priceFilter)?.label}
                  <button onClick={() => setPriceFilter("All")} className="hover:text-terracotta cursor-pointer"><FiX className="h-3.5 w-3.5" /></button>
                </span>
              )}

              {/* Difficulties tags */}
              {selectedDifficulties.map((diff) => (
                <span key={diff} className="inline-flex items-center gap-1.5 rounded-lg bg-forest/5 border border-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
                  Care: {diff}
                  <button onClick={() => toggleDifficulty(diff)} className="hover:text-terracotta cursor-pointer"><FiX className="h-3.5 w-3.5" /></button>
                </span>
              ))}

              {/* Search tag */}
              {searchQuery !== "" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-forest/5 border border-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")} className="hover:text-terracotta cursor-pointer"><FiX className="h-3.5 w-3.5" /></button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-terracotta hover:underline ml-2 cursor-pointer"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Catalog Grid */}
          {loading ? (
            <div className="text-center py-24 rounded-2xl border border-dashed border-sage/20 bg-white">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent mb-3.5" />
              <p className="text-sm font-bold text-forest">Loading Greenery Catalog...</p>
            </div>
          ) : currentPlants.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {currentPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    id={plant.id}
                    title={plant.title}
                    short={plant.short}
                    price={plant.price}
                    image={plant.image}
                    onClick={() => setSelectedPlant(plant)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-sage/10 mt-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-2.5 text-xs font-bold text-forest bg-cream border border-sage/15 rounded-xl hover:bg-forest hover:text-white disabled:opacity-40 disabled:hover:bg-cream disabled:hover:text-forest cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Previous
                  </button>
                  
                  {(() => {
                    const maxVisible = 11;
                    const halfWindow = Math.floor(maxVisible / 2);
                    let startPage = Math.max(1, currentPage - halfWindow);
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }

                    const items: React.ReactNode[] = [];

                    if (startPage > 1) {
                      items.push(
                        <button key={1} onClick={() => setCurrentPage(1)}
                          className="h-9 w-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer bg-cream text-forest/70 border border-sage/15 hover:bg-sage/10 hover:text-forest-dark">
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        items.push(
                          <span key="start-ellipsis" className="h-9 w-6 flex items-center justify-center text-xs text-forest/40 font-bold">…</span>
                        );
                      }
                    }

                    for (let page = startPage; page <= endPage; page++) {
                      const isCurrent = currentPage === page;
                      items.push(
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-forest text-white shadow-md shadow-forest/10"
                              : "bg-cream text-forest/70 border border-sage/15 hover:bg-sage/10 hover:text-forest-dark"
                          }`}>
                          {page}
                        </button>
                      );
                    }

                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        items.push(
                          <span key="end-ellipsis" className="h-9 w-6 flex items-center justify-center text-xs text-forest/40 font-bold">…</span>
                        );
                      }
                      items.push(
                        <button key={totalPages} onClick={() => setCurrentPage(totalPages)}
                          className="h-9 w-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer bg-cream text-forest/70 border border-sage/15 hover:bg-sage/10 hover:text-forest-dark">
                          {totalPages}
                        </button>
                      );
                    }

                    return items;
                  })()}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2.5 text-xs font-bold text-forest bg-cream border border-sage/15 rounded-xl hover:bg-forest hover:text-white disabled:opacity-40 disabled:hover:bg-cream disabled:hover:text-forest cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 rounded-2xl border border-dashed border-sage/20 bg-white px-6">
              <p className="text-sm font-bold text-forest-dark/60 leading-relaxed">
                No indoor plants found matching your current search or filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-3 text-xs font-extrabold text-forest hover:underline cursor-pointer"
              >
                Clear all filters and show all plants
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 3. Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-forest-dark/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-80 bg-white p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-sage/15 pb-4">
                <span className="text-sm font-black text-forest-dark uppercase tracking-wider">Filters</span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              {renderFiltersPanel()}

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="mt-auto w-full rounded-xl bg-terracotta/10 border border-terracotta/20 py-3 text-xs font-bold text-terracotta text-center transition-all cursor-pointer hover:bg-terracotta hover:text-white"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Product Detail Modal */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
      />

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-cream">
        <div className="text-center space-y-4">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
          <p className="text-sm font-bold text-forest">Loading Greenery Catalog...</p>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
