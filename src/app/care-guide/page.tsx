"use client";

import { useState } from "react";
import { FiSearch, FiBookOpen } from "react-icons/fi";
import CareGuideCard from "@/components/CareGuideCard";
import CareGuideDetailModal from "@/components/CareGuideDetailModal";
import GeneralCareSection from "@/components/GeneralCareSection";

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

const mockPlantGuides: PlantGuide[] = [
  {
    id: "1",
    name: "Snake Plant",
    scientificName: "Sansevieria trifasciata",
    category: "Succulents",
    image: "https://images.unsplash.com/photo-1593487568522-746db8894941?auto=format&fit=crop&q=80&w=600",
    difficulty: "Easy",
    watering: "Every 2-3 weeks",
    sunlight: "Low to Bright",
    temperature: "15°C - 29°C",
    description: "One of the hardiest house plants, the Snake Plant has stiff, upright, sword-like leaves. It can tolerate neglect and makes an excellent choice for beginners.",
    detailedCare: [
      "Allow the soil to dry out completely between waterings.",
      "Thrives in moderate to bright indirect light, but tolerates low light extremely well.",
      "Keep in well-drained cactus soil with pots that have drainage holes.",
      "Avoid wetting the center of the rosette (where leaves sprout)."
    ],
    commonProblems: [
      {
        problem: "Yellowing or mushy leaves",
        solution: "This is a sign of overwatering. Immediately stop watering and allow the soil to dry fully. Cut off mushy leaves at the base."
      }
    ]
  },
  {
    id: "2",
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    category: "Foliage",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600",
    difficulty: "Medium",
    watering: "Every 1-2 weeks",
    sunlight: "Bright Indirect",
    temperature: "18°C - 30°C",
    description: "Famous for its natural leaf fenestrations (holes), the Monstera Deliciosa is a climbing botanical statement piece that brings tropical vibes into any room.",
    detailedCare: [
      "Water when the top 2 inches of soil are dry. Ensure thorough watering until it drains from the bottom.",
      "Provide plenty of bright, indirect sunlight to encourage leaf splits.",
      "Clean leaves regularly with a damp cloth to help the plant photosynthesize.",
      "Provide a moss pole or trellis for support as the plant grows and climbs."
    ],
    commonProblems: [
      {
        problem: "Brown tips on leaves",
        solution: "Usually indicates low humidity or dry air. Mist leaves regularly, group with other plants, or use a humidifier."
      }
    ]
  },
  {
    id: "3",
    name: "Peace Lily",
    scientificName: "Spathiphyllum",
    category: "Flowers",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600",
    difficulty: "Easy",
    watering: "Weekly",
    sunlight: "Low to Medium",
    temperature: "16°C - 27°C",
    description: "With glossy dark green leaves and elegant white blooms, the Peace Lily is outstanding at purifying air and literally tells you when it needs water by drooping.",
    detailedCare: [
      "Water when the leaves begin to droop slightly. Keep soil consistently moist but never soggy.",
      "Place in low to medium indirect light. Direct sunlight can scorch the white spathes.",
      "Use filtered or distilled water if possible, as they are sensitive to fluoride in tap water.",
      "Wipe down leaves occasionally to keep them clean and shiny."
    ],
    commonProblems: [
      {
        problem: "No flowers blooming",
        solution: "Your Peace Lily might not be getting enough light. Move it to a slightly brighter location with indirect sunlight."
      }
    ]
  },
  {
    id: "4",
    name: "Fiddle Leaf Fig",
    scientificName: "Ficus lyrata",
    category: "Foliage",
    image: "https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600",
    difficulty: "Hard",
    watering: "Every 7-10 days",
    sunlight: "Bright Indirect",
    temperature: "18°C - 24°C",
    description: "A beloved design element, the Fiddle Leaf Fig is highly rewarding but requires consistent care and the right light to maintain its signature violin-shaped leaves.",
    detailedCare: [
      "Water thoroughly only when the top inch of soil is completely dry. Do not let it sit in stagnant water.",
      "Requires plenty of bright, consistent, indirect sunlight. Direct sun can burn the leaves.",
      "Rotate the pot 90 degrees every month to ensure even growth and light exposure.",
      "Keep away from drafts, AC vents, and heaters, as they dislike temperature fluctuations."
    ],
    commonProblems: [
      {
        problem: "Dropping leaves",
        solution: "This is usually caused by sudden environmental changes, drafts, or incorrect watering. Find a stable, bright spot and establish a regular watering routine."
      }
    ]
  },
  {
    id: "5",
    name: "Spider Plant",
    scientificName: "Chlorophytum comosum",
    category: "Pet Friendly",
    image: "https://images.unsplash.com/photo-1572605412440-72623d3832c3?auto=format&fit=crop&q=80&w=600",
    difficulty: "Easy",
    watering: "Weekly",
    sunlight: "Medium to Bright",
    temperature: "13°C - 27°C",
    description: "Highly adaptable, fast-growing, and safe for cats and dogs. The Spider Plant produces lovely arching foliage and little 'spiderettes' that are easy to propagate.",
    detailedCare: [
      "Water thoroughly when the top 50% of the soil is dry. They prefer slightly drier conditions in winter.",
      "Enjoys bright, indirect light but adapts well to semi-shaded spaces.",
      "Grow in well-draining soil mix.",
      "Easily propagate by cutting off the baby spiderettes and placing them in water or damp soil."
    ],
    commonProblems: [
      {
        problem: "Brown leaf tips",
        solution: "Commonly caused by fluoride/chlorine in tap water or low humidity. Try using rainwater/distilled water and misting."
      }
    ]
  },
  {
    id: "6",
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis miller",
    category: "Succulents",
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
    difficulty: "Easy",
    watering: "Every 3 weeks",
    sunlight: "Bright Direct",
    temperature: "13°C - 27°C",
    description: "A popular succulent with thick, fleshy leaves containing a soothing gel. Aloe Vera loves sunny windows and requires minimal watering.",
    detailedCare: [
      "Water deeply but very infrequently. Allow soil to dry completely down to the bottom before watering again.",
      "Requires bright, direct sunlight. Give it at least 6 hours of sun daily.",
      "Use sandy, well-draining succulent potting soil.",
      "Repot only when it becomes top-heavy or outgrows the pot."
    ],
    commonProblems: [
      {
        problem: "Limp, thin leaves",
        solution: "This is a sign of underwatering or lack of light. Ensure it gets plenty of direct sun and a thorough watering soak."
      }
    ]
  }
];

