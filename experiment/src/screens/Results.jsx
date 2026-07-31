/**
 * The Verdict. The single end reveal for the unified experience.
 *
 * It pairs the credit the participant claimed against the responsibility they
 * accepted, names their pattern (observational, never a score to be embarrassed
 * by), and submits the anonymous research payload (Destination A) with a local
 * fallback.
 *
 * Game-only surfaces (engagement score, trigger sense, badges, leaderboard) are
 * intentionally gone from this build. The leaderboard lands as a fast-follow.
 *
 * No em dashes anywhere.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../state/SessionContext.jsx';
import { computeOAAI, computeOAAIByDomain, computeTriggerGap } from '../lib/oaai.js';
import { patternNamed } from '../lib/engagement.js';
import { buildResearchPayload, submitResearch } from '../lib/research.js';
import { domainLabel } from '../data/domains.js';
import { signed, mmss } from '../lib/format.js';
import { saveLocal } from '../lib/storage.js';

export default function Results() {
  const { state, actions, scenarios } = useSession();

  const data = useMemo(() => {
    const responses = state.responses;
    const oaai = computeOAAI(responses, scenarios);
    const domainOaai = computeOAAIByDomain(responses, scenarios);
    const tg = computeTriggerGap(responses, scenarios);
    const own = +(
      scenarios.reduce((a, s) => a + (responses[s.id + '_pos'] || 0), 0) / scenarios.length
    ).toFixed(2);
    const acc = +(
      scenarios.reduce((a, s) => a + (responses[s.id + '_neg'] || 0), 0) / scenarios.length
    ).toFixed(2);
    const pattern = patternNamed(oaai.oaai);
    const payload = buildResearchPayload(state, scenarios);
    return { oaai, domainOaai, tg, own, acc, pattern, payload };
  }, [state, scenarios]);

  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await submitResearch(data.payload);
      if (cancelled) return;
      if (!res.configured) setStatus('fallback');
      else if (res.ok) setStatus('logged');
      else setStatus('error');
    })();
    saveLocal('oaai_last', { mode: state.mode });
    return () => {
      cancelled = true;
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const domSorted = Object.entries(data.domainOaai).sort((a, b) => b[1] - a[1]);
  const maxDom = Math.max(...domSorted.map((d) => Math.abs(d[1])), 1);
  const ownH = Math.round((data.own / 7) * 100);
  const accH = Math.round((data.acc / 7) * 100);

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(data.payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `oaai_${state.sessionId}.json`;
    a.click();
  }
  function copyResult() {
    if (navigator.clipboard) navigator.clipboard.writeText(JSON.stringify(data.payload, null, 2));
  }

  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="result-card">
          <p className="eyebrow" style={{ color: 'var(--g)', marginBottom: 14 }}>
            The verdict
          </p>
          <h2 className="subhead" style={{ marginBottom: 6 }}>
            You are <span style={{ color: 'var(--g)' }}>{data.pattern.label}</span>.
          </h2>
          <p className="muted" style={{ fontSize: 15, marginBottom: 8 }}>
            {data.pattern.descriptor}
          </p>

          <div className="gap" style={{ marginTop: 22 }}>
            <span className="eyebrow" style={{ color: 'var(--g)' }}>
              Credit claimed vs responsibility accepted
            </span>
            <div className="gap-bars">
              <div className="gap-bar own" style={{ height: ownH + '%' }}>
                <span className="gap-bar-label">Credit {data.own}</span>
              </div>
              <div className="gap-bar acc" style={{ height: accH + '%' }}>
                <span className="gap-bar-label">Responsibility {data.acc}</span>
              </div>
            </div>
            <div className="gap-num">{signed(data.oaai.oaai)}</div>
            <div className="gap-text">{data.oaai.interpretation}</div>
          </div>

          <div className="section">
            <div className="section-title">The numbers</div>
            <div className="stat-grid">
              <div className="stat">
                <div className="stat-label">Ownership claimed</div>
                <div className="stat-val">{data.own} / 7</div>
              </div>
              <div className="stat">
                <div className="stat-label">Accountability accepted</div>
                <div className="stat-val">{data.acc} / 7</div>
              </div>
              <div className="stat">
                <div className="stat-label">Total time</div>
                <div className="stat-val">{mmss(data.payload.totalTimeSec)}</div>
              </div>
            </div>
          </div>

          {domSorted.length > 0 && (
            <div className="section">
              <div className="section-title">Where your gap lives, by domain</div>
              {domSorted.map(([dom, val]) => (
                <div className="dom-row" key={dom}>
                  <span className="dom-name">{domainLabel(dom)}</span>
                  <span className="dom-bar-wrap">
                    <span
                      className="dom-bar"
                      style={{ width: (Math.abs(val) / maxDom) * 100 + '%' }}
                    />
                  </span>
                  <span className="dom-val">{signed(val)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="tg-box">
            <div className="section-title" style={{ marginBottom: 4 }}>
              Trigger gap
            </div>
            <div className="tg-val">{data.tg.triggerGap}</div>
            <p className="muted" style={{ fontSize: 14 }}>
              On the {data.tg.fullTriggerScenarios} scenarios where all four accountability triggers
              fire, this is how far below the formal standard of 7 your accountability fell. A larger
              number means you disclaimed responsibility even when every trigger applied.
            </p>
          </div>

          <div className="section">
            <div className="section-title">Research data</div>
            {status === 'logged' && (
              <span className="status ok">Anonymous response logged to the research dataset. Thank you.</span>
            )}
            {status === 'error' && (
              <span className="status err">Could not reach the dataset. Use the local copy below.</span>
            )}
            {status === 'fallback' && (
              <span className="status wait">
                Research backend not configured yet. Your response is captured locally only.
              </span>
            )}
            {status === 'idle' && <span className="status wait">Logging your response...</span>}
            <div className="nav-row" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={downloadJSON}>
                  Download JSON
                </button>
                <button className="btn btn-ghost" onClick={copyResult}>
                  Copy
                </button>
              </div>
              <span className="spacer" />
            </div>
          </div>

          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => actions.restart()}>
              Start over
            </button>
            <span className="spacer" />
          </div>
        </div>
      </div>
    </section>
  );
}
