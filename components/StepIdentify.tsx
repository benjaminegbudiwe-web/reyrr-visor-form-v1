'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

type Visor = {
  id: string;
  line: string;
  name: string;
  note: string;
  image: string;
};

export type IdentifyFields = {
  teamName: string;
  playerName: string;
  jerseyNumber: string;
  helmetModel: string;
};

const HELMET_OPTIONS = [
  { value: '', label: 'Select helmet model…' },
  { value: 'SpeedFlex', label: 'Riddell SpeedFlex' },
  { value: 'Schutt F7', label: 'Schutt F7' },
  { value: 'Axiom', label: 'Riddell Axiom' },
  { value: 'Speed Icon', label: 'Riddell Speed Icon' },
  { value: 'Other Brand', label: 'Other Brand' },
  { value: 'Unknown', label: 'Not sure, flag for check' },
];

// VIZU is fit-specific to SpeedFlex / Schutt F7. Warn (non-blocking) otherwise.
const VIZU_COMPATIBLE = new Set(['SpeedFlex', 'Schutt F7']);

export default function StepIdentify({
  visor,
  fields,
  onChange,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  visor: Visor;
  fields: IdentifyFields;
  onChange: (patch: Partial<IdentifyFields>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const firstRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const showVizuWarning =
    visor.line === 'VIZU' &&
    !!fields.helmetModel &&
    !VIZU_COMPATIBLE.has(fields.helmetModel);

  const canSubmit =
    fields.teamName.trim().length > 0 &&
    fields.playerName.trim().length > 0 &&
    fields.helmetModel.length > 0 &&
    !submitting;

  return (
    <section className="step2" id="identify">
      {/* Left: marketing copy + live stats */}
      <div className="step2-left">
        <p className="eyebrow">Step 02 · Identify</p>
        <h2 className="step2-title">
          WHO'S IT <span className="em">FOR?</span>
        </h2>
        <p className="step2-sub">
          Saved with your team's order. We'll batch the roster, confirm helmet
          fit, and reply to your coach with timing.
        </p>

        <div className="step2-stats">
          <div className="detail-card">
            <div className="detail-line">Visor</div>
            <div className="detail-name">{visor.name}</div>
          </div>
          <div className="detail-card">
            <div className="detail-line">Name</div>
            <div className="detail-name">{fields.playerName || '—'}</div>
          </div>
        </div>
      </div>

      {/* Right: form card */}
      <div className="step2-right">
        <div className="summary">
          <div className="summary-visor">
            <div className="g">
              <Image
                src={visor.image}
                alt={visor.name}
                fill
                sizes="120px"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
          <div className="summary-text">
            <div className="l">Selected finish</div>
            <div className="n">{visor.name}</div>
            <div className="d">{visor.note}</div>
          </div>
        </div>

        <div className="fields-stack">
          <div className="field">
            <label htmlFor="team-name" className="field-label">
              Team name
            </label>
            <input
              ref={firstRef}
              id="team-name"
              className="field-input"
              type="text"
              value={fields.teamName}
              onChange={(e) => onChange({ teamName: e.target.value })}
              placeholder="e.g. Nordic Storm"
              maxLength={80}
              autoComplete="organization"
            />
          </div>

          <div className="field">
            <label htmlFor="player-name" className="field-label">
              Player name
            </label>
            <input
              id="player-name"
              className="field-input"
              type="text"
              value={fields.playerName}
              onChange={(e) => onChange({ playerName: e.target.value })}
              placeholder="First + last name"
              maxLength={120}
              autoComplete="name"
            />
          </div>

          <div className="field field-row-2">
            <div>
              <label htmlFor="jersey-number" className="field-label">
                Jersey # <span style={{ opacity: 0.5 }}>(optional)</span>
              </label>
              <input
                id="jersey-number"
                className="field-input"
                type="text"
                value={fields.jerseyNumber}
                onChange={(e) => onChange({ jerseyNumber: e.target.value })}
                placeholder="73"
                maxLength={10}
                inputMode="text"
              />
            </div>
            <div>
              <label htmlFor="helmet-model" className="field-label">
                Helmet model
              </label>
              <select
                id="helmet-model"
                className="field-select"
                value={fields.helmetModel}
                onChange={(e) => onChange({ helmetModel: e.target.value })}
              >
                {HELMET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showVizuWarning && (
            <div className="field-warn" role="status">
              ⚠︎ VIZU is fit-specific. Built for Riddell SpeedFlex and Schutt
              F7. Double-check your helmet before we batch the order.
            </div>
          )}
        </div>

        {error && (
          <div className="field-error" role="alert">
            {error}
          </div>
        )}

        <div className="step2-actions">
          <button type="button" className="btn-ghost" onClick={onBack}>
            ← Back
          </button>
          <button
            type="button"
            className="cta"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            <span>{submitting ? 'Locking in…' : 'Submit request'}</span>
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
