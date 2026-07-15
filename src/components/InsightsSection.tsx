"use client";

import dynamic from "next/dynamic";
import { FiActivity, FiCpu, FiFeather } from "react-icons/fi";

const PlantCareChart = dynamic(() => import("./PlantCareChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center rounded-2xl bg-white border border-sage/15 shadow-sm">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
    </div>
  ),
});

export default function InsightsSection() {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

          {/* Text Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-forest/50 flex items-center gap-1.5">
                <FiActivity className="h-4 w-4" /> Live Botanics
              </span>
              <h2 className="text-3xl font-black tracking-tight text-forest-dark sm:text-4xl">
                Scientific <span className="text-forest">Insights</span>
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              We monitor and research how indoor plants act as natural filters, boosting ambient health metrics. Different species target specific indoor environment optimization.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                  <FiFeather className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-forest-dark">Air Purification</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Plants naturally absorb toxic particles, increasing oxygen rates up to 92%.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                  <FiCpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-forest-dark">Environmental Balance</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Maintains relative humidity, optimizing spaces against dry conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <PlantCareChart />
          </div>

        </div>
      </div>
    </section>
  );
}
