import { pct } from '../lib/format.js';

/**
 * Sticky game meter. The only place the Engagement Score appears during play.
 * It never shows leaderboard rank mid-round, by design (spec 1.8).
 */
export default function MeterBar({ engagement, masterySense, round, total }) {
  return (
    <div className="meter-bar">
      <div className="meter-item">
        <span className="meter-label">Engagement</span>
        <span className="meter-val">{engagement}</span>
      </div>
      <div className="mastery">
        <span className="meter-label">Trigger Sense {pct(masterySense)}</span>
        <div className="mastery-track">
          <div className="mastery-fill" style={{ width: pct(masterySense) }} />
        </div>
      </div>
      <div className="meter-item">
        <span className="meter-label">Round</span>
        <span className="meter-val">
          {round}/{total}
        </span>
      </div>
    </div>
  );
}
