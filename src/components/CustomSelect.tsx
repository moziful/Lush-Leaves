"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown } from "react-icons/fi";

interface CustomSelectProps {
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  className?: string;
  optionClassName?: (opt: string) => string;
}

export default function CustomSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
  optionClassName,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Estimate heights: count * item_height (approx 40px)
    const dropdownHeight = Math.min(options.length * 40 + 8, 240);
    const spaceBelow = window.innerHeight - rect.bottom;
    const preferAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setDropdownStyle({
      position: "fixed",
      top: preferAbove ? rect.top - dropdownHeight - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      maxHeight: `${dropdownHeight}px`,
    });
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      // Handle resize or scroll to reposition
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, { capture: true });
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, { capture: true });
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const dropdown = open && mounted ? createPortal(
    <ul
      style={dropdownStyle}
      className="overflow-hidden rounded-xl border border-sage/20 bg-white shadow-lg shadow-forest/10 animate-fadeIn max-h-60 overflow-y-auto"
    >
      {options.map((opt) => (
        <li key={opt}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(opt)}
            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-sage/20 hover:text-forest-dark ${
              value === opt
                ? "bg-forest/10 text-forest font-bold"
                : "text-forest-dark"
            } ${optionClassName ? optionClassName(opt) : ""}`}
          >
            {opt}
          </button>
        </li>
      ))}
    </ul>,
    document.body
  ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${className} flex items-center justify-between text-left cursor-pointer`}
      >
        <span>{value || placeholder}</span>
        <FiChevronDown className={`h-4 w-4 text-forest/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {dropdown}
    </div>
  );
}
