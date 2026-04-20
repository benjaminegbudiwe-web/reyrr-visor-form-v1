'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

type Visor = {
  id: string;
  line: string;
  name: string;
  note: string;
  description: string;
  image: string;
};

const LINE_ACCENT: Record<string, string> = {
  VIZU: '#ff4a1c',
  VISION: '#4aa8ff',
  REVO: '#b24aff',
};

function deriveSpecs(v: Visor | null) {
  if (!v) {
    return {
      tint: '—',
      fit: '—',
      family: '—',
      accent: '—',
      tintBar: 0,
    };
  }

  const note = v.note.toLowerCase();
  let tint = v.note.split('·')[0]?.trim() || 'Clear';
  let family = v.line;
  let accent = v.note.split('·').slice(1).join('·').trim() || '—';

  let fit = 'Universal';
  if (v.line === 'VIZU') fit = 'SpeedFlex / F7';
  if (v.line === 'REVO') fit = 'Wraparound';

  let tintBar = 0;
  if (note.includes('0%')) tintBar = 5;
  else if (note.includes('20%')) tintBar = 28;
  else if (note.includes('80%')) tintBar = 82;
  else if (note.includes('mirror') || note.includes('chrome')) tintBar = 95;
  else if (note.includes('tint')) tintBar = 65;
  else tintBar = 40;

  return { tint, fit, family, accent, tintBar };
}

export default function Hero({
  step,
  selectedVisor,
  totalVisors,
  onCTA,
  ctaDisabled,
}: {
  step: 1 | 2 | 3;
  selectedVisor: Visor | null;
  totalVisors: number;
  onCTA: () => void;
  ctaDisabled: boolean;
}) {
  const specs = deriveSpecs(selectedVisor);
  const accent = selectedVisor ? LINE_ACCENT[selectedVisor.line] : '#ff4a1c';

  return (
    <section className="hero" id="hero">
      <div className="hero-grain" aria-hidden="true" />

      <div className="hero-header">
        <div>
          <p className="hud" style={{ marginBottom: 14 }}>
            Team visor intake · Program 04/26
          </p>
          <h1 className="hero-title display">
            LOCK <span className="em">IN</span>.
          </h1>
          <p className="hero-sub" style={{ marginTop: 18 }}>
            One link for the whole roster. Each player picks their finish and
            confirms their helmet — we batch the order and confirm with your
            coach.
          </p>
        </div>

        <div className="hero-meta">
          <div className="meta-stat">
            <div className="k">Finishes</div>
            <div className="v">{totalVisors}</div>
          </div>
          <div className="meta-stat">
            <div className="k">Lines</div>
            <div className="v">03</div>
          </div>
          <div className="meta-stat">
            <div className="k">Origin</div>
            <div className="v">STHLM SWEDEN</div>
          </div>
        </div>
      </div>

      <div className="stage" id="stage">
        {/* Left: visor preview */}
        <div
          className="stage-left"
          style={{ ['--current-accent' as any]: accent } as React.CSSProperties}
        >
          <div className="ticks" aria-hidden="true">
            <i />
            <b />
          </div>
          <div className="stage-hud">
            <div className="l">
              <span className="chip">
                {selectedVisor ? selectedVisor.line : 'AWAITING INPUT'}
              </span>
              <span>FILE · RYR-{(selectedVisor?.id ?? 'XXXXXX').slice(-6).toUpperCase()}</span>
            </div>
            <div className="r">
              <span>CAM 01</span>
              <span>· FRAME {selectedVisor ? '0042' : '----'}</span>
            </div>
          </div>

          <div className="visor-wrap">
            <AnimatePresence mode="wait">
              {selectedVisor ? (
                <motion.div
                  key={selectedVisor.id}
                  initial={{ opacity: 0, scale: 0.94, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -6 }}
                  transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    position: 'absolute',
                    inset: '12% 10%',
                  }}
                >
                  <Image
                    src={selectedVisor.image}
                    alt={selectedVisor.name}
                    fill
                    priority
                    sizes="(max-width: 960px) 80vw, 600px"
                    style={{ objectFit: 'contain' }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hud"
                  style={{ textAlign: 'center', maxWidth: 260 }}
                >
                  Select a visor below — the preview locks in here.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="scanline" aria-hidden="true" />

          <div className="stage-hud-bottom">
            <div>
              <div className="sk">Tint</div>
              <div className="sv">{specs.tint}</div>
            </div>
            <div>
              <div className="sk">Fit</div>
              <div className="sv">{specs.fit}</div>
            </div>
            <div>
              <div className="sk">Family</div>
              <div className="sv">{specs.family}</div>
            </div>
            <div>
              <div className="sk">Accent</div>
              <div className="sv">{specs.accent}</div>
            </div>
          </div>
        </div>

        {/* Right: detail card + CTA */}
        <div className="stage-right">
          <div
            className="detail-card"
            style={{ ['--current-accent' as any]: accent } as React.CSSProperties}
          >
            <div className="detail-line">
              {selectedVisor ? `${selectedVisor.line} Line` : 'No selection'}
            </div>
            <h2 className="detail-name">
              {selectedVisor ? selectedVisor.name : 'Pick a visor'}
            </h2>
            <p className="detail-desc">
              {selectedVisor
                ? selectedVisor.description
                : 'Scroll down to browse all finishes across VIZU, VISION and REVO.'}
            </p>

            <div className="spec-grid" style={{ marginTop: 20 }}>
              <div className="cell">
                <div className="k">Tint density</div>
                <div className="v">{specs.tint}</div>
                <div className="bar">
                  <motion.i
                    initial={false}
                    animate={{ width: `${specs.tintBar}%` }}
                    transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </div>
              </div>
              <div className="cell">
                <div className="k">Fit</div>
                <div className="v">{specs.fit}</div>
              </div>
              <div className="cell">
                <div className="k">Family</div>
                <div className="v">{specs.family}</div>
              </div>
              <div className="cell">
                <div className="k">Accent</div>
                <div className="v">{specs.accent}</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="cta"
            onClick={onCTA}
            disabled={ctaDisabled}
          >
            <span>
              {step === 1
                ? selectedVisor
                  ? 'Continue — Identify'
                  : 'Pick a visor first'
                : 'Continue'}
            </span>
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
