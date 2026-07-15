import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import Button from "@/components/Button";

export default function HeroSection() {
  return (
    <section className="relative flex h-[65vh] w-full items-center justify-center overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 z-0 opacity-55">
        <Image
          src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=1200"
          alt="Lush green botanical interior design"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-forest/25 to-slate-950/80 z-10" />

      <div className="relative z-20 mx-auto max-w-4xl px-4 text-center space-y-8">
        <div className="space-y-3">
          <span className="inline-block rounded-full bg-sage/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sage border border-sage/20">
            Premium Botanical Curators
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-cream drop-shadow-sm">
            Breathe Life Into Your Space
          </h1>
        </div>
        <p className="mx-auto max-w-xl text-base sm:text-lg text-slate-200">
          Explore a curated collection of healthy, greenhouse-grown indoor plants delivered securely to your doorstep.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link href="/explore">
            <Button variant="primary" size="lg" className="flex items-center gap-2">
              Shop Collection <FiArrowRight />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary" size="lg">
              Our Story
            </Button>
          </Link>
        </div>
      </div>

      {/* Pulsing Scroll Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-1.5 opacity-60">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-200 animate-pulse">Scroll</span>
        <div className="w-5 h-8 border-2 border-slate-200 rounded-full flex justify-center p-1.5">
          <div className="w-1 h-2 bg-slate-200 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
