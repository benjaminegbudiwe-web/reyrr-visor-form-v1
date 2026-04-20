'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import allProducts from '@/data/products.json';
import Chrome from '@/components/Chrome';

// All products render. `soldOut: true` in products.json disables selection
// (greyed out + X overlay) but keeps the card visible so players can see
// the full line. Server-side VALID_IDS still blocks forged submissions.
const products = allProducts;
import Hero from '@/components/Hero';
import StepCatalog from '@/components/StepCatalog';
import StepIdentify, { IdentifyFields } from '@/components/StepIdentify';
import StepDone from '@/components/StepDone';
import Ticker from '@/components/Ticker';

type Visor = (typeof products)[number];
type Step = 'catalog' | 'identify' | 'done';

const LINE_ORDER = ['VIZU', 'VISION', 'REVO'];

const EMPTY_FIELDS: IdentifyFields = {
  playerName: '',
  helmetModel: '',
};

function makeRequestId(): string {
  // RYR-XXXXXX — 6 alphanumeric
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `RYR-${s}`;
}

export default function Home() {
  const [step, setStep] = useState<Step>('catalog');
  const [selectedVisor, setSelectedVisor] = useState<Visor | null>(null);
  const [fields, setFields] = useState<IdentifyFields>(EMPTY_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string>('');
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const chromeStep: 1 | 2 | 3 =
    step === 'catalog' ? 1 : step === 'identify' ? 2 : 3;

  const patchFields = useCallback((patch: Partial<IdentifyFields>) => {
    setFields((prev) => ({ ...prev, ...patch }));
  }, []);

  const handlePickVisor = (v: Visor) => {
    setSelectedVisor(v);
    // Scroll to the stage so the selected visor + detail card + CTA land
    // in view. Offset ~140px above the stage top so you see a bit of the
    // LOCK IN. headline + breathing room, not a hard cut to the frame.
    const stage = document.getElementById('stage');
    if (stage) {
      const top = stage.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const advanceToIdentify = () => {
    if (!selectedVisor) {
      // Scroll to the picker instead
      pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setStep('identify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!selectedVisor) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.playerName.trim(),
          visor: selectedVisor.id,
          line: selectedVisor.line,
          helmet_model: fields.helmetModel,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Submission failed');
      setRequestId(makeRequestId());
      setStep('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedVisor(null);
    setFields(EMPTY_FIELDS);
    setError(null);
    setRequestId('');
    setStep('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalVisors = useMemo(() => products.length, []);

  return (
    <main>
      <Chrome step={chromeStep} />

      <AnimatePresence mode="wait">
        {step === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Hero
              step={1}
              selectedVisor={selectedVisor}
              totalVisors={totalVisors}
              onCTA={advanceToIdentify}
              ctaDisabled={!selectedVisor}
            />
            <Ticker />
            <div ref={pickerRef}>
              <StepCatalog
                visors={products}
                lines={LINE_ORDER}
                selectedId={selectedVisor?.id ?? null}
                onPick={handlePickVisor}
              />
            </div>
          </motion.div>
        )}

        {step === 'identify' && selectedVisor && (
          <motion.div
            key="identify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <StepIdentify
              visor={selectedVisor}
              fields={fields}
              onChange={patchFields}
              onBack={() => setStep('catalog')}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
            />
            <Ticker />
          </motion.div>
        )}

        {step === 'done' && selectedVisor && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <StepDone
              requestId={requestId}
              playerName={fields.playerName}
              visor={selectedVisor}
              onReset={handleReset}
            />
            <Ticker />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
