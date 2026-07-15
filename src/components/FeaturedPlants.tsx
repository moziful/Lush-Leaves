"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Button from "@/components/Button";
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

export default function FeaturedPlants() {
  const [featured, setFeatured] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  useEffect(() => {
    fetch("/api/plants")
      .then((r) => r.json())
      .then((data: Plant[]) => {
        if (Array.isArray(data)) setFeatured(data.slice(0, 3));
      })
      .catch(() => { });
  }, []);

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-forest/50">
              Handpicked for you
            </span>
            <h2 className="text-3xl font-black tracking-tight text-forest-dark sm:text-4xl">
              Featured <span className="text-forest">Plants</span>
            </h2>
          </div>
          <Link
            href="/explore"
            className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold text-forest hover:text-forest-dark transition-colors"
          >
            View All <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white/70 border border-sage/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featured.map((plant) => (
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
        )}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/explore">
            <Button variant="primary" className="flex items-center gap-2">
              View All Plants <FiArrowRight />
            </Button>
          </Link>
        </div>
      </div>
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
      />
    </section>
  );
}
