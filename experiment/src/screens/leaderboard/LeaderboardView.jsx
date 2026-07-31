/**
 * Public leaderboard for the current weekly cycle. Reads ranks from the
 * published Sheet CSV. Shows rank, pseudonym, and Engagement Score only.
 *
 * No em dashes anywhere.
 */
import { useEffect, useState } from 'react';
import { useSession } from '../../state/SessionContext.jsx';
import { fetchLeaderboard, cycleId, cycleLabel, CLAIM_EMAIL } from '../../lib/leaderboard.js';
import { loadLocal } from '../../lib/storage.js';

export default function LeaderboardView() {
  const { state, actions } = useSession();
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const me = loadLocal('oaai_lb_me');
  const cycle = cycleId();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLeaderboard({ cycle });
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setRows(null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMine = (r) =>
    me && r.pseudonym === me.pseudonym && Number(r.engagementScore) === Number(me.engagementScore);

  const hasBoard = Array.isArray(rows) && rows.length > 0;

  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="card">
          <p className="eyebrow" style={{ color: 'var(--g)', marginBottom: 14 }}>
            {cycleLabel(cycle)}
          </p>
          <h2 className="subhead">This week on the board.</h2>

          {loading && (
            <span className="status wait" style={{ marginTop: 14 }}>
              Loading the board...
            </span>
          )}

          {!loading && hasBoard && (
            <div className="lb-table">
              {rows.slice(0, 50).map((r) => (
                <div
                  key={r.rank + r.pseudonym}
                  className={
                    'lb-row' + (r.rank <= 3 ? ' top3' : '') + (isMine(r) ? ' you' : '')
                  }
                >
                  <span className="lb-rank">{r.rank}</span>
                  <span className="lb-name">
                    {r.pseudonym}
                    {isMine(r) ? '  (you)' : ''}
                  </span>
                  <span className="lb-score">{r.engagementScore}</span>
                </div>
              ))}
            </div>
          )}

          {!loading && !hasBoard && (
            <div>
              <span className="status wait">
                The public board turns on once the published sheet is connected. Until then, here is
                your own entry for this cycle.
              </span>
              {me && (
                <div className="lb-table" style={{ marginTop: 14 }}>
                  <div className="lb-row you">
                    <span className="lb-rank">1</span>
                    <span className="lb-name">{me.pseudonym} (you)</span>
                    <span className="lb-score">{me.engagementScore}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="claim-note">
            <strong>Weekly rewards.</strong> At the end of each weekly cycle, the{' '}
            <strong>top three</strong> players can email {CLAIM_EMAIL} to claim a reward. Devudalab
            will reach out to arrange it.
          </div>
          <p className="terms">
            No purchase necessary. One entry per person per cycle. Rewards are discretionary and may
            vary by country. Void where prohibited.
          </p>

          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => actions.restart()}>
              Play again
            </button>
            {state.endAt && (
              <button className="btn btn-primary" onClick={() => actions.setScreen('results')}>
                ← Back to my result
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
