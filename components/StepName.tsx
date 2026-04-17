'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

type Visor = { id: string; line: string; name: string; note: string; image: string };

export default function StepName({
  value,
  visor,
  onChange,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  value: string;
  visor: Visor;
  onChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <div className="step-heading">
        <p className="eyebrow">Step 2 of 2</p>
        <h3>What’s your name?</h3>
        <p>Saved together with your selected visor.</p>
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
            Selected visor
          </span>
          <h4>{visor.name}</h4>
          <p>{visor.note}</p>
        </div>
      </div>

      <label className="field">
        <span className="field__label">Player name</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim() && !submitting) onSubmit();
          }}
          placeholder="Type your name"
          maxLength={80}
          autoComplete="name"
        />
      </label>
      <p className="field__hint">
        Press Enter ↵ to submit.
      </p>

      {error && <p className="form-message is-error">{error}</p>}

      <div className="actions">
        <button type="button" className="button button--ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={onSubmit}
          disabled={!value.trim() || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit request →'}
        </button>
      </div>
    </div>
  );
}
