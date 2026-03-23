"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Eye,
} from "lucide-react";

interface RecommendationTableProps {
  recommendations: any[];
  isSavedPage?: boolean;
  onRemove?: (id: string) => void;
  seenTitles?: string[];
  onMarkAsSeen?: (title: string) => void;
  sessionShowingHidden?: boolean;
}

const RecommendationTable: React.FC<RecommendationTableProps> = ({
  recommendations,
  isSavedPage = false,
  onRemove,
  seenTitles = [],
  onMarkAsSeen,
  sessionShowingHidden = false,
}) => {
  const { t, formatText } = useLanguage();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [markingAsSeenId, setMarkingAsSeenId] = useState<string | null>(null);
  const [fadedIds, setFadedIds] = useState<Set<string>>(new Set());

  const toggleRow = (idx: number) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  const handleSave = async (rec: any, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSavedPage && onRemove && rec._id) {
      try {
        const res = await fetch("/api/recommendations/save", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: rec._id }),
        });
        if (res.ok) onRemove(rec._id);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const id = rec._id || rec.title;
    if (savedIds.includes(id)) return;

    setSavingId(id);
    try {
      const res = await fetch("/api/recommendations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rec),
      });

      if (res.ok) {
        setSavedIds((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleMarkAsSeen = async (rec: any, e: React.MouseEvent) => {
    e.stopPropagation();

    const id = rec._id || rec.title;
    if (fadedIds.has(id)) return;

    setMarkingAsSeenId(id);
    try {
      const res = await fetch("/api/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: rec.title, type: rec.type }),
      });

      if (res.ok) {
        setFadedIds((prev) => new Set([...prev, id]));
        if (onMarkAsSeen) {
          onMarkAsSeen(rec.title);
        }
      }
    } catch (err) {
      console.error("Error marking as seen:", err);
    } finally {
      setMarkingAsSeenId(null);
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-[2rem] shadow-sm border border-indigo-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-indigo-50 bg-indigo-50/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-6">{t("contentType")}</th>
              <th className="px-8 py-6">{t("title")}</th>
              <th className="px-8 py-6">{t("creator")}</th>
              <th className="px-8 py-6">{t("year")}</th>
              <th className="px-8 py-6 text-center w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {recommendations.map((rec, idx) => {
              const id = rec._id || rec.title;
              const isSaved = isSavedPage || savedIds.includes(id);
              const isSaving = savingId === id;
              const isSeenInDB =
                seenTitles.includes(rec.title) && !sessionShowingHidden;
              const isFaded = fadedIds.has(id) || isSeenInDB;

              return (
                <React.Fragment key={idx}>
                  <tr
                    onClick={() => toggleRow(idx)}
                    className={`cursor-pointer transition-colors group relative ${
                      rec.isWildcard
                        ? "bg-purple-50/20 hover:bg-purple-50/30"
                        : "hover:bg-indigo-50/20"
                    } ${
                      isFaded ? "opacity-40 pointer-events-none" : "opacity-100"
                    } transition-opacity duration-500`}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-full tracking-widest border border-indigo-100">
                        {formatText(
                          t(rec.type.toLowerCase() as any) || rec.type,
                          "upper",
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors block max-w-xs md:max-w-md overflow-hidden text-overflow-ellipsis whitespace-nowrap">
                        {rec.title}
                        {rec.isWildcard && (
                          <span className="text-purple-500 ml-2 text-xs">
                            ✦
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-indigo-900/60 font-medium">
                      {rec.creator}
                    </td>
                    <td className="px-8 py-6 text-sm text-indigo-900/40 font-bold tabular-nums">
                      {rec.year}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center gap-4 justify-center">
                        {!isSavedPage && (
                          <button
                            onClick={(e) => handleMarkAsSeen(rec, e)}
                            disabled={markingAsSeenId === id || isFaded}
                            className={`p-2 rounded-xl transition-all ${
                              isFaded
                                ? "bg-gray-200 text-gray-400 cursor-default"
                                : "bg-indigo-50/50 text-indigo-300 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100"
                            }`}
                            title={t("alreadySeen")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleSave(rec, e)}
                          disabled={isSaving || (isSaved && !isSavedPage)}
                          className={`p-2 rounded-xl transition-all ${
                            isSaved
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                              : "bg-indigo-50/50 text-indigo-200 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100"
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        {isSavedPage && (
                          <button
                            onClick={(e) => handleSave(rec, e)}
                            disabled={isSaving}
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 hover:border-red-500 group/delete"
                            title={t("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {expandedRow === idx ? (
                          <ChevronUp className="w-4 h-4 text-indigo-300 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-indigo-300 shrink-0 group-hover:text-indigo-600" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === idx && (
                    <tr
                      className={
                        rec.isWildcard ? "bg-purple-50/10" : "bg-indigo-50/10"
                      }
                    >
                      <td colSpan={5} className="px-8 py-8">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start gap-4">
                              <Info className="w-4 h-4 text-indigo-300 mt-1 shrink-0" />
                              <p className="text-sm text-indigo-900/70 leading-relaxed font-medium">
                                {rec.description}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {rec.tags?.map((tag: string, tidx: number) => (
                                <span
                                  key={tidx}
                                  className="px-2 py-1 bg-white border border-indigo-50 text-indigo-600/60 text-[9px] font-bold rounded-lg uppercase"
                                >
                                  # {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div
                            className={`md:w-1/3 rounded-3xl p-6 border relative overflow-hidden shrink-0 self-start ${
                              rec.isWildcard
                                ? "bg-purple-50/40 border-purple-100"
                                : "bg-indigo-50/40 border-indigo-100"
                            }`}
                          >
                            <div
                              className={`absolute top-0 right-0 p-4 opacity-10 ${
                                rec.isWildcard
                                  ? "text-purple-600"
                                  : "text-indigo-600"
                              }`}
                            >
                              <Sparkles className="w-8 h-8" />
                            </div>
                            <h4
                              className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${
                                rec.isWildcard
                                  ? "text-purple-600"
                                  : "text-indigo-600"
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              {t("whyWeRecommend")}
                            </h4>
                            <p
                              className={`text-sm leading-relaxed italic font-medium ${
                                rec.isWildcard
                                  ? "text-purple-900/80"
                                  : "text-indigo-900/80"
                              }`}
                            >
                              "{rec.why}"
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecommendationTable;
