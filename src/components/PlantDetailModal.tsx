"use client";

import { useEffect, useState } from "react";
import { FiX, FiDroplet, FiSun, FiThermometer, FiCheck, FiAlertTriangle, FiShoppingBag } from "react-icons/fi";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

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

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
}

export default function PlantDetailModal({ plant, onClose }: PlantDetailModalProps) {
  const [buttonText, setButtonText] = useState("Add to Cart");

  useEffect(() => {
    if (plant) {
      document.body.style.overflow = "hidden";
      setButtonText("Add to Cart");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [plant]);

  if (!plant) return null;

  const difficultyMeta = {
    Easy: { color: "text-forest bg-forest/10 border border-forest/20", label: "Beginner Friendly" },
    Medium: { color: "text-terracotta bg-terracotta/10 border border-terracotta/20", label: "Intermediate Care" },
    Hard: { color: "text-rose bg-rose/10 border border-rose/20", label: "Advanced Care" },
  };

  const currentDiff = difficultyMeta[plant.difficulty] || difficultyMeta.Easy;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.plantId === plant.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        plantId: plant.id,
        title: plant.title,
        price: plant.price,
        image: plant.image,
        quantity: 1
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setButtonText("Added to cart");
    window.dispatchEvent(new Event("cartUpdated"));
    setTimeout(() => {
      setButtonText("Add to Cart");
    }, 2000);
  };

  return (
    <AnimatePresence>
      {plant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-forest-dark/45 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-cream rounded-3xl overflow-hidden shadow-2xl border border-sage/20 flex flex-col md:flex-row my-8 max-h-[90vh] z-10"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2.5 text-forest/70 hover:bg-white hover:text-forest transition-all shadow-md active:scale-95 cursor-pointer border border-sage/10"
            >
              <FiX className="h-5 w-5" />
            </button>

            {/* Left Side: Cover Image */}
            <div className="relative w-full md:w-1/2 h-72 md:h-auto min-h-[350px] bg-cream shrink-0">
              <Image
                src={plant.image}
                alt={plant.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="inline-block rounded-full bg-sage px-3 py-1 text-[10px] font-black uppercase tracking-wider text-forest-dark shadow-sm">
                  {plant.category}
                </span>
                <h2 className="text-3xl font-black tracking-tight leading-tight drop-shadow-md">
                  {plant.title}
                </h2>
                <p className="text-sm italic text-cream/90 font-medium drop-shadow-sm">
                  {plant.scientificName}
                </p>
              </div>
            </div>

            {/* Right Side: Scrollable Details */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 scroll-smooth scrollbar-thin scrollbar-thumb-sage/20">
              
              {/* Overview */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-bold ${currentDiff.color}`}>
                    {currentDiff.label} ({plant.difficulty})
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-forest-dark/80 font-medium">
                  {plant.description}
                </p>
              </div>

              {/* Quick-Glance Requirements */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl border border-sage/15 p-4 flex flex-col items-center text-center shadow-sm hover:border-forest/20 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-sage/10 flex items-center justify-center text-forest mb-2">
                    <FiDroplet className="text-base" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-forest/50">Watering</span>
                  <span className="text-xs font-bold text-forest-dark mt-1">{plant.watering}</span>
                </div>

                <div className="bg-white rounded-2xl border border-sage/15 p-4 flex flex-col items-center text-center shadow-sm hover:border-terracotta/20 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta mb-2">
                    <FiSun className="text-base" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-forest/50">Sunlight</span>
                  <span className="text-xs font-bold text-forest-dark mt-1">{plant.sunlight}</span>
                </div>

                <div className="bg-white rounded-2xl border border-sage/15 p-4 flex flex-col items-center text-center shadow-sm hover:border-forest/20 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-forest/10 flex items-center justify-center text-forest mb-2">
                    <FiThermometer className="text-base" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-forest/50">Temperature</span>
                  <span className="text-xs font-bold text-forest-dark mt-1">{plant.temperature}</span>
                </div>
              </div>

              {/* Detailed Care Instructions */}
              <div className="space-y-3.5 bg-white border border-sage/15 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-forest-dark border-b border-sage/15 pb-2.5">
                  Detailed Care Instructions
                </h3>
                <ul className="space-y-3">
                  {plant.detailedCare.map((step, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-sm text-forest-dark/80 leading-relaxed">
                      <div className="h-5 w-5 rounded-full bg-forest/10 flex items-center justify-center text-forest shrink-0 mt-0.5">
                        <FiCheck className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Problems */}
              {plant.commonProblems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-forest/50">
                    Troubleshooting Common Issues
                  </h3>
                  <div className="space-y-2.5">
                    {plant.commonProblems.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-4.5 flex gap-3.5 items-start"
                      >
                        <div className="h-8 w-8 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta shrink-0">
                          <FiAlertTriangle className="text-base" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-black text-terracotta uppercase tracking-wider">
                            Issue: {item.problem}
                          </h4>
                          <p className="text-xs text-forest-dark/80 leading-relaxed">
                            <span className="font-bold text-forest">Recommended Action:</span> {item.solution}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Add to Cart */}
              <div className="flex items-center justify-between gap-4 border-t border-sage/15 pt-5 mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider text-forest/50">Price</span>
                  <span className="text-3xl font-black text-forest-dark">${plant.price.toFixed(2)}</span>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 px-6 py-3.5 shadow-md min-w-[150px] justify-center"
                >
                  <FiShoppingBag className="text-base" />
                  {buttonText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
