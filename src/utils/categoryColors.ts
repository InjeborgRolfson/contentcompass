import React from "react";

export const categoryColors: Record<string, string> = {
  book: "#A67C5B",
  movie: "#C0756B",
  "tv show": "#9B7BB8",
  podcast: "#C8845A",
  music: "#6A9AB0",
  game: "#6FA882",
  creator: "#C4A84F",
  article: "#7D8FA3",
  youtube: "#C97A72",
  painting: "#8FA65A",
  tablo: "#8FA65A",
  other: "#9EA8A8",
};

export const getTypeColor = (type?: string): string => {
  if (!type) return categoryColors.other;
  const t = type.toLowerCase();
  return categoryColors[t] || categoryColors.other;
};

export const getTypeBadgeStyle = (type?: string): React.CSSProperties => {
  const color = getTypeColor(type);
  // Using hex with alpha channel: 1A = 10%, 40 = 25%
  return {
    backgroundColor: `${color}1A`,
    color: color,
    borderColor: `${color}40`,
  };
};
