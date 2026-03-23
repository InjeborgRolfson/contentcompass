"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ContentType } from "@/types/content";
import {
  Search,
  Loader2,
  Sparkles,
  RefreshCw,
  Star,
  Info,
  LayoutGrid,
  List,
  Compass,
  X,
  Eye,
} from "lucide-react";
import RecommendationCard from "@/components/RecommendationCard";
import ViewToggle from "@/components/ViewToggle";
import RecommendationTable from "@/components/RecommendationTable";
import DiscoveryFilters from "@/components/DiscoveryFilters";

const contentTypes: ContentType[] = [
  "Book",
  "Movie",
  "Tv Show",
  "Podcast",
  "Music",
  "Game",
  "Article",
  "Youtube",
  "Other",
];

export default function DiscoverPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContentType[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendError, setRecommendError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [turkishOnly, setTurkishOnly] = useState(false);
  const [seenTitles, setSeenTitles] = useState<string[]>([]);
  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [sessionShowingHidden, setSessionShowingHidden] = useState(false);
  const [lengthFilter, setLengthFilter] = useState<
    "" | "short" | "medium" | "long"
  >("");
  const [yearFilter, setYearFilter] = useState<
    "" | "classic" | "retro" | "modern" | "recent"
  >("");
  const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);

  const [showHint, setShowHint] = useState(false);

  const { t, language } = useLanguage();

  useEffect(() => {
    const hasSeenHint = localStorage.getItem("hasSeenDiscoverHint");
    if (!hasSeenHint) setShowHint(true);
  }, []);

  const dismissHint = () => {
    localStorage.setItem("hasSeenDiscoverHint", "true");
    setShowHint(false);
  };

  useEffect(() => {
    fetchFavorites();
    fetchSeenContent();
    fetchSavedRecommendations();
    const savedView = localStorage.getItem("viewMode") as "grid" | "list";
    if (savedView) setViewMode(savedView);

    const cached = localStorage.getItem("latestRecommendations");
    if (cached) {
      try {
        setRecommendations(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached recommendations", e);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (minutesRemaining !== null && minutesRemaining > 0) {
      interval = setInterval(() => {
        setMinutesRemaining((prev) =>
          prev !== null && prev > 1 ? prev - 1 : null,
        );
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [minutesRemaining]);

  const handleViewChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("viewMode", mode);
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setFavorites(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchSeenContent = async () => {
    try {
      const res = await fetch("/api/seen");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const titles = (Array.isArray(data) ? data : []).map(
        (item: any) => item.title,
      );
      setSeenTitles(titles);
    } catch (err) {
      console.error("Failed to fetch seen content:", err);
    }
  };

  const fetchSavedRecommendations = async () => {
    try {
      const res = await fetch("/api/recommendations/save");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const titles = (Array.isArray(data?.data) ? data.data : []).map(
        (item: any) => item.title,
      );
      setSavedTitles(titles);
    } catch (err) {
      console.error("Failed to fetch saved recommendations:", err);
    }
  };

  const toggleFavorite = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === favorites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(favorites.map((f) => f._id));
    }
  };

  const toggleFilter = (type: ContentType) => {
    setFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleLength = (length: "short" | "medium" | "long") => {
    setLengthFilter((prev) => (prev === length ? "" : length));
  };

  const toggleYear = (year: "classic" | "retro" | "modern" | "recent") => {
    setYearFilter((prev) => (prev === year ? "" : year));
  };

  const selectedFavorites = useMemo(
    () => favorites.filter((f) => selectedIds.includes(f._id)),
    [favorites, selectedIds],
  );

  const refreshLimit = useMemo(() => {
    const count = selectedIds.length;
    if (count >= 1 && count <= 5) return 2;
    if (count >= 6 && count <= 7) return 3;
    if (count >= 8) return 4;
    return 0;
  }, [selectedIds]);

  const findMatches = async (isRefresh = false) => {
    if (selectedIds.length === 0) return;

    if (isRefresh) {
      setRefreshing(true);
      setRefreshCount((prev) => prev + 1);
    } else {
      setLoading(true);
      setRefreshCount(0);
      setRecommendError("");
      setMinutesRemaining(null);
    }

    try {
      // Build exclude list: already recommended + seen titles (if not showing hidden) + saved titles
      const seenToExclude = !sessionShowingHidden ? seenTitles : [];
      const excludeTitles = isRefresh
        ? [
            ...recommendations.map((r) => r.title),
            ...seenToExclude,
            ...savedTitles,
          ]
        : [...seenToExclude, ...savedTitles];

      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedFavorites,
          filters,
          lengthFilter,
          yearFilter,
          language,
          turkishOnly,
          excludeTitles,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 429 && errorData.minutesLeft) {
          setMinutesRemaining(errorData.minutesLeft);
          return; // Stop without setting recommendError
        }
        throw new Error(
          `HTTP ${res.status}: ${errorData.error || "Unknown error"}`,
        );
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecommendations(data);
        localStorage.setItem("latestRecommendations", JSON.stringify(data));
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to find matches:", errorMsg);
      setRecommendError(errorMsg);
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectionText = useMemo(() => {
    if (selectedIds.length === 0) return t("noneSelected");
    if (selectedIds.length === favorites.length)
      return t("allFavoritesSelected");
    return `${selectedIds.length} ${t("selected")}`;
  }, [selectedIds, favorites, t]);

  const subtitleText = useMemo(() => {
    if (selectedFavorites.length === 0) return "";
    if (selectedFavorites.length === 1) return selectedFavorites[0].title;
    if (selectedFavorites.length === 2)
      return `${selectedFavorites[0].title} & ${selectedFavorites[1].title}`;
    if (selectedFavorites.length === 3)
      return `${selectedFavorites[0].title}, ${selectedFavorites[1].title} & ${selectedFavorites[2].title}`;
    return `${selectedFavorites[0].title}, ${selectedFavorites[1].title} + ${selectedFavorites.length - 2} more`;
  }, [selectedFavorites]);

  return (
    <div className="flex flex-col min-h-screen pb-32 md:pb-20">
      {showHint && (
        <div className="bg-theme-600 text-white animate-in slide-in-from-top duration-500 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-sm md:text-base font-medium leading-tight">
                {t("discoverHint")}
              </p>
            </div>
            <button
              onClick={dismissHint}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss hint"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {/* Hero Panel */}
      <div className="bg-[#0f172a] text-white pt-24 pb-16 md:pt-32 md:pb-24 shadow-2xl relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-theme-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-12">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-theme-400 mb-2">
                {t("discover")}
              </h2>
              <h1 className="text-2xl md:text-5xl font-extrabold flex flex-wrap items-center gap-2 md:gap-3">
                {t("yourCustomCompassReading")}
                <span className="text-theme-400/30 font-light text-xl md:text-2xl hidden md:inline">
                  /
                </span>
                <span className="text-theme-300/80 font-medium text-base md:text-lg italic w-full md:w-auto mt-1 md:mt-0">
                  {selectionText}
                </span>
              </h1>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <button
                onClick={() => findMatches(false)}
                disabled={
                  selectedIds.length === 0 ||
                  loading ||
                  (minutesRemaining !== null && minutesRemaining > 0)
                }
                className={`w-full md:w-auto justify-center px-10 py-4 rounded-2xl font-bold shadow-2xl transition-all flex items-center gap-2 relative group overflow-hidden ${
                  selectedIds.length === 0 ||
                  (minutesRemaining !== null && minutesRemaining > 0)
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-theme-600 hover:bg-theme-500 text-white hover:-translate-y-1 active:scale-95"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {t("findMatches")}
              </button>
              {minutesRemaining !== null && minutesRemaining > 0 && (
                <p className="text-xs md:text-sm font-medium text-amber-400 flex items-center gap-1.5 animate-pulse bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  {t("rateLimitExceeded").replace(
                    "{minutes}",
                    minutesRemaining.toString(),
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={toggleAll}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                    selectedIds.length === favorites.length
                      ? "bg-theme-600 border-theme-500 text-white shadow-lg shadow-theme-900/40"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${selectedIds.length === favorites.length ? "fill-white" : ""}`}
                  />
                  {t("allFavorites")}
                </button>

                {favorites.map((fav) => (
                  <button
                    key={fav._id}
                    onClick={() => toggleFavorite(fav._id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      selectedIds.includes(fav._id)
                        ? "bg-theme-500/20 border-theme-400 text-theme-100 shadow-md shadow-theme-900/20"
                        : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    {fav.title}{" "}
                    <span className="text-[10px] opacity-40 ml-1">
                      ({t(fav.type.toLowerCase() as any)})
                    </span>
                  </button>
                ))}

                {favorites.length === 0 && !favoritesLoading && (
                  <div className="flex items-center gap-2 text-slate-500 italic text-sm py-2">
                    <Info className="w-4 h-4" />
                    {t("tagline")}
                  </div>
                )}
              </div>

              {selectedIds.length === 0 && (
                <p className="text-xs text-theme-400/60 animate-pulse font-medium">
                  {t("selectHint")}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <DiscoveryFilters
                filters={filters}
                setFilters={setFilters}
                lengthFilter={lengthFilter}
                setLengthFilter={(val) => setLengthFilter(val)}
                yearFilter={yearFilter}
                setYearFilter={(val) => setYearFilter(val)}
                turkishOnly={turkishOnly}
                setTurkishOnly={setTurkishOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {recommendError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold">{t("error") || "Error"}</p>
            <p className="text-sm mt-1">{recommendError}</p>
          </div>
        )}
        {(recommendations.length > 0 || loading) && (
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-theme-100 pb-8">
              <div>
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h3 className="text-3xl font-extrabold text-theme-950">
                    {t("yourCustomCompassReading")}
                  </h3>
                  <ViewToggle
                    viewMode={viewMode}
                    onViewChange={handleViewChange}
                  />
                </div>
                <p className="text-theme-900/60 font-medium italic">
                  {subtitleText}
                </p>
              </div>

              {recommendations.length > 0 && (
                <div className="flex flex-col items-start gap-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <button
                      onClick={() => findMatches(true)}
                      disabled={refreshing || refreshCount >= refreshLimit}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${
                        refreshCount >= refreshLimit
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-white border-theme-200 text-theme-600 hover:bg-theme-50 hover:border-theme-300 shadow-sm"
                      }`}
                    >
                      {refreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {t("refreshRecommendations")}
                      {refreshing && (
                        <span className="text-xs font-normal opacity-60">
                          {String(language) === "tr"
                            ? "Yükleniyor..."
                            : "Finding new matches..."}
                        </span>
                      )}
                      <span className="text-[10px] bg-theme-100 px-2 py-0.5 rounded-full ml-1">
                        {refreshCount}/{refreshLimit}
                      </span>
                    </button>

                    {seenTitles.length > 0 && !sessionShowingHidden && (
                      <button
                        onClick={() => setSessionShowingHidden(true)}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all border text-xs sm:text-sm bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        <span>
                          {seenTitles.length} {t("hiddenCount")}
                        </span>
                      </button>
                    )}
                  </div>
                  {refreshCount >= refreshLimit && (
                    <p className="text-[10px] font-bold text-red-400 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                      {t("explorationLimit")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-theme-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-theme-600 rounded-full border-t-transparent animate-spin absolute top-0"></div>
                </div>
                <p className="text-theme-900/40 font-bold animate-pulse">
                  {String(language) === "tr"
                    ? "Önerin hesaplanıyor..."
                    : "Calculating your trajectory..."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {recommendations.map((rec, idx) => {
                  const isSeenInDB =
                    seenTitles.includes(rec.title) && !sessionShowingHidden;
                  return (
                    <RecommendationCard
                      key={idx}
                      recommendation={rec}
                      isSeenInDB={isSeenInDB}
                      onMarkAsSeen={(title) => {
                        setSeenTitles((prev) =>
                          prev.includes(title) ? prev : [...prev, title],
                        );
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <RecommendationTable
                recommendations={recommendations}
                seenTitles={seenTitles}
                onMarkAsSeen={(title) =>
                  setSeenTitles((prev) => [...prev, title])
                }
                sessionShowingHidden={sessionShowingHidden}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
