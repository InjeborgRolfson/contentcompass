/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Newsreader, Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import MusicPlayer from "@/components/MusicPlayer";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

type Lang = "EN" | "TR";

const translations = {
  EN: {
    nav_how: "How it works",
    nav_try: "Try odilon",
    hero_h1_prefix: "Your favourite book has a\u00a0",
    hero_h1_em: "little sister",
    hero_h1_suffix: "\u00a0— in melodies.",
    hero_sub:
      "odilon reads what you love — a book, a film, a painting — and finds its counterpart across every format.",
    hero_cta: "Step through",
    hero_scroll: "↓ See how it works",
    art_of_discovery: "The Art of Discovery",
    art_body:
      "odilon reads what you love across any format — and finds where that same feeling lives somewhere else entirely.",
    see_how: "SEE HOW IT WORKS",
    card_mini:
      "Tell odilon what you love. It finds where that feeling lives in another format.",
    col1_label: "BOOK → MUSIC",
    col2_label: "PAINTING → GAME",
    col3_label: "MOVIE → ANIME",
    bridge1: "mood\u00a0&\u00a0tone",
    bridge2: "visual style",
    bridge3: "theme\u00a0&\u00a0universe",
    format_header: "ELEVEN FORMATS · EVERY COMBINATION POSSIBLE",
    formats: [
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
    ],
    label_book: "BOOK",
    label_music: "MUSIC",
    label_game: "GAME",
    label_painting: "PAINTING",
    label_movie: "MOVIE",
    label_anime: "ANIME",
    ready: "READY WHEN YOU ARE",
    closing_h2: "What does your favourite book sound like?",
    enter: "Enter odilon",
    footer_saved: "Saved",
    footer_privacy: "Privacy",
    footer_contact: "Contact",
    footer_copy: "© 2026 odilon. Multi-Genre Turnstile Machine.",
    redon_explain:
      "odilon is named after him. Like his art, it refuses to be confined to a single genre — it moves between worlds, the way music moves between feelings.",
  },
  TR: {
    nav_how: "Nasıl çalışır",
    nav_try: "Odilon'u dene",
    hero_h1_prefix: "En sevdiğin kitabın melodilerde gizli bir ",
    hero_h1_em: "kardeşi",
    hero_h1_suffix: "\u00a0var.",
    hero_sub:
      "odilon sevdiklerini tanır — kitap, film, tablo — ve her formatta karşılığını bulur.",
    hero_cta: "Keşfe Çık",
    hero_scroll: "↓ Nasıl çalışır",
    art_of_discovery: "Keşif Sanatı",
    art_body:
      "odilon sevdiklerini tanır — ve o hissin başka bir yerde nasıl yaşadığını bulur.",
    see_how: "NASIL ÇALIŞIR",
    card_mini:
      "odilon'a sevdiklerini söyle. O hissin başka bir formatta nerede yaşadığını bulur.",
    col1_label: "KİTAP → MÜZİK",
    col2_label: "RESİM → OYUN",
    col3_label: "FİLM → ANİME",
    bridge1: "duygu\u00a0&\u00a0ton",
    bridge2: "görsel stil",
    bridge3: "tema\u00a0&\u00a0evren",
    format_header: "ON BİR FORMAT · HER KOMBİNASYON MÜMKÜN",
    formats: [
      "Kitap",
      "Film",
      "Dizi",
      "Podcast",
      "Müzik",
      "Oyun",
      "İçerik Üreticisi",
      "Makale",
      "Youtube",
      "Resim",
      "Diğer",
    ],
    label_book: "KİTAP",
    label_music: "MÜZİK",
    label_game: "OYUN",
    label_painting: "RESİM",
    label_movie: "FİLM",
    label_anime: "ANİME",
    ready: "SEN HAZIR OLDUĞUNDA",
    closing_h2: "En sevdiğin kitabın bir tınısı olsaydı?",
    enter: "odilon'a adım at",
    footer_saved: "Kaydedilenler",
    footer_privacy: "Gizlilik",
    footer_contact: "İletişim",
    footer_copy: "© 2026 odilon. Çok Formatlı Keşif Motoru.",
    redon_explain:
      "odilon onun adını taşır. Sanatı gibi, tek bir türe sığmayı reddeder — müziğin duygular arasında gezindiği gibi, o da dünyalar arasında gezinir.",
  },
} as const;

