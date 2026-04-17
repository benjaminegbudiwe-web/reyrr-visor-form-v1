'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_FALLBACK =
  'https://cdn.shopify.com/s/files/1/0019/0319/8317/files/Stefan_VIZU.jpg?v=1758272978';

const LINE_BLURB: Record<string, { headline: string; sub: string }> = {
  VIZU: {
    headline: 'VIZU',
    sub: 'Flagship optics. Fit-specific for Riddell SpeedFlex and Schutt F7.',
  },
  VISION: {
    headline: 'VISION',
    sub: 'Universal fit. Crystal-clear clarity. The everyday workhorse.',
  },
  REVO: {
    headline: 'REVO',
    sub: 'Revo™ contrast-boosting optics. Panoramic peripheral vision.',
  },
};

export type HeroState = {
  step: string;
  selectedLine: string | null;
  selectedVisor: { name: string; image: string; note: string } | null;
};

export default function Hero({ state }: { state: HeroState }) {
  const showVisor = !!state.selectedVisor;

  let eyebrow = 'Player equipment request';
  let headline = 'Rise above the ordinary';
  let sub = 'Pick your Reyrr visor. Drop your name. We’ll take it from there.';

  if (showVisor && state.selectedVisor) {
    eyebrow = `${state.selectedLine} · ${state.selectedVisor.note}`;
    headline = state.selectedVisor.name;
    sub = 'Lock it in below.';
  } else if (state.selectedLine && LINE_BLURB[state.selectedLine]) {
    eyebrow = 'Selected line';
    headline = LINE_BLURB[state.selectedLine].headline;
    sub = LINE_BLURB[state.selectedLine].sub;
  }

  return (
    <section className={`hero ${showVisor ? 'hero--product' : 'hero--athlete'}`}>
      {/* Background: athlete photo (line steps) OR soft gradient (visor steps) */}
      {!showVisor && (
        <AnimatePresence mode="sync">
          <motion.div
            key="athlete"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_FALLBACK}
              alt="Reyrr athlete"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center 28%' }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="hero__overlay" />
      <div className="hero__spotlight" aria-hidden="true" />

      <div className="hero__content">
        {/* Top bar: brand lockup */}
        <div className="hero__topbar">
          <div className="flex items-center gap-3">
            <span className="brand-mark" aria-hidden="true">
              R
            </span>
            <div>
              <div className="font-display text-sm tracking-[0.18em] uppercase">
                Reyrr Athletics
              </div>
              <div className="text-[11px] text-white/45 tracking-[0.22em] uppercase">
                Visor request
              </div>
            </div>
          </div>
        </div>

        {/* Compositional body: copy left, visor on right when picked */}
        <div className="hero__body">
          <div className="hero__copy">
            <motion.p
              key={`eyebrow-${eyebrow}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="eyebrow mb-3"
            >
              {eyebrow}
            </motion.p>
            <motion.h1
              key={`headline-${headline}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="hero__headline"
            >
              {headline}
            </motion.h1>
            <motion.p
              key={`sub-${sub}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="hero__sub"
            >
              {sub}
            </motion.p>
          </div>

          {/* Right side: floating visor when picked (desktop only) */}
          <AnimatePresence mode="wait">
            {showVisor && state.selectedVisor && (
              <motion.div
                key={state.selectedVisor.image}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                className="hero__product"
              >
                <div className="hero__product-glow" aria-hidden="true" />
                <Image
                  src={state.selectedVisor.image}
                  alt={state.selectedVisor.name}
                  fill
                  priority
                  sizes="(max-width: 900px) 80vw, 600px"
                  style={{ objectFit: 'contain' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
