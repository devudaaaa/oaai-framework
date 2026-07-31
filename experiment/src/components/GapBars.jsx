import { signed } from '../lib/format.js';

/**
 * Feedback element (Werbach Dynamics). Animated credit vs responsibility bars
 * with the numeric gap. Used in game mode after both sliders are answered.
 */
export default function GapBars({ own, acc }) {
  const gap = own - acc;
  const oh = Math.round((own / 7) * 100);
  const ah = Math.round((acc / 7) * 100);
  return (
    <div className="gap">
      <span className="eyebrow" style={{ color: 'var(--g)' }}>
        Your gap this round
      </span>
      <div className="gap-bars">
        <div className="gap-bar own" style={{ height: oh + '%' }}>
          <span className="gap-bar-label">Credit {own}</span>
        </div>
        <div className="gap-bar acc" style={{ height: ah + '%' }}>
          <span className="gap-bar-label">Responsibility {acc}</span>
        </div>
      </div>
      <div className="gap-num">{signed(gap)}</div>
      <div className="gap-text">
        {gap > 0
          ? 'You claimed more credit than responsibility.'
          : gap < 0
            ? 'You accepted more responsibility than credit.'
            : 'Perfect symmetry this round.'}
      </div>
    </div>
  );
}
