import { Playfair_Display, Cormorant_Garamond, DM_Sans } from "next/font/google";
import styles from "./odilon.module.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "odilon — Multi-Genre Turnstile Machine",
  description:
    "odilon reads what you love and finds its counterpart across formats. Books, films, music, games, podcasts and more.",
};

export default function OdilonLanding() {
  return (
    <div
      className={`${playfair.variable} ${cormorant.variable} ${dmSans.variable} ${styles.page}`}
    >
      {/* NAV */}
      <nav className={styles.nav}>
        <a href="#" className={styles.navLogo}>
          <span className={styles.navLogoName}>odilon</span>
          <span className={styles.navLogoTag}>Multi-Genre Turnstile Machine</span>
        </a>
        <div className={styles.navCenter}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="18" cy="18" r="16.5" stroke="#7A3B2E" strokeWidth="1" />
            <circle cx="18" cy="18" r="3.5" stroke="#7A3B2E" strokeWidth="0.75" fill="none" />
            <polygon points="18,4 20,18 18,22 16,18" fill="#7A3B2E" opacity="0.85" />
            <polygon points="18,32 16,18 18,14 20,18" fill="#7A3B2E" opacity="0.35" />
            <polygon points="4,18 18,16 22,18 18,20" fill="#7A3B2E" opacity="0.35" />
            <polygon points="32,18 18,20 14,18 18,16" fill="#7A3B2E" opacity="0.85" />
          </svg>
        </div>
        <div className={styles.navActions}>
          <a href="#how-it-works" className={styles.btnGhost}>
            how it works
          </a>
          <a href="#try" className={styles.btnPrimary}>
            try odilon
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.heroEyebrow}>cross-format discovery</span>
          <h1 className={styles.heroHeadline}>
            Your favourite book
            <br />
            has a <em>twin</em>
            <br />
            in another world.
          </h1>
          <p className={styles.heroSub}>
            odilon reads what you love — a book, a film, a painting — and finds its counterpart
            across formats. What if Dorian Gray were a melody? What if your favourite series were a
            podcast?
          </p>
          <div className={styles.heroCta}>
            <a href="#try" className={styles.btnPrimaryLg}>
              try odilon
            </a>
            <a href="#how-it-works" className={styles.heroCataLink}>
              see how it works
            </a>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroPaintingWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/redon-closed-eyes.jpg"
              alt="Odilon Redon painting"
              className={styles.heroPaintingImg}
            />
          </div>
          <div className={styles.heroBigType}>odilon</div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* HOW IT WORKS */}
      <section className={styles.howSection} id="how-it-works">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>how it works</span>
          <h2 className={styles.sectionTitle}>
            Tell odilon what you love. It finds where that feeling lives in another format.
          </h2>
        </div>
        <div className={styles.exampleGrid}>

          {/* Card 1 */}
          <div className={styles.exampleCard}>
            <p className={styles.exampleHook}>
              Your favourite book may have a little sister — but in melodies.
            </p>
            <div className={styles.exampleFlow}>
              <div className={styles.exampleSource}>
                <svg
                  viewBox="0 0 52 68"
                  style={{ width: "52px", height: "68px", flexShrink: 0, borderRadius: "1px", border: "0.5px solid rgba(122,59,46,0.18)" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="52" height="68" fill="#3A2A1A" />
                  <rect x="4" y="4" width="44" height="60" fill="#2C1E12" />
                  <text x="26" y="22" textAnchor="middle" fontFamily="serif" fontSize="7" fill="#C4956A" fontStyle="italic">THE PICTURE OF</text>
                  <text x="26" y="34" textAnchor="middle" fontFamily="serif" fontSize="9" fill="#E8CFA0" fontWeight="bold">DORIAN</text>
                  <text x="26" y="45" textAnchor="middle" fontFamily="serif" fontSize="9" fill="#E8CFA0" fontWeight="bold">GRAY</text>
                  <text x="26" y="58" textAnchor="middle" fontFamily="serif" fontSize="6" fill="#A07850">Oscar Wilde</text>
                </svg>
                <div className={styles.exampleMeta}>
                  <span className={styles.exampleFormatTag}>book</span>
                  <span className={styles.exampleItemTitle}>The Picture of Dorian Gray</span>
                  <span className={styles.exampleArtist}>Oscar Wilde</span>
                </div>
              </div>
              <div className={styles.exampleArrow}>
                <div className={styles.arrowLine} />
                <span className={styles.arrowReason}>mood &amp; tone</span>
                <div className={styles.arrowLine} />
              </div>
              <div className={styles.exampleResult}>
                <svg
                  viewBox="0 0 52 52"
                  style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "1px", border: "0.5px solid rgba(122,59,46,0.18)" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="52" height="52" fill="#1A1A2E" />
                  <circle cx="26" cy="26" r="18" fill="#16213E" stroke="#534AB7" strokeWidth="0.5" />
                  <circle cx="26" cy="26" r="4" fill="#534AB7" opacity="0.7" />
                  <circle cx="26" cy="26" r="1.5" fill="#E8CFA0" />
                </svg>
                <div className={styles.exampleMeta}>
                  <span className={styles.exampleFormatTag}>music</span>
                  <span className={styles.exampleItemTitle}>The Curse</span>
                  <span className={styles.exampleArtist}>Agnes Obel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.exampleCard}>
            <p className={styles.exampleHook}>
              What if your favourite painting had a world you could play?
            </p>
            <div className={styles.exampleFlow}>
              <div className={styles.exampleSource}>
                <svg
                  viewBox="0 0 60 60"
                  style={{ width: "60px", height: "60px", flexShrink: 0, borderRadius: "1px", border: "0.5px solid rgba(122,59,46,0.18)" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="60" height="60" fill="#2A1A3E" />
                  <ellipse cx="30" cy="25" rx="14" ry="16" fill="#5A3A7A" opacity="0.6" />
                  <ellipse cx="22" cy="38" rx="10" ry="7" fill="#8A5AB0" opacity="0.4" />
                  <circle cx="30" cy="22" r="8" fill="#C090E0" opacity="0.35" />
                  <path d="M10 50 Q30 35 50 50" fill="#3A2050" opacity="0.5" />
                </svg>
                <div className={styles.exampleMeta}>
                  <span className={styles.exampleFormatTag}>painting</span>
                  <span className={styles.exampleItemTitle}>Symbolist figure, halo</span>
                  <span className={styles.exampleArtist}>Odilon Redon, c. 1890s</span>
                </div>
              </div>
              <div className={styles.exampleArrow}>
                <div className={styles.arrowLine} />
                <span className={styles.arrowReason}>visual style</span>
                <div className={styles.arrowLine} />
              </div>
              <div className={styles.exampleResult}>
                <svg
                  viewBox="0 0 60 60"
                  style={{ width: "60px", height: "60px", flexShrink: 0, borderRadius: "1px", border: "0.5px solid rgba(122,59,46,0.18)" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="60" height="60" fill="#1A2A3A" />
                  <rect x="5" y="5" width="50" height="50" fill="#243040" rx="2" />
                  <text x="30" y="28" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill="#8ABCD0" fontWeight="bold">SACRAMENTO</text>
                  <text x="30" y="40" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fill="#5A8AA0">Video Game</text>
                </svg>
                <div className={styles.exampleMeta}>
                  <span className={styles.exampleFormatTag}>game</span>
                  <span className={styles.exampleItemTitle}>Sacramento</span>
                  <span className={styles.exampleArtist}>surreal, nostalgic</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.exampleCard}>
            <p className={styles.exampleHook}>
              What if your favourite film expanded into a whole universe?
            </p>
            <div className={styles.exampleFlow}>
              <div className={styles.exampleSource}>
                <svg
                  viewBox="0 0 52 68"
                  style={{ width: "52px", height: "68px", flexShrink: 0, borderRadius: "1px", border: "0.5px solid rgba(122,59,46,0.18)" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="52" height="68" fill="#0A1520" />
                  <rect x="2" y="2" width="48" height="64" fill="#0F1E30" />
                  <text x="26" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fill="#4A90C8" fontWeight="bold">GHOST</text>
                  <text x="26" y="34" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#C0D8E8">IN THE SHELL</text>
                  <text x="26" y="52" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#3A6090">1995 · film</text>
                </svg>
                <div className={styles.exampleMeta}>
                  <span className={styles.exampleFormatTag}>film</span>
                  <span className={styles.exampleItemTitle}>Ghost in the Shell</span>
                  <span className={styles.exampleArtist}>Mamoru Oshii, 1995</span>
                </div>
              </div>
              <div className={styles.exampleArrow}>
                <div className={styles.arrowLine} />
                <span className={styles.arrowReason}>theme &amp; universe</span>
                <div className={styles.arrowLine} />
              </div>
              <div className={styles.exampleResult}>
                <svg
                  viewBox="0 0 60 60"
                  style={{ width: "60px", height: "60px", flexShrink: 0, borderRadius: "1px", border: "0.5px solid rgba(122,59,46,0.18)" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="60" height="60" fill="#0A0F1A" />
                  <circle cx="30" cy="25" r="14" fill="#1A2535" stroke="#2A4060" strokeWidth="0.5" />
                  <text x="30" y="23" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#5A8AA0">STAND ALONE</text>
                  <text x="30" y="31" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#5A8AA0">COMPLEX</text>
                  <text x="30" y="52" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#3A5A70">series · 2002</text>
                </svg>
                <div className={styles.exampleMeta}>
                  <span className={styles.exampleFormatTag}>series</span>
                  <span className={styles.exampleItemTitle}>Ghost in the Shell: SAC</span>
                  <span className={styles.exampleArtist}>deeper cyberpunk universe</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* FORMATS */}
      <section className={styles.formatsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>formats</span>
          <h2 className={styles.sectionTitle}>Eleven worlds. Every combination possible.</h2>
        </div>
        <div className={styles.formatsGrid}>
          <div className={styles.formatPill}><span className={styles.formatIcon}>📚</span><span className={styles.formatName}>Books</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>🎬</span><span className={styles.formatName}>Film</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>📺</span><span className={styles.formatName}>Series</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>🎙</span><span className={styles.formatName}>Podcast</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>🎵</span><span className={styles.formatName}>Music</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>🎮</span><span className={styles.formatName}>Games</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>✦</span><span className={styles.formatName}>Creative</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>📰</span><span className={styles.formatName}>Articles</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>▶</span><span className={styles.formatName}>Youtube</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>🎨</span><span className={styles.formatName}>Painting</span></div>
          <div className={styles.formatPill}><span className={styles.formatIcon}>✦</span><span className={styles.formatName}>Other</span></div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* QUOTE */}
      <section className={styles.quoteSection}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/redon-portrait.jpg"
            alt="Portrait of Odilon Redon"
            className={styles.redonPortraitImg}
          />
          <p className={styles.redonCaption}>Odilon Redon · 1840–1916 · Symbolist painter</p>
        </div>
        <div>
          <blockquote className={styles.quoteText}>
            My drawings inspire, and are not to be defined. They place us, as does music, in the
            ambiguous realm of the undetermined.
          </blockquote>
          <p className={styles.quoteAttribution}>
            <strong>Odilon Redon</strong> — To Myself: Notes on Life, Art and Artists
          </p>
          <div className={styles.quoteConnection}>
            odilon is named after him. Like his art, it refuses to be confined to a single genre —
            it moves between worlds, the way music moves between feelings.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection} id="try">
        <p className={styles.ctaEyebrow}>ready when you are</p>
        <h2 className={styles.ctaHeadline}>
          What does your <em>favourite book</em> sound like?
        </h2>
        <a href="#" className={styles.btnPrimaryInv}>
          try odilon — it&apos;s free
        </a>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>odilon</span>
        <span className={styles.footerCopy}>Multi-Genre Turnstile Machine · 2026</span>
      </footer>
    </div>
  );
}
