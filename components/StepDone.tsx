'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type Visor = {
  id: string;
  line: string;
  name: string;
  note: string;
  image: string;
};

export default function StepDone({
  requestId,
  playerName,
  teamName,
  visor,
  onReset,
}: {
  requestId: string;
  playerName: string;
  teamName: string;
  visor: Visor;
  onReset: () => void;
}) {
  const firstName = playerName.trim().split(' ')[0] || playerName.trim();

  return (
    <section className="step2" id="done">
      <div className="step2-left">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Request captured · {requestId}
        </motion.p>
        <motion.h2
          className="step2-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          Locked in, <span className="em">{firstName}.</span>
        </motion.h2>
        <motion.p
          className="step2-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          We'll batch your team's order and confirm with your coach. Keep this
          request ID in case you need to reference it.
        </motion.p>

        <div className="step2-stats">
          <div className="detail-card">
            <div className="detail-line">Team</div>
            <div className="detail-name">{teamName}</div>
          </div>
          <div className="detail-card">
            <div className="detail-line">Request</div>
            <div className="detail-name mono">{requestId}</div>
          </div>
        </div>
      </div>

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
            <div className="l">Saved finish</div>
            <div className="n">{visor.name}</div>
            <div className="d">{visor.note}</div>
          </div>
        </div>

        <div className="fields-stack">
          <div>
            <div className="field-label">Player</div>
            <div className="field-input" style={{ pointerEvents: 'none' }}>
              {playerName}
            </div>
          </div>
          <div>
            <div className="field-label">Status</div>
            <div
              className="field-input"
              style={{ pointerEvents: 'none', color: 'var(--ok)' }}
            >
              ✓ Saved to team roster
            </div>
          </div>
        </div>

        <div className="step2-actions">
          <button type="button" className="btn-ghost" onClick={onReset}>
            ← Submit another
          </button>
          <div className="cta" aria-hidden="true" style={{ opacity: 0.4 }}>
            <span>Complete</span>
            <span className="arrow">✓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
