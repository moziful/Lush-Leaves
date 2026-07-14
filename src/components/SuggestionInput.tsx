"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SuggestionInputProps {
  name: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export default function SuggestionInput({
  name,
  value,
  onChange,
  suggestions,
  placeholder,
  className = "",
}: SuggestionInputProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  const showDropdown = open && filtered.length > 0;

  // Recalculate position whenever the dropdown opens
  const updatePosition = () => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Estimate heights: list header/borders + (count * item_height)
    const dropdownHeight = Math.min(filtered.length * 40 + 8, 240);
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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  const dropdown = showDropdown && mounted ? createPortal(
    <ul
      style={dropdownStyle}
      className="overflow-hidden rounded-xl border border-sage/20 bg-white shadow-xl shadow-forest/10 animate-fadeIn"
    >
      {filtered.map((s) => (
        <li key={s}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(s);
            }}
            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-sage/20 hover:text-forest-dark ${
              value === s ? "bg-forest/10 text-forest font-bold" : "text-forest-dark"
            }`}
          >
            {highlightMatch(s, value)}
          </button>
        </li>
      ))}
    </ul>,
    document.body
  ) : null;

  return (
    <>
      <input
        ref={inputRef}
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          updatePosition();
        }}
        onFocus={() => {
          setOpen(true);
          updatePosition();
        }}
        className={className}
      />
      {dropdown}
    </>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-black text-forest bg-sage/20 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
