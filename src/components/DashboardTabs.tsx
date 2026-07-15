"use client";

import { ComponentType } from "react";

interface TabItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface DashboardTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: any) => void;
}

export default function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex border-b border-sage/15 overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer shrink-0 ${
              isActive
                ? "border-forest text-forest"
                : "border-transparent text-forest-dark/50 hover:text-forest"
            }`}
          >
            <Icon className="h-4 w-4" /> {tab.label}
          </button>
        );
      })}
    </div>
  );
}
