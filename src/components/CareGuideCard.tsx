"use client";

import { FiDroplet, FiSun } from "react-icons/fi";
import Image from "next/image";

interface PlantGuide {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  image: string;
  difficulty: "Easy" | "Medium" | "Hard";
  watering: string;
  sunlight: string;
  temperature: string;
  description: string;
  detailedCare: string[];
  commonProblems: { problem: string; solution: string }[];
}

interface CareGuideCardProps {
  plant: PlantGuide;
  onReadMore: (plant: PlantGuide) => void;
}

export default function CareGuideCard({ plant, onReadMore }: CareGuideCardProps) {
  const difficultyColors = {
    Easy: "bg-forest/10 text-forest border border-forest/20",
    Medium: "bg-terracotta/10 text-terracotta border border-terracotta/20",
    Hard: "bg-rose/10 text-rose border border-rose/20",
  };

  return (
    <div 
      onClick={() => onReadMore(plant)}
      className="flex flex-col rounded-2xl border border-sage/20 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer hover:border-forest/35 active:scale-[0.99] select-none"
    >
      {/* Plant Image */}
      <div className="relative h-48 w-full bg-cream overflow-hidden">
        <Image
          src={plant.image}
          alt={plant.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-forest shadow-sm backdrop-blur-sm">
            {plant.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-forest-dark tracking-tight leading-tight group-hover:text-forest transition-colors">
              {plant.name}
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                difficultyColors[plant.difficulty]
              }`}
            >
              {plant.difficulty}
            </span>
          </div>
          <p className="text-xs italic text-forest/60">{plant.scientificName}</p>
        </div>

        {/* Short Summary */}
        <p className="text-xs text-forest-dark/80 line-clamp-2 leading-relaxed">
          {plant.description}
        </p>

        {/* Quick Requirements */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 text-xs text-forest-dark/80 rounded-lg bg-cream border border-sage/15 px-2.5 py-1.5">
            <FiDroplet className="text-forest" />
            <span className="truncate font-semibold">{plant.watering}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-forest-dark/80 rounded-lg bg-cream border border-sage/15 px-2.5 py-1.5">
            <FiSun className="text-terracotta" />
            <span className="truncate font-semibold">{plant.sunlight}</span>
          </div>
        </div>

        {/* Action Link Signifier */}
        <div className="w-full text-center rounded-xl bg-forest/5 py-2.5 text-xs font-bold text-forest transition-all duration-200 group-hover:bg-forest group-hover:text-white mt-2">
          Read Full Guide
        </div>
      </div>
    </div>
  );
}
