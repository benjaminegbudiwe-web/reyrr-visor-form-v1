'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type Visor = {
  id: string;
  line: string;
  name: string;
  sku: string;
  note: string;
  description: string;
  image: string;
  price: string;
  soldOut?: boolean;
};

const LINE_BLURB: Record<string, string> = {
  VIZU: 'Flagship line · fit-specific for Riddell SpeedFlex + Schutt F7',
  VISION: 'Universal line · broad helmet compatibility',
  REVO: 'Revo™ optics · panoramic peripheral clarity',
};

export default function StepCatalog({
  visors,
  lines,
  selectedId,
  onPick,
}: {
  visors: Visor[];
  lines: string[];
  selectedId: string | null;
  onPick: (visor: Visor) => void;
}) {
  const [activeLine, setActiveLine] = useState<string>(lines[0]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const l of lines) out[l] = visors.filter((v) => v.line === l).length;
    return out;
  }, [visors, lines]);

  const shown = visors.filter((v) => v.line === activeLine);

  return (
    <section className="picker">
      <div className="picker-head">
        <div>
          <p className="hud" style={{ marginBottom: 12 }}>
            Step 01 · Pick your finish
          </p>
          <h2>
            {visors.length} finishes.<br />
            Three lines.
          </h2>
          <p className="sub">
            Tap any card to lock it in. Your selection updates the preview up
            top in real time.
          </p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Visor line">
        {lines.map((l, i) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={activeLine === l}
            className={`tab ${activeLine === l ? 'active' : ''}`}
            onClick={() => setActiveLine(l)}
          >
            <span className="num">0{i + 1}</span>
            <span>
              {l}
              <span className="blurb">{LINE_BLURB[l]}</span>
            </span>
            <span className="cnt">{counts[l] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="grid">
        {shown.map((v, i) => {
          const isSoldOut = !!v.soldOut;
          return (
            <button
              key={v.id}
              type="button"
              className={`card ${selectedId === v.id ? 'selected' : ''} ${
                isSoldOut ? 'sold-out' : ''
              }`}
              onClick={() => !isSoldOut && onPick(v)}
              disabled={isSoldOut}
              aria-disabled={isSoldOut}
            >
              <div className="swatch">
                <div className="g">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    sizes="(max-width: 720px) 50vw, 240px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="glint" aria-hidden="true" />
                <span className="idx">
                  {String(i + 1).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}
                </span>
                {isSoldOut && (
                  <svg
                    className="card-x"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                  >
                    <line x1="4" y1="4" x2="96" y2="96" />
                    <line x1="96" y1="4" x2="4" y2="96" />
                  </svg>
                )}
              </div>
              <div className="card-body">
                <div className="card-line">{v.line}</div>
                <div className="card-name">{v.name.replace(`${v.line} `, '')}</div>
                <div className="card-desc">
                  {isSoldOut ? 'Unavailable' : v.note}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
