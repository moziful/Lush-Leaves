import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiTarget, FiHeart, FiGlobe } from "react-icons/fi";
import Button from "@/components/Button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-forest">About LushLeaves</span>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight sm:text-5xl">
          Cultivating Fresh Spaces and Healthy Living
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          We believe that surrounding yourself with greenery improves focus, filters harmful indoor toxins, and transforms your home into a tranquil botanical oasis.
        </p>
      </div>

      {/* Grid: Image + Description */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-6 relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800"
            alt="Inside LushLeaves nursery greenhouse"
            fill
            className="object-cover"
          />
        </div>
        <div className="md:col-span-6 space-y-5">
          <h2 className="text-2xl font-bold text-slate-800">Our Sourcing and Care Standards</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every plant available in our storefront is raised with extreme care in our partner local greenhouses. We monitor temperature, organic soil nutrition, and moisture closely to make sure your plant specimen arrives thick, green, and bug-free.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            We avoid mass commercial farming techniques that weaken roots, meaning you receive robust indoor plants capable of adapting instantly to your bedroom or home office.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="border-t border-slate-100 pt-12 space-y-8">
        <h2 className="text-2xl font-bold text-center text-slate-800">Our Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white border border-slate-100 p-6 space-y-3 shadow-sm">
            <div className="inline-block rounded-full bg-forest/5 p-3 text-forest">
              <FiTarget className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">100% Quality Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If your plant arrives damaged or fails to adapt within 30 days, we replace it immediately without any hassle.
            </p>
          </div>
          <div className="rounded-xl bg-white border border-slate-100 p-6 space-y-3 shadow-sm">
            <div className="inline-block rounded-full bg-forest/5 p-3 text-forest">
              <FiHeart className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Environmental Sourcing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We focus on composting, natural peat-free soil substrates, and organic fertilizing techniques across all grower networks.
            </p>
          </div>
          <div className="rounded-xl bg-white border border-slate-100 p-6 space-y-3 shadow-sm">
            <div className="inline-block rounded-full bg-forest/5 p-3 text-forest">
              <FiGlobe className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Empowering Thriving Homes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We provide free lifetime access to care instructions, watering timelines, and our community support lines.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl border border-sage/30 bg-white p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Ready to Meet Your Perfect Botanical Match?</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Take a look at our easy-care snake plants, pothos, and lilies ideal for both low-light offices and bright patios.
        </p>
        <div className="pt-2">
          <Link href="/explore">
            <Button variant="primary" size="md" className="flex items-center gap-1.5 mx-auto">
              Explore Catalog <FiArrowRight />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
