'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type Visor = { id: string; line: string; name: string; note: string; image: string };

export default function StepDone({
  name,
  visor,
  onReset,
}: {
  name: string;
  visor: Visor;
  onReset: () => void;
}) {
  const firstName = name.trim().split(' ')[0];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="success-badge"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Request captured
      </motion.div>

      <div className="step-heading" style={{ marginTop: 18 }}>
        <h3>Thanks, {firstName}.</h3>
        <p>
          Your <strong style={{ color: 'var(--text)' }}>{visor.name}</strong>{' '}
          request is locked in. We’ll be in touch about timing and delivery.
        </p>
      </div>

      <div className="selected-card">
        <div className="selected-card__img">
          <Image
            src={visor.image}
            alt={visor.name}
            fill
            sizes="72px"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="selected-card__meta">
          <span className="eyebrow" style={{ color: 'var(--text-soft)' }}>
            Saved
          </span>
          <h4>{visor.name}</h4>
          <p>{name}</p>
        </div>
      </div>

      <div className="actions">
        <button type="button" className="button button--ghost" onClick={onReset}>
          Submit another
        </button>
      </div>
    </div>
  );
}