export default function CareGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlant, setSelectedPlant] = useState<PlantGuide | null>(null);

  const categories = ["All", "Foliage", "Succulents", "Flowers", "Pet Friendly"];

  const filteredGuides = mockPlantGuides.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || plant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-12">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest mb-2">
          <FiBookOpen className="text-xl" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-forest-dark tracking-tight leading-tight">
          Plant Care <span className="text-forest">Guides</span>
        </h1>
        <p className="text-sm sm:text-base text-forest/60 leading-relaxed font-medium">
          Whether you are a first-time plant parent or looking after rare tropical species, our guides help you nurture your greenery successfully.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-sage/20 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex items-center w-full md:flex-1">
          <FiSearch className="absolute left-4 h-5 w-5 text-forest/50" />
          <input
            type="text"
            placeholder="Search plants (e.g., Monstera)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sage/15 bg-cream py-3 pl-12 pr-4 text-sm text-forest-dark placeholder-forest/40 outline-none transition-all duration-200 focus:border-forest focus:ring-2 focus:ring-forest/15"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto md:ml-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                selectedCategory === category
                  ? "bg-forest text-white shadow-md shadow-forest/10"
                  : "bg-cream text-forest/70 border border-sage/15 hover:bg-sage/10 hover:text-forest-dark"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Grid */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((plant) => (
            <CareGuideCard
              key={plant.id}
              plant={plant}
              onReadMore={setSelectedPlant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-sage/30">
          <p className="text-sm font-semibold text-forest/60">
            No care guides found matching your search.
          </p>
        </div>
      )}
      <GeneralCareSection />
      <CareGuideDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
      />
    </div>
  );
}
