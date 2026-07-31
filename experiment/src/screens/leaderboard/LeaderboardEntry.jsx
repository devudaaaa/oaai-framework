/**
 * Destination B entry. Collects only a chosen pseudonym and submits it with the
 * Engagement Score. No Likert answer, no OAAI, no email. The reward path is a
 * manual weekly email, explained on the next screen.
 *
 * No em dashes anywhere.
 */
import { useState } from 'react';
import { useSession } from '../../state/SessionContext.jsx';
import {
  buildLeaderboardEntry,
  submitLeaderboard,
  isLeaderboardConfigured,
  assertSeparation,
  CLAIM_EMAIL,
} from '../../lib/leaderboard.js';
import { saveLocal } from '../../lib/storage.js';
import { computeEngagement } from '../../lib/engagement.js';

export default function LeaderboardEntry() {
  const { state, actions, scenarios } = useSession();
  const score = computeEngagement(state, scenarios).total;
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const entry = buildLeaderboardEntry(name || 'anon', score);
    if (import.meta.env.DEV) {
      try {
        assertSeparation(null, entry);
      } catch (e) {
        console.error(e);
      }
    }
    setSubmitting(true);
    await submitLeaderboard(entry);
    saveLocal('oaai_lb_me', {
      pseudonym: entry.pseudonym,
      engagementScore: entry.engagementScore,
      leaderboardId: entry.leaderboardId,
      cycleId: entry.cycleId,
    });
    setSubmitting(false);
    actions.gotoLeaderboard();
  }

  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="card">
          <p className="eyebrow" style={{ color: 'var(--g)', marginBottom: 14 }}>
            The leaderboard
          </p>
          <h2 className="subhead">Put a name to your run.</h2>

          <div className="score-callout">
            <span className="num">{score}</span>
            <span className="muted">Engagement Score</span>
          </div>

          <p className="muted" style={{ fontSize: 14, marginBottom: 4 }}>
            Pick any name, not your real one. This is the only thing the leaderboard ever sees about
            you. It never receives your answers or your OAAI.
          </p>
          <input
            className="pseudonym-input"
            placeholder="your nickname"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
          />

          {!isLeaderboardConfigured() && (
            <span className="status wait" style={{ marginTop: 14 }}>
              Leaderboard backend not connected yet. Your entry is saved locally so you can still
              see your score on the board.
            </span>
          )}

          <div className="claim-note">
            <strong>Weekly rewards.</strong> At the end of each weekly cycle, the{' '}
            <strong>top three</strong> players on the leaderboard can email {CLAIM_EMAIL} to claim a
            reward. Devudalab will reach out to arrange it.
          </div>
          <p className="terms">
            No purchase necessary. One entry per person per cycle. Rewards are discretionary and may
            vary by country. Void where prohibited.
          </p>

          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => actions.gotoLeaderboard()}>
              Skip, just show the board
            </button>
            <button className="btn btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Add me to the board →'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
