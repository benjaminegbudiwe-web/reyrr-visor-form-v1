'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Chrome({ step }: { step: 1 | 2 | 3 }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="chrome">
      <a
        href="https://reyrr.se"
        target="_blank"
        rel="noreferrer"
        className="logo-mark"
        aria-label="Reyrr Athletics"
      >
        <Image
          src="/reyrr-logo.png"
          alt="Reyrr Athletics"
          width={600}
          height={131}
          priority
          style={{
            height: 22,
            width: 'auto',
            display: 'block',
          }}
        />
      </a>

      <div className="chrome-mid">
        <span className="dot" aria-hidden="true" />
        <span className="hud">LIVE INTAKE</span>
      </div>

      <div className="chrome-right">
        <span className="step-indicator" aria-label={`Step ${step} of 2`}>
          <span className={`n ${step >= 1 ? 'active' : ''}`}>01</span>
          <span className="s">—</span>
          <span className={`n ${step >= 2 ? 'active' : ''}`}>02</span>
        </span>
        <span className="hud-sm" suppressHydrationWarning>
          {clock || '--:--:--'}
        </span>
      </div>
    </header>
  );
}
