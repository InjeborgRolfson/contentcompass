"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ContentType } from "@/types/content";
import { Check, X, ChevronDown } from "lucide-react";

interface DiscoveryFiltersProps {
  filters: ContentType[];
  setFilters: (filters: ContentType[]) => void;
  lengthFilter: "" | "short" | "medium" | "long";
  setLengthFilter: (length: "" | "short" | "medium" | "long") => void;
  yearFilter: "" | "classic" | "retro" | "modern" | "recent";
  setYearFilter: (year: "" | "classic" | "retro" | "modern" | "recent") => void;
  turkishOnly: boolean;
  setTurkishOnly: (turkishOnly: boolean) => void;
}

const contentTypes: ContentType[] = [
  "Book",
  "Movie",
  "Tv Show",
  "Podcast",
  "Music",
  "Game",
  "Creator",
  "Article",
  "Youtube",
  "Other",
];

const lengths = ["short", "medium", "long"] as const;
const eras = ["classic", "retro", "modern", "recent"] as const;

export default function DiscoveryFilters({
  filters,
  setFilters,
  lengthFilter,
  setLengthFilter,
  yearFilter,
  setYearFilter,
  turkishOnly,
  setTurkishOnly,
}: DiscoveryFiltersProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleType = (type: ContentType) => {
    if (filters.includes(type)) {
      setFilters(filters.filter((t) => t !== type));
    } else {
      setFilters([...filters, type]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-20">
      {/* Content Type Multi-select */}
      <div className="relative lg:col-span-1 z-30">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-12 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center justify-between focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all hover:border-slate-600 shadow-sm cursor-pointer"
        >
          <div className="flex flex-wrap gap-2 items-center flex-1">
            {filters.length === 0 ? (
              <span className="text-sm font-medium text-slate-400">
                {t("contentType")}
              </span>
            ) : (
              filters.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs font-bold text-indigo-300 animate-in fade-in zoom-in duration-200"
                >
                  {t(type.toLowerCase() as any)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleType(type);
                    }}
                    className="hover:text-indigo-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown Desktop/Touch */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden transition-all animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-1">
                {contentTypes.map((type) => {
                  const isActive = filters.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleType(type);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {t(type.toLowerCase() as any)}
                      {isActive && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-end px-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="text-[10px] font-bold uppercase text-indigo-400 hover:text-indigo-300"
                >
                  {t("close" as any) || "Close"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Length */}
      <div className="relative group">
        <select
          value={lengthFilter}
          onChange={(e) => setLengthFilter(e.target.value as any)}
          className="w-full h-12 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 text-sm font-medium text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all cursor-pointer group-hover:border-slate-600 shadow-sm"
        >
          <option value="" className="bg-slate-900 text-slate-400">
            {t("lengthFilter")}
          </option>
          {lengths.map((len) => (
            <option
              key={len}
              value={len}
              className="bg-slate-900 text-slate-200"
            >
              {t(len)}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-slate-400 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Era */}
      <div className="relative group">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value as any)}
          className="w-full h-12 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 text-sm font-medium text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all cursor-pointer group-hover:border-slate-600 shadow-sm"
        >
          <option value="" className="bg-slate-900 text-slate-400">
            {t("yearFilter")}
          </option>
          {eras.map((era) => (
            <option
              key={era}
              value={era}
              className="bg-slate-900 text-slate-200"
            >
              {t(era)}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-slate-400 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Turkish Checkbox Styled as Select/Button */}
      <button
        onClick={() => setTurkishOnly(!turkishOnly)}
        className={`w-full h-12 rounded-xl px-4 text-sm font-bold transition-all border flex items-center justify-between group shadow-sm ${
          turkishOnly
            ? "bg-red-500/10 border-red-500/30 text-red-200 shadow-red-900/10"
            : "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
        }`}
      >
        <div className="flex items-center gap-2">
          <span>🇹🇷</span>
          <span>{t("turkishContent")}</span>
        </div>
        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            turkishOnly
              ? "bg-red-500 border-red-400 text-white"
              : "border-slate-600 bg-slate-800"
          }`}
        >
          {turkishOnly && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </button>
    </div>
  );
}
