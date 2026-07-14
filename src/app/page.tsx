import HeroSection from "@/components/HeroSection";
import FeaturedPlants from "@/components/FeaturedPlants";
import InsightsSection from "@/components/InsightsSection";
import GeneralCareSection from "@/components/GeneralCareSection";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturedPlants />
      <InsightsSection />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <GeneralCareSection />
      </div>
    </div>
  );
}
