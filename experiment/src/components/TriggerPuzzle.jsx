/**
 * The Trigger Puzzle (game mode, Werbach Challenge).
 *
 * Before the bad day is revealed, the participant predicts which of the four
 * accountability triggers apply. After submitting, the real profile is revealed
 * with each guess marked. This is a genuine puzzle: it rewards reading the case,
 * not stalling or rushing. It is fully resolved on its own screen and never sits
 * next to the ownership or accountability sliders.
 *
 * No em dashes anywhere.
 */
import { useState } from 'react';
import { TRIGGERS } from '../data/triggers.js';
import { triggerCorrectCount } from '../lib/engagement.js';

export default function TriggerPuzzle({ scenario, existing, onResolved }) {
  const [checked, setChecked] = useState(() => new Set(existing ? existing.predicted : []));
  const [submitted, setSubmitted] = useState(!!existing);

  const profile = scenario.triggerProfile;

  const toggle = (key) => {
    if (submitted) return;
    const next = new Set(checked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChecked(next);
  };

  const submit = () => {
    const predicted = [...checked];
    const correct = triggerCorrectCount(predicted, profile);
    setSubmitted(true);
    onResolved({ predicted, correct });
  };

  const correct = submitted ? triggerCorrectCount([...checked], profile) : 0;

  function statusFor(key) {
    const predictedTrue = checked.has(key);
    const actualTrue = !!profile[key];
    if (predictedTrue && actualTrue) return { cls: 'correct', mark: 'Applies' };
    if (predictedTrue && !actualTrue) return { cls: 'wrong', mark: 'Does not apply' };
    if (!predictedTrue && actualTrue) return { cls: 'missed', mark: 'You missed this' };
    return { cls: 'correct', mark: 'Correctly skipped' };
  }

  return (
    <div>
      <p className="puzzle-prompt">
        Before you see what happened, which of these accountability triggers do you think apply
        here?
      </p>
      <div className="puzzle-list">
        {TRIGGERS.map((t) => {
          const isChecked = checked.has(t.key);
          const reveal = submitted ? statusFor(t.key) : null;
          const cls = ['puzzle-item', isChecked && !submitted ? 'checked' : '', reveal ? reveal.cls : '']
            .filter(Boolean)
            .join(' ');
          return (
            <button key={t.key} type="button" className={cls} onClick={() => toggle(t.key)}>
              <span className="puzzle-box">{isChecked ? '✓' : ''}</span>
              <span>
                <span className="puzzle-label">{t.label}</span>
                <span className="puzzle-blurb">{t.blurb}</span>
              </span>
              {reveal && <span className="puzzle-mark">{reveal.mark}</span>}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <div className="puzzle-score">
          <div className="num">{correct} of 4</div>
          <div className="lbl">triggers read correctly</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="btn btn-primary" onClick={submit}>
            Lock in my read
          </button>
        </div>
      )}
    </div>
  );
}
