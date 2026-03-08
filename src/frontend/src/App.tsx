import { Toaster } from "@/components/ui/sonner";
import { Check, Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Category, type Fact } from "./backend.d";
import { useActor } from "./hooks/useActor";

// ── Category config ──────────────────────────────────────────────────────────
type CategoryKey = "all" | "science" | "history" | "nature" | "mind";

interface CategoryConfig {
  label: string;
  value: Category | null;
  pillClass: string;
  badgeStyle: React.CSSProperties;
  badgeText: string;
  emoji: string;
}

const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  all: {
    label: "All",
    value: null,
    pillClass: "cat-pill-all",
    badgeStyle: {
      color: "oklch(0.85 0.02 265)",
      background: "oklch(0.25 0.03 265 / 0.6)",
      borderColor: "oklch(0.4 0.03 265)",
    },
    badgeText: "All Facts",
    emoji: "🌐",
  },
  science: {
    label: "Science",
    value: Category.Science,
    pillClass: "cat-pill-science",
    badgeStyle: {
      color: "oklch(0.82 0.18 240)",
      background: "oklch(0.18 0.06 240 / 0.5)",
      borderColor: "oklch(0.55 0.15 240)",
    },
    badgeText: "Science",
    emoji: "🔬",
  },
  history: {
    label: "History",
    value: Category.History,
    pillClass: "cat-pill-history",
    badgeStyle: {
      color: "oklch(0.85 0.14 55)",
      background: "oklch(0.18 0.06 55 / 0.5)",
      borderColor: "oklch(0.55 0.14 55)",
    },
    badgeText: "History",
    emoji: "📜",
  },
  nature: {
    label: "Nature",
    value: Category.Nature,
    pillClass: "cat-pill-nature",
    badgeStyle: {
      color: "oklch(0.82 0.2 145)",
      background: "oklch(0.18 0.07 145 / 0.5)",
      borderColor: "oklch(0.55 0.18 145)",
    },
    badgeText: "Nature",
    emoji: "🌿",
  },
  mind: {
    label: "Mind-Blowing",
    value: Category.MindBlowing,
    pillClass: "cat-pill-mind",
    badgeStyle: {
      color: "oklch(0.82 0.2 310)",
      background: "oklch(0.18 0.07 310 / 0.5)",
      borderColor: "oklch(0.55 0.18 310)",
    },
    badgeText: "Mind-Blowing",
    emoji: "🤯",
  },
};

