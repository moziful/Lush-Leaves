"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiBookOpen } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface GeneralTip {
  title: string;
  shortDesc: string;
  fullDesc: string;
}

export default function GeneralCareSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const tips: GeneralTip[] = [
    {
      title: "The Golden Rule of Watering",
      shortDesc: "It is always better to underwater than to overwater. Learn how to test the soil.",
      fullDesc: "Most houseplant deaths are caused by overwatering, which leads to root rot. Before watering, stick your index finger about 1-2 inches deep into the soil. If it feels dry, it's time to water. If it's damp, check again in a few days. Always ensure your pots have drainage holes so excess water can escape.",
    },
    {
      title: "Understanding Light and Placement",
      shortDesc: "Bright indirect light is the sweet spot for most indoor foliage.",
      fullDesc: "Direct sunlight can scorch delicate leaves, while low light can stunt growth. Place plants near windows facing east or north for gentle light. For west or south-facing windows, shield plants with a sheer curtain to diffuse intense midday sun. Rotate your plants weekly so all sides get equal light.",
    },
    {
      title: "Repotting & Soil Selection",
      shortDesc: "Refresh soil and give roots room to breathe every 12-18 months.",
      fullDesc: "When roots start growing out of the drainage holes or the soil becomes compacted, it's time to repot. Choose a pot that is only 1-2 inches larger in diameter than the current one. Use a well-draining potting mix (typically with perlite or pumice) to prevent waterlogging.",
    },
    {
      title: "Managing Temperature & Humidity",
      shortDesc: "Keep plants away from cold drafts and dry heating vents.",
      fullDesc: "Indoor plants thrive in temperatures between 15°C and 25°C. Sudden temperature drops or drafts can cause leaves to drop. Many tropical plants also need high humidity—consider misting them, using a pebble tray filled with water, or grouping plants together to create a humid microclimate.",
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="rounded-2xl border border-sage/20 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <FiBookOpen className="text-xl text-forest" />
        <h2 className="text-xl font-bold text-forest-dark tracking-tight">
          General Plant Care Guidelines
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-xl border border-sage/20 p-5 transition-all duration-200 cursor-pointer ${
                isExpanded ? "bg-cream/50 ring-1 ring-forest/10" : "bg-white hover:bg-cream/20"
              }`}
              onClick={() => toggleExpand(idx)}
            >
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">
                  {tip.title}
                </h3>
                <button className="text-forest/60 hover:text-forest transition-colors">
                  {isExpanded ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-forest/60 mt-2 font-medium">
                {tip.shortDesc}
              </p>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-forest-dark/80 mt-3 border-t border-sage/10 pt-3 leading-relaxed">
                      {tip.fullDesc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
