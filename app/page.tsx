'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import products from '@/data/products.json';
import Hero from '@/components/Hero';
import StepCatalog from '@/components/StepCatalog';
import StepName from '@/components/StepName';
import StepDone from '@/components/StepDone';

type Visor = (typeof products)[number];
type Step = 'catalog' | 'name' | 'done';

const LINE_ORDER = ['VIZU', 'VISION', 'REVO'];

export default function Home() {
  const [step, setStep] = useState<Step>('catalog');
  const [selectedVisor, setSelectedVisor] = useState<Visor | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progressPercent = step === 'catalog' ? 50 : step === 'name' ? 85 : 100;
  const progressLabel =
    step === 'done' ? 'Complete' : `Step ${step === 'catalog' ? 1 : 2} of 2`;

  const handlePickVisor = (visor: Visor) => {
    setSelectedVisor(visor);
    setStep('name');
    // Scroll to top so the hero + form are visible
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  };

  const handleSubmit = async () => {
    if (!selectedVisor || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          visor: selectedVisor.id,
          line: selectedVisor.line,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Submission failed');
      setStep('done');
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedVisor(null);
    setName('');
    setError(null);
    setStep('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showVisorInHero =
    (step === 'name' || step === 'done') && !!selectedVisor;

  return (
    <main>
      <Hero
        state={{
          step,
          selectedLine: selectedVisor?.line ?? null,
          selectedVisor:
            showVisorInHero && selectedVisor
              ? {
                  name: selectedVisor.name,
                  image: selectedVisor.image,
                  note: selectedVisor.note,
                }
              : null,
        }}
      />

      <div className="form-shell">
        <header className="form-shell__header">
          <div>
            <p className="eyebrow">Player intake</p>
            <h2>Visor request</h2>
          </div>
          <div className="progress">
            <span className="progress__label">{progressLabel}</span>
            <div className="progress__track" aria-hidden="true">
              <motion.span
                className="progress__fill"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35 }}
                style={{ display: 'block', height: '100%' }}
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {step === 'catalog' && (
              <StepCatalog
                visors={products}
                lines={LINE_ORDER}
                onPick={handlePickVisor}
              />
            )}
            {step === 'name' && selectedVisor && (
              <StepName
                value={name}
                visor={selectedVisor}
                onChange={setName}
                onBack={() => setStep('catalog')}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={error}
              />
            )}
            {step === 'done' && selectedVisor && (
              <StepDone name={name} visor={selectedVisor} onReset={handleReset} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
