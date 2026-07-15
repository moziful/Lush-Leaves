"use client";

import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

interface RoomSpace {
  name: string;
  description: string;
  image: string;
  href: string;
  size: "large" | "small";
}

const spaces: RoomSpace[] = [
  {
    name: "Living Room",
    description: "Statement plants to elevate your main social and relaxing space.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
    href: "/explore?category=Foliage",
    size: "large",
  },
  {
    name: "Office Space",
    description: "Low-maintenance air purifiers to enhance focus.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
    href: "/explore?difficulty=Easy",
    size: "small",
  },
  {
    name: "Bedroom Oasis",
    description: "Soothing greenery that promotes deep rest and sleep.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600",
    href: "/explore?category=Pet+Friendly",
    size: "small",
  },
];

export default function ShopByRoomSection() {
  return (
    <section className="bg-white py-20 border-t border-sage/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-forest/50">
            Inspiring Spaces
          </span>
          <h2 className="text-3xl font-black tracking-tight text-forest-dark sm:text-4xl">
            Shop by <span className="text-forest">Room</span>
          </h2>
          <p className="text-sm text-forest/70 font-medium max-w-xl">
            Find the perfect plants tailored specifically for the environments and lighting of your favorite rooms.
          </p>
        </div>

        {/* Visual Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <Link
              key={space.name}
              href={space.href}
              className={`group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-slate-900 border border-sage/10 shadow-sm transition-all duration-300 hover:shadow-md ${
                space.size === "large" ? "md:col-span-2 h-[420px]" : "h-[420px]"
              }`}
            >
              {/* Image with zoom effect on hover */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={space.image}
                  alt={space.name}
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />
              </div>

              {/* Text contents */}
              <div className="relative z-20 p-8 space-y-3 mt-auto">
                <h3 className="text-2xl font-black text-white">{space.name}</h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md font-medium">
                  {space.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-sage group-hover:text-white transition-colors duration-200 pt-2">
                  Browse Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