// ── Fallback facts (while actor loads) ───────────────────────────────────────
const FALLBACK_FACTS: Omit<Fact, "id">[] = [
  {
    text: "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
    category: Category.Nature,
  },
  {
    text: "A day on Venus is longer than a year on Venus — it takes 243 Earth days to rotate but only 225 Earth days to orbit the Sun.",
    category: Category.Science,
  },
  {
    text: "The Great Wall of China is not visible from space with the naked eye — that's a myth.",
    category: Category.History,
  },
  {
    text: "Your brain generates about 12–25 watts of electricity — enough to power a low-wattage LED bulb.",
    category: Category.MindBlowing,
  },
  {
    text: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
    category: Category.History,
  },
];

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { actor } = useActor();
  const [selectedCat, setSelectedCat] = useState<CategoryKey>("all");
  const [fact, setFact] = useState<Fact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [factKey, setFactKey] = useState(0); // force re-mount for animation
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const catConfig = CATEGORIES[selectedCat];

  const fetchRandomFact = useCallback(async () => {
    setIsLoading(true);
    try {
      if (actor) {
        const result = await actor.getRandomFact(catConfig.value);
        setFact(result);
      } else {
        // Fallback to local facts
        const filtered = catConfig.value
          ? FALLBACK_FACTS.filter((f) => f.category === catConfig.value)
          : FALLBACK_FACTS;
        const pool = filtered.length > 0 ? filtered : FALLBACK_FACTS;
        const random = pool[Math.floor(Math.random() * pool.length)];
        setFact({ ...random, id: BigInt(Math.floor(Math.random() * 1000)) });
      }
      setFactKey((k) => k + 1);
    } catch (_err) {
      // Fallback on error
      const filtered = catConfig.value
        ? FALLBACK_FACTS.filter((f) => f.category === catConfig.value)
        : FALLBACK_FACTS;
      const pool = filtered.length > 0 ? filtered : FALLBACK_FACTS;
      const random = pool[Math.floor(Math.random() * pool.length)];
      setFact({ ...random, id: BigInt(Math.floor(Math.random() * 1000)) });
      setFactKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }, [actor, catConfig.value]);

  const handleCategoryChange = (key: CategoryKey) => {
    if (key === selectedCat) return;
    setSelectedCat(key);
    setFact(null); // reset to initial CTA state
  };

  const handleCopy = useCallback(async () => {
    if (!fact) return;
    const catEmoji =
      Object.values(CATEGORIES).find((c) => c.value === fact.category)?.emoji ??
      "✨";
    const text = `${catEmoji} ${fact.text}\n\n— Get Amazed`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Copied to clipboard!", {
        description: "Share the amazement 🚀",
        duration: 2000,
      });
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try manually selecting the text.");
    }
  }, [fact]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="noise-bg min-h-screen flex flex-col relative overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-background"
        style={{
          backgroundImage: "url(/assets/generated/amazed-bg.dim_1920x1080.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Overlay for depth */}
      <div className="fixed inset-0 z-0 bg-background/60" />

      {/* Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.03 265)",
            border: "1px solid oklch(0.35 0.04 265)",
            color: "oklch(0.95 0.01 90)",
          },
        }}
      />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        data-ocid="header.section"
        className="relative z-10 pt-8 pb-4 px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="font-display font-extrabold text-5xl md:text-7xl tracking-tight text-glow-lime"
            style={{ color: "oklch(0.88 0.26 130)" }}
          >
            Get Amazed
          </h1>
          <p
            className="mt-2 text-base md:text-lg font-medium tracking-widest uppercase"
            style={{ color: "oklch(0.6 0.03 265)", letterSpacing: "0.25em" }}
          >
            facts that'll blow your mind
          </p>
        </motion.div>
      </header>

      {/* ── CATEGORY FILTER ─────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex justify-center px-4 py-4">
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {(Object.entries(CATEGORIES) as [CategoryKey, CategoryConfig][]).map(
            ([key, cfg], idx) => (
              <button
                key={key}
                type="button"
                data-ocid={`category.tab.${idx + 1}`}
                data-active={selectedCat === key ? "true" : "false"}
                onClick={() => handleCategoryChange(key)}
                className={`${cfg.pillClass} px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer`}
                style={
                  selectedCat === key
                    ? {}
                    : {
                        background: "oklch(0.18 0.02 265 / 0.5)",
                        borderColor: "oklch(0.32 0.03 265)",
                        color: "oklch(0.5 0.02 265)",
                      }
                }
                aria-pressed={selectedCat === key}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ),
          )}
        </motion.div>
      </nav>

      {/* ── MAIN ──────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {!fact ? (
            /* ── Initial CTA ── */
            <motion.div
              key="cta"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 text-center"
            >
              {/* Decorative ring */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-40"
                  style={{
                    background: "oklch(0.88 0.26 130 / 0.3)",
                    transform: "scale(1.5)",
                  }}
                />
                <motion.button
                  data-ocid="fact.primary_button"
                  onClick={fetchRandomFact}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  animate={
                    isLoading
                      ? {}
                      : {
                          boxShadow: [
                            "0 0 20px oklch(0.88 0.26 130 / 0.3)",
                            "0 0 50px oklch(0.88 0.26 130 / 0.6)",
                            "0 0 20px oklch(0.88 0.26 130 / 0.3)",
                          ],
                        }
                  }
                  transition={
                    isLoading
                      ? {}
                      : {
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }
                  }
                  className="relative z-10 glow-lime font-display font-black text-2xl md:text-3xl px-10 py-5 rounded-2xl border-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                  style={{
                    background: "oklch(0.88 0.26 130)",
                    borderColor: "oklch(0.92 0.25 130)",
                    color: "oklch(0.1 0.015 265)",
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Loading…
                    </span>
                  ) : (
                    "Get Amazed ✨"
                  )}
                </motion.button>
              </div>

              <p
                className="text-sm font-medium max-w-xs"
                style={{ color: "oklch(0.45 0.02 265)" }}
              >
                Tap to reveal a{" "}
                {selectedCat !== "all" ? (
                  <span style={{ color: catConfig.badgeStyle.color }}>
                    {catConfig.emoji} {catConfig.label}
                  </span>
                ) : (
                  "surprising"
                )}{" "}
                fact that'll amaze you
              </p>
            </motion.div>
          ) : (
            /* ── Fact Card ── */
            <motion.div
              key={`fact-${factKey}`}
              data-ocid="fact.card"
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card w-full max-w-2xl rounded-3xl p-6 md:p-10 flex flex-col gap-6"
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                  style={{
                    ...Object.values(CATEGORIES).find(
                      (c) => c.value === fact.category,
                    )?.badgeStyle,
                  }}
                >
                  {
                    Object.values(CATEGORIES).find(
                      (c) => c.value === fact.category,
                    )?.emoji
                  }{" "}
                  {
                    Object.values(CATEGORIES).find(
                      (c) => c.value === fact.category,
                    )?.badgeText
                  }
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.38 0.02 265)" }}
                >
                  #{fact.id.toString()}
                </span>
              </div>

              {/* Fact Text */}
              <blockquote
                className="font-display font-semibold text-xl md:text-2xl leading-relaxed"
                style={{ color: "oklch(0.95 0.015 90)" }}
              >
                <span
                  style={{
                    color: "oklch(0.88 0.26 130)",
                    fontSize: "2rem",
                    lineHeight: 0,
                    verticalAlign: "middle",
                    marginRight: "6px",
                  }}
                >
                  "
                </span>
                {fact.text}
                <span
                  style={{
                    color: "oklch(0.88 0.26 130)",
                    fontSize: "2rem",
                    lineHeight: 0,
                    verticalAlign: "middle",
                    marginLeft: "4px",
                  }}
                >
                  "
                </span>
              </blockquote>

              {/* Action Row */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  data-ocid="fact.secondary_button"
                  onClick={fetchRandomFact}
                  disabled={isLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center justify-center gap-2 font-display font-bold text-base px-6 py-3 rounded-xl border-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: "oklch(0.88 0.26 130)",
                    borderColor: "oklch(0.92 0.25 130)",
                    color: "oklch(0.1 0.015 265)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Amaze Me Again ✨
                    </>
                  )}
                </motion.button>

                <motion.button
                  data-ocid="fact.share_button"
                  onClick={handleCopy}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border cursor-pointer transition-all duration-200 sm:flex-none"
                  style={
                    isCopied
                      ? {
                          background: "oklch(0.2 0.08 145 / 0.5)",
                          borderColor: "oklch(0.55 0.18 145)",
                          color: "oklch(0.82 0.2 145)",
                        }
                      : {
                          background: "oklch(0.2 0.025 265 / 0.6)",
                          borderColor: "oklch(0.35 0.04 265)",
                          color: "oklch(0.65 0.03 265)",
                        }
                  }
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied! ✓
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Share
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state indicator (backdrop) */}
        {isLoading && fact && (
          <div
            data-ocid="fact.loading_state"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="w-2 h-2 rounded-full animate-ping"
              style={{ background: "oklch(0.88 0.26 130)" }}
            />
          </div>
        )}
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        data-ocid="footer.section"
        className="relative z-10 py-6 px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-px w-12 rounded-full opacity-30"
              style={{ background: "oklch(0.88 0.26 130)" }}
            />
            <Sparkles
              className="w-3.5 h-3.5 opacity-50"
              style={{ color: "oklch(0.88 0.26 130)" }}
            />
            <div
              className="h-px w-12 rounded-full opacity-30"
              style={{ background: "oklch(0.88 0.26 130)" }}
            />
          </div>
          <p
            className="text-sm font-medium tracking-wide"
            style={{ color: "oklch(0.45 0.02 265)" }}
          >
            Discover something amazing every day.
          </p>
          <p className="text-xs" style={{ color: "oklch(0.35 0.02 265)" }}>
            © {currentYear}. Built with{" "}
            <span style={{ color: "oklch(0.75 0.18 30)" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: "oklch(0.55 0.03 265)" }}
            >
              caffeine.ai
            </a>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