export default function HomeClient() {
  const { status } = useSession();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("EN");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/favorites");
    }
  }, [status, router]);

  if (status === "loading") return null;

  const t = translations[lang];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <div
        className={`${newsreader.variable} ${plusJakarta.variable} ${dmSans.variable} bg-surface text-on-surface font-body selection:bg-secondary-fixed selection:text-on-secondary-fixed`}
      >
        {/* TopNavBar */}
        <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-6 max-w-none bg-[#fff8f2]/70 backdrop-blur-xl z-50">
          <div
            className="text-2xl italic text-[#490c0f]"
            style={{ fontFamily: "var(--font-gloock), serif" }}
          >
            odilon
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <img src="/pusula-logo.png" alt="Odilon compass" width={36} height={36} />
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <a
              className="hidden md:block text-[#544341] font-label text-sm tracking-wide hover:text-[#9e3e4e] transition-colors duration-300"
              href="#how-it-works"
            >
              {t.nav_how}
            </a>

            {/* Language toggle */}
            <div
              className="hidden md:flex items-center gap-[6px]"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "13px" }}
            >
              <button
                onClick={() => setLang("EN")}
                className="transition-opacity cursor-pointer"
                style={{
                  color: "#490c0f",
                  opacity: lang === "EN" ? 1 : 0.4,
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: lang === "EN" ? 600 : 400,
                }}
              >
                EN
              </button>
              <span
                style={{
                  display: "inline-block",
                  width: "1px",
                  height: "12px",
                  background: "#544341",
                  opacity: 0.25,
                  verticalAlign: "middle",
                }}
              />
              <button
                onClick={() => setLang("TR")}
                className="transition-opacity cursor-pointer"
                style={{
                  color: "#490c0f",
                  opacity: lang === "TR" ? 1 : 0.4,
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: lang === "TR" ? 600 : 400,
                }}
              >
                TR
              </button>
            </div>

            <a
              className="bg-primary-container text-on-primary px-4 md:px-6 py-3 md:py-2 rounded-full font-label text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
              href="/login"
            >
              {t.nav_try}
            </a>
            <div className="hidden md:flex items-center gap-4">
              <span className="material-symbols-outlined text-[#490c0f]">explore</span>
              <span className="material-symbols-outlined text-[#490c0f]">compass_calibration</span>
            </div>
          </div>
        </nav>

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section className="relative min-h-screen bg-[#F5DAA7] overflow-hidden pt-24">
          <div className="max-w-screen-2xl mx-auto px-8 pt-4 pb-32 relative">
            <div className="grid grid-cols-12 gap-8 items-start">

              {/* Left: H1 + subline + CTAs + decorative quote */}
              <div className="col-span-12 lg:col-span-3 pt-12">
                <div className="space-y-8">
                  {/* Primary headline */}
                  <div>
                    <h1
                      className="font-headline font-light text-[#842A3B] leading-tight"
                      style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
                    >
                      {t.hero_h1_prefix}
                      <em className="serif-italic">{t.hero_h1_em}</em>
                      {t.hero_h1_suffix}
                    </h1>
                  </div>
                  {/* CTAs */}
                  <div className="flex flex-col gap-3">
                    <a
                      href="/login"
                      className="inline-flex items-center justify-center bg-primary-container text-surface px-6 py-3 rounded-full font-label text-sm font-semibold hover:opacity-90 transition-all active:scale-95 w-fit"
                    >
                      {t.hero_cta}
                    </a>
                    <a
                      href="#how-it-works"
                      className="text-secondary font-label text-sm hover:text-[#490c0f] transition-colors w-fit"
                    >
                      {t.hero_scroll}
                    </a>
                  </div>
                </div>
              </div>

              {/* Middle: Wordmark + Portrait */}
              <div className="col-span-12 lg:col-span-6 flex flex-col items-center">
                <div className="mb-4">
                  <img src="/pusula-logo.png" alt="Odilon compass" width={60} height={60} />
                </div>
                <h1 className="hidden sm:block text-[5rem] sm:text-[7rem] lg:text-[10rem] xl:text-[14rem] leading-none gloock-wordmark text-[#842A3B] tracking-tighter select-none">
                  odilon
                </h1>
                <div className="relative mt-[-3rem] z-20 group">
                  <div className="absolute -inset-4 bg-surface-container-high rounded-lg rotate-3 transition-transform group-hover:rotate-1 duration-500" />
                  <div className="relative overflow-hidden rounded-lg shadow-2xl w-full lg:max-w-md aspect-[4/5] max-h-[50vh] lg:max-h-none">
                    <img
                      alt="Odilon Redon — closed eyes"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      src="/redon-closed-eyes.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Art of Discovery */}
              <div className="hidden lg:flex col-span-12 lg:col-span-3 pt-32 lg:text-right flex-col items-end gap-16">
                <div className="space-y-6 max-w-xs">
                  <h2 className="text-4xl font-headline italic text-[#842A3B]">
                    {t.art_of_discovery}
                  </h2>
                  <p className="text-on-surface-variant leading-loose">
                    {t.hero_sub}
                  </p>
                </div>
                {/* Decorative quote — stays in original language */}
                <div className="relative opacity-40 text-center w-full max-w-xs mx-auto mt-12">
                  <span
                    className="material-symbols-outlined text-secondary text-5xl opacity-20 absolute -top-8 left-1/2 -translate-x-1/2"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
                  >
                    format_quote
                  </span>
                  <p className="text-xl serif-italic text-[#842A3B] leading-relaxed relative z-10">
                    &ldquo;I have placed there a little door opening on to the mysterious.&rdquo;
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#544341]">
                    — Odilon Redon, To Myself: Notes on Life, Art and Artists
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Shared SVG marker — arrowhead for all whimsical arrows */}
        <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
          <defs>
            <marker id="whimsical-ah" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6" stroke="#9e3e4e" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
        </svg>

        {/* Brand story — Odilon Redon */}
        <section className="bg-[#F5DAA7] w-full py-20 px-6">
          <div className="max-w-[680px] mx-auto flex flex-col items-center text-center">

            {/* Portrait */}
            <div className="flex flex-col items-center gap-3">
              <img
                src="/redon-portrait.jpg"
                alt="Odilon Redon"
                className="w-20 h-20 rounded-full object-cover"
              />
              <p
                className="font-label text-secondary"
                style={{ fontSize: "12px", letterSpacing: "0.08em" }}
              >
                Odilon Redon · 1840–1916
              </p>
            </div>

            {/* Blockquote — stays in original language per instructions */}
            <div className="mt-8 flex flex-col items-center gap-5">
              <div className="w-8 h-[1px] bg-primary/30" />
              <blockquote
                className="font-headline font-light text-primary leading-[1.5] italic"
                style={{ fontSize: "clamp(22px, 3vw, 26px)" }}
              >
                My drawings inspire, and are not to be defined. They place us,
                as does music, in the ambiguous realm of the undetermined.
              </blockquote>
            </div>

            {/* Explanation */}
            <p
              className="mt-4 font-headline font-light text-secondary leading-[1.7]"
              style={{ fontSize: "16px" }}
            >
              {t.redon_explain}
            </p>

          </div>
        </section>

        <main id="how-it-works" className="pt-20 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
          {/* Hero Section / Grid Wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 items-start">

            {/* Column 1: Books to Music */}
            <div className="space-y-12">
              <p className="font-label text-[11px] uppercase tracking-[0.12em] text-secondary opacity-50">{t.col1_label}</p>

              {/* Book Card */}
              <div className="bg-surface-container p-6 rounded-xl relative group hover:rotate-1 transition-transform duration-500">
                <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4">
                  <img
                    alt="The Picture of Dorian Gray"
                    className="w-full h-full object-cover"
                    src="/dorian-gray.jpg"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-label text-[11px] uppercase tracking-widest text-secondary/60">{t.label_book}</p>
                  <p className="font-headline italic text-[15px] text-primary">The Picture of Dorian Gray</p>
                  <p className="font-label text-[12px] text-secondary">Oscar Wilde</p>
                </div>
              </div>

              {/* Bridge: arrow + label */}
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="relative h-16 w-full">
                  <svg className="absolute w-24 h-24 left-1/2 -translate-x-1/2 -top-4">
                    <path className="whimsical-arrow" d="M 48 0 Q 60 40 48 80" markerEnd="url(#whimsical-ah)" />
                  </svg>
                </div>
                <span className="bridge-pill">{t.bridge1}</span>
              </div>

              {/* Music Player Card */}
              <MusicPlayer />
            </div>

            {/* Column 2: Paintings to Games */}
            <div className="space-y-12 md:mt-24">
              <p className="font-label text-[11px] uppercase tracking-[0.12em] text-secondary opacity-50">{t.col2_label}</p>

              {/* Game Card */}
              <div className="bg-surface-container-low p-4 rounded-xl shadow-sm border border-outline-variant/10 -rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img
                    alt="Sacramento, Video Game"
                    className="w-full h-full object-cover"
                    src="/sacramento-game.gif"
                  />
                </div>
                <p className="font-label text-[11px] uppercase tracking-widest text-secondary/60 mb-1">{t.label_game}</p>
                <p className="font-headline italic text-[15px] text-primary">Sacramento, Video Game</p>
              </div>

              {/* Bridge: arrow + label */}
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="relative h-16 w-full">
                  <svg className="absolute w-24 h-24 left-1/2 -translate-x-1/2 -top-4">
                    <path className="whimsical-arrow" d="M 48 0 C 10 30 80 50 48 80" markerEnd="url(#whimsical-ah)" />
                  </svg>
                </div>
                <span className="bridge-pill">{t.bridge2}</span>
              </div>

              {/* Art Card (Odilon Redon) */}
              <div className="bg-surface-container p-6 rounded-xl hover:shadow-xl transition-shadow duration-700">
                <div className="aspect-square overflow-hidden rounded-lg mb-4 grayscale hover:grayscale-0 transition-all duration-1000">
                  <img
                    alt="Odilon inspired artwork"
                    className="w-full h-full object-cover"
                    src="/redon-painting.jpg"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-label text-[11px] uppercase tracking-widest text-secondary/60">{t.label_painting}</p>
                  <p className="font-headline italic text-[15px] text-primary">La Barque</p>
                  <p className="font-label text-[12px] text-secondary">Odilon Redon</p>
                </div>
              </div>
            </div>

            {/* Column 3: Movie to Anime */}
            <div className="space-y-12 md:mt-24">
              <p className="font-label text-[11px] uppercase tracking-[0.12em] text-secondary opacity-50">{t.col3_label}</p>

              {/* Live Action Card */}
              <div className="bg-surface-container-highest rounded-xl shadow-sm rotate-1 hover:rotate-0 transition-all duration-500 p-4">
                <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
                  <img
                    alt="Ghost in the Shell — Live Action"
                    className="w-full h-full object-cover"
                    src="/ghost-in-the-shell.webp"
                  />
                </div>
                <div>
                  <p className="font-label text-[11px] uppercase tracking-widest text-secondary/60 mb-1">{t.label_movie}</p>
                  <p className="font-headline italic text-[15px] text-primary">Ghost in the Shell</p>
                </div>
              </div>

              {/* Bridge: arrow + label */}
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="relative h-16 w-full">
                  <svg className="absolute w-24 h-24 left-1/2 -translate-x-1/2 -top-4">
                    <path className="whimsical-arrow" d="M 48 0 Q 36 40 48 80" markerEnd="url(#whimsical-ah)" />
                  </svg>
                </div>
                <span className="bridge-pill">{t.bridge3}</span>
              </div>

              {/* 1995 Anime Card */}
              <div className="bg-surface-container p-6 rounded-xl hover:shadow-xl transition-shadow duration-700">
                <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4">
                  <img
                    alt="Ghost in the Shell 1995"
                    className="w-full h-full object-cover"
                    src="/ghost-in-the-shell-1995.webp"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-label text-[11px] uppercase tracking-widest text-secondary/60">{t.label_anime}</p>
                  <p className="font-headline italic text-[15px] text-primary">Ghost in the Shell</p>
                </div>
              </div>

            </div>

          </div>

        </main>

        {/* Format Grid */}
        <section className="w-full bg-surface py-16 md:py-20 px-6">
          <p
            className="text-center font-label uppercase text-secondary opacity-50 mb-6"
            style={{ fontSize: "11px", letterSpacing: "0.2em" }}
          >
            {t.format_header}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {t.formats.map((f) => (
              <span
                key={f}
                className="text-secondary text-[13px] rounded-[99px] px-4 py-[6px] border-[0.5px] border-primary-container/20 bg-transparent"
              >
                {f}
              </span>
            ))}
          </div>
        </section>

        {/* Dark closing section */}
        <section className="relative w-full min-h-[60vh] bg-[#3D1A0E] flex items-center justify-center overflow-hidden">
          {/* Watermark wordmark */}
          <span
            className="absolute inset-0 flex items-center justify-center gloock-wordmark pointer-events-none select-none"
            aria-hidden="true"
            style={{ fontSize: "clamp(120px, 15vw, 200px)", color: "#5A2E1A" }}
          >
            odilon
          </span>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 gap-6 max-w-[700px]">
            <h2
              className="font-headline font-light text-surface leading-[1.2] italic"
              style={{ fontSize: "clamp(48px, 6vw, 72px)" }}
            >
              {t.closing_h2}
            </h2>
            <a
              href="/login"
              className="dark-cta-pill font-label text-surface rounded-full px-9 cursor-pointer"
              style={{ fontSize: "15px", padding: "14px 36px" }}
            >
              {t.enter}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#fff2de] border-t border-[#dac1bf]/15 py-12 px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full max-w-[1400px] mx-auto">
            <div
              className="text-lg text-[#490c0f]"
              style={{ fontFamily: "var(--font-gloock), serif" }}
            >
              odilon
            </div>
            <div className="flex gap-8">
              <a
                className="text-sm font-label text-[#544341] hover:underline decoration-[#9e3e4e] underline-offset-4"
                href="#"
              >
                {t.footer_saved}
              </a>
              <a
                className="text-sm font-label text-[#544341] hover:underline decoration-[#9e3e4e] underline-offset-4"
                href="#"
              >
                {t.footer_privacy}
              </a>
              <a
                className="text-sm font-label text-[#544341] hover:underline decoration-[#9e3e4e] underline-offset-4"
                href="#"
              >
                {t.footer_contact}
              </a>
            </div>
            <p className="text-sm font-label text-[#544341] tracking-tight">
              {t.footer_copy}
            </p>
          </div>
        </footer>

        {/* Floating Action — Mobile only */}
        <div className="fixed bottom-8 right-8 md:hidden">
          <button className="w-14 h-14 rounded-full bg-primary shadow-xl text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined">auto_awesome</span>
          </button>
        </div>
      </div>
    </>
  );
}
