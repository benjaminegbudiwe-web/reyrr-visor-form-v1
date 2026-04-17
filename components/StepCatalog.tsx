'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Visor = {
  id: string;
  line: string;
  name: string;
  sku: string;
  note: string;
  description: string;
  image: string;
  price: string;
};

const LINE_META: Record<
  string,
  { eyebrow: string; blurb: string }
> = {
  VIZU: {
    eyebrow: 'Flagship line',
    blurb: 'Fit-specific for Riddell SpeedFlex and Schutt F7.',
  },
  VISION: {
    eyebrow: 'Universal line',
    blurb: 'Broad helmet compatibility. The everyday workhorse.',
  },
  REVO: {
    eyebrow: 'Revo™ optics',
    blurb: 'Contrast-boosting lenses with panoramic peripheral view.',
  },
};

export default function StepCatalog({
  visors,
  lines,
  onPick,
}: {
  visors: Visor[];
  lines: string[];
  onPick: (visor: Visor) => void;
}) {
  const [activeLine, setActiveLine] = useState<string>(lines[0]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Track which section is in view → update active chip
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const line = visible[0].target.getAttribute('data-line-section');
          if (line) setActiveLine(line);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [lines]);

  const handleChipClick = (line: string) => {
    setActiveLine(line);
    const el = sectionRefs.current[line];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const grouped = lines.map((line) => ({
    line,
    visors: visors.filter((v) => v.line === line),
  }));

  return (
    <div>
      <div className="step-heading">
        <p className="eyebrow">Step 1 of 2</p>
        <h3>Pick your visor</h3>
        <p>
          Browse all {visors.length} finishes across VIZU, VISION, and REVO —
          tap any card to lock it in.
        </p>
      </div>

      {/* Sticky line-jump nav */}
      <div className="catalog-nav">
        <div className="chip-set">
          {lines.map((line) => (
            <button
              key={line}
              type="button"
              className={`chip ${activeLine === line ? 'is-active' : ''}`}
              onClick={() => handleChipClick(line)}
            >
              {line}
              <span className="chip__count">
                {grouped.find((g) => g.line === line)?.visors.length ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {grouped.map(({ line, visors: lineVisors }) => (
        <section
          key={line}
          data-line-section={line}
          ref={(el) => {
            sectionRefs.current[line] = el;
          }}
          className="line-section"
        >
          <div className="line-section__header" data-line={line}>
            <p className="eyebrow">{LINE_META[line]?.eyebrow}</p>
            <h4 className="font-display">
              {line}
              <span className="line-section__count">
                {lineVisors.length} finish{lineVisors.length === 1 ? '' : 'es'}
              </span>
            </h4>
            <p className="line-section__blurb">{LINE_META[line]?.blurb}</p>
          </div>

          <div className="visor-grid">
            {lineVisors.map((v) => (
              <button
                key={v.id}
                type="button"
                data-line={v.line}
                className="visor-card"
                onClick={() => onPick(v)}
              >
                <div className="visor-card__img">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    sizes="(max-width: 720px) 50vw, 220px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <span className="visor-card__line">{v.line}</span>
                <strong>{v.name.replace(`${v.line} `, '')}</strong>
                <p>{v.note}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
