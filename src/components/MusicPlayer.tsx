/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio("/agnesobel.mp3");
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = ratio * duration;
    },
    [duration]
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 33;
  const timeLabel =
    duration > 0
      ? `${formatTime(currentTime)} / ${formatTime(duration)}`
      : "0:42 / 5:53";

  return (
    <div className="bg-surface-container-low p-6 rounded-xl shadow-sm backdrop-blur-sm border border-outline-variant/10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary/20">
          <img
            alt="Agnes Obel"
            className="w-full h-full object-cover"
            src="/agnes-obel-aventine.jpg"
          />
        </div>
        <div>
          <p className="font-label text-[11px] uppercase tracking-widest text-secondary/60">MUSIC</p>
          <p className="font-headline italic text-[15px] text-primary">The Curse</p>
          <p className="font-label text-[12px] text-secondary">Agnes Obel</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:scale-110 transition-transform"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
        <div
          className="flex-1 h-1 bg-outline-variant/30 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 353}
        >
          <div
            className="h-full bg-secondary"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-label text-on-surface-variant">{timeLabel}</span>
      </div>
    </div>
  );
}
