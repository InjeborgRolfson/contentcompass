"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, Bookmark, Trash2, Eye } from "lucide-react";
import { ContentType } from "@/types/content";
import RecommendationCard from "@/components/RecommendationCard";
import ViewToggle from "@/components/ViewToggle";
import RecommendationTable from "@/components/RecommendationTable";
import Pagination from "@/components/Pagination";
import Toast from "@/components/ui/Toast";
import { normalizeContentType } from "@/utils/content-type";

type TabType = "saved" | "seen";

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
  "Painting",
  "Other",
];

interface SeenItem {
  _id: string;
  title: string;
  type: string;
  seenAt: string;
}

const getTypeBadgeStyle = (type: string): React.CSSProperties => {
  const styles: Record<string, React.CSSProperties> = {
    book: {
      backgroundColor: "#EAF3DE",
      color: "#3B6D11",
      borderColor: "#C0DD97",
    },
    movie: {
      backgroundColor: "#E6F1FB",
      color: "#185FA5",
      borderColor: "#B5D4F4",
    },
    "tv show": {
      backgroundColor: "#EEEDFE",
      color: "#534AB7",
      borderColor: "#CECBF6",
    },
    game: {
      backgroundColor: "#FAEEDA",
      color: "#854F0B",
      borderColor: "#FAC775",
    },
    music: {
      backgroundColor: "#FBEAF0",
      color: "#993556",
      borderColor: "#F4C0D1",
    },
    podcast: {
      backgroundColor: "#FAECE7",
      color: "#993C1D",
      borderColor: "#F5C4B3",
    },
    article: {
      backgroundColor: "#E1F5EE",
      color: "#0F6E56",
      borderColor: "#9FE1CB",
    },
    youtube: {
      backgroundColor: "#FCEBEB",
      color: "#A32D2D",
      borderColor: "#F7C1C1",
    },
    creator: {
      backgroundColor: "#F5F3FF",
      color: "#5B21B6",
      borderColor: "#DDD6FE",
    },
    painting: {
      backgroundColor: "#FEF9C3",
      color: "#854D0E",
      borderColor: "#FDE047",
    },
  };
  return (
    styles[type.toLowerCase()] ?? {
      backgroundColor: "#EEF2FF",
      color: "#4338CA",
      borderColor: "#C7D2FE",
    }
  );
};

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<TabType>("saved");
  const [saved, setSaved] = useState<any[]>([]);
  const [seen, setSeen] = useState<SeenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [seenLoading, setSeenLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [toast, setToast] = useState<{
    message: string;
    onUndo?: () => void;
  } | null>(null);
  const [deletingFromSeen, setDeletingFromSeen] = useState<string | null>(null);
  const { t, formatText } = useLanguage();

  useEffect(() => {
    fetchSaved();
    const savedView = localStorage.getItem("viewMode") as "grid" | "list";
    if (savedView) setViewMode(savedView);
  }, []);

  const handleViewChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("viewMode", mode);
  };

  const fetchSaved = async (page = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommendations/save?page=${page}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setSaved(data.data ?? []);
        setTotalCount(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setCurrentPage(data.page ?? 0);
      } else {
        setSaved([]);
      }
    } catch (err) {
      console.error("Failed to fetch saved items:", err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchSaved(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchSeen = async () => {
    setSeenLoading(true);
    try {
      const res = await fetch("/api/seen");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSeen(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch seen items:", err);
      setSeen([]);
    } finally {
      setSeenLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "seen" && seen.length === 0 && !seenLoading) {
      fetchSeen();
    }
  };

  const handleRemove = async (id: string) => {
    const itemToRemove = saved.find((s) => s._id === id);
    if (!itemToRemove) return;

    // Optimistic UI update
    const newSavedPage = saved.filter((s) => s._id !== id);
    setSaved(newSavedPage);
    const newTotal = totalCount - 1;
    setTotalCount(newTotal);
    setTotalPages(Math.ceil(newTotal / 12));

    // If current page is now empty and there's a previous page, go back
    if (newSavedPage.length === 0 && currentPage > 0) {
      fetchSaved(currentPage - 1);
    }

    // Show toast with Undo
    setToast({
      message: t("removedFromSaved"),
      onUndo: async () => {
        try {
          const res = await fetch("/api/recommendations/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemToRemove),
          });
          if (res.ok) {
            await fetchSaved(currentPage);
            setToast(null);
          }
        } catch (err) {
          console.error("Failed to restore item:", err);
        }
      },
    });
  };

  const handleRemoveFromSeen = async (item: SeenItem) => {
    setDeletingFromSeen(item._id);
    try {
      const res = await fetch("/api/seen", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, type: item.type }),
      });
      if (res.ok) {
        setSeen((prev) => prev.filter((s) => s._id !== item._id));
      } else {
        console.error("Failed to remove from seen:", res.status);
      }
    } catch (err) {
      console.error("Failed to remove from seen:", err);
    } finally {
      setDeletingFromSeen(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-theme-900 mb-6">
          {t("saved")}
        </h1>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleTabChange("saved")}
              className={`px-4 py-2 rounded-xl font-bold transition-all border ${
                activeTab === "saved"
                  ? "bg-theme-600 text-white border-theme-600"
                  : "bg-theme-50 text-theme-600 border-theme-100 hover:bg-theme-100"
              }`}
            >
              {t("savedContent")}
            </button>
            <button
              onClick={() => handleTabChange("seen")}
              className={`px-4 py-2 rounded-xl font-bold transition-all border ${
                activeTab === "seen"
                  ? "bg-theme-600 text-white border-theme-600"
                  : "bg-theme-50 text-theme-600 border-theme-100 hover:bg-theme-100"
              }`}
            >
              {t("seenContent")}
            </button>
          </div>
          {activeTab === "saved" && (
            <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
          )}
        </div>

        {/* Subtitle for Saved tab only */}
        {activeTab === "saved" && (
          <p className="text-theme-900/60 font-medium mb-8">
            {t("yourCustomCompassReading")}
          </p>
        )}
      </div>

      {/* Saved Tab Content */}
      {activeTab === "saved" && (
        <>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-theme-600" />
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-theme-100 flex flex-col items-center gap-4">
              <Bookmark className="w-12 h-12 text-theme-100" />
              <p className="text-theme-900/40 text-lg font-bold">
                {t("noneSelected")}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="space-y-12">
              {contentTypes
                .filter((type) =>
                  saved.some(
                    (rec) =>
                      normalizeContentType(rec.type || "Other").toLowerCase() === type.toLowerCase(),
                  ),
                )
                .map((type) => (
                  <div
                    key={type}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-2xl font-black text-theme-950">
                        {t(type.toLowerCase() as any) || type}
                      </h2>
                      <div className="h-1 flex-grow bg-theme-50 rounded-full" />
                      <span className="bg-theme-50 text-theme-600 px-3 py-1 rounded-full text-xs font-bold">
                        {
                          saved.filter(
                            (rec) =>
                              normalizeContentType(rec.type || "Other").toLowerCase() ===
                              type.toLowerCase(),
                          ).length
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {saved
                        .filter(
                          (rec) =>
                            normalizeContentType(rec.type || "Other").toLowerCase() ===
                            type.toLowerCase(),
                        )
                        .map((rec) => (
                          <RecommendationCard
                            key={rec._id}
                            recommendation={rec}
                            isSavedPage={true}
                            onRemove={handleRemove}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              {totalCount > 12 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          ) : (
            <>
              <RecommendationTable
                recommendations={saved}
                isSavedPage={true}
                onRemove={handleRemove}
              />
              {totalCount > 12 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Seen Tab Content */}
      {activeTab === "seen" && (
        <>
          {seenLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-theme-600" />
            </div>
          ) : seen.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-theme-100 flex flex-col items-center gap-4">
              <Eye className="w-12 h-12 text-theme-100" />
              <p className="text-theme-900/40 text-lg font-bold">
                {t("noSeenContent")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seen.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-theme-50 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <span
                      className="px-3 py-1 text-[10px] font-black rounded-full tracking-widest border flex-shrink-0"
                      style={getTypeBadgeStyle(item.type)}
                    >
                      {formatText(
                        t(item.type.toLowerCase() as any) || item.type,
                        "upper",
                      )}
                    </span>
                    <button
                      onClick={() => handleRemoveFromSeen(item)}
                      disabled={deletingFromSeen === item._id}
                      className="p-2 text-theme-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50"
                      title={t("removeFromSeen")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-theme-950 mb-4 line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="text-xs font-medium text-theme-900/50">
                    {new Date(item.seenAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.onUndo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
