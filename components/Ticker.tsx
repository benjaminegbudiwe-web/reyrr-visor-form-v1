const ITEMS = [
  'TEAM INTAKE',
  'VIZU · VISION · REVO',
  'FIT-CONFIRMED FULFILMENT',
  'HELMET-MATCHED SHIELDS',
  'MADE FOR EUROPEAN PLAYERS',
  'REYRR ATHLETICS — SWEDEN',
];

export default function Ticker() {
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div className="ticker" role="presentation">
      <div className="ticker-track">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`}>
            <span className="dot" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
