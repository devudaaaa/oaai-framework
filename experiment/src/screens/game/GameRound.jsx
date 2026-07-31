/**
 * The Boss Game round, a seven-beat state machine.
 *
 *   1 Pitch        the setup
 *   2 Good Day     positive outcome plus the ownership slider (frozen)
 *   3 Trigger Puzzle  predict the four triggers, then the reveal
 *   4 Bad Day      negative outcome plus the accountability slider (frozen),
 *                  Sam badge here if the affected party is the average AI user
 *   5 Gap Reveal   animated credit vs responsibility bars
 *   6 The Choice   as the boss, what do you do now (logged, never scored)
 *   7 Real World   case-anchored scenarios only
 *
 * The puzzle and the choice are fully resolved on their own screens. Neither
 * sits next to the ownership or accountability sliders.
 *
 * No em dashes anywhere.
 */
import { useEffect } from 'react';
import { useSession } from '../../state/SessionContext.jsx';
import LikertScale from '../../components/LikertScale.jsx';
import QuestionText from '../../components/QuestionText.jsx';
import SamBadge from '../../components/SamBadge.jsx';
import GapBars from '../../components/GapBars.jsx';
import MeterBar from '../../components/MeterBar.jsx';
import TriggerPuzzle from '../../components/TriggerPuzzle.jsx';
import { domainLabel } from '../../data/domains.js';
import { CHOICES, CHOICE_PROMPT } from '../../data/choices.js';
import { computeEngagement, computeTriggerSense } from '../../lib/engagement.js';

export default function GameRound() {
  const { state, actions, current, scenarios } = useSession();
  const sc = current;
  const i = state.idx;
  const tot = scenarios.length;
  const beat = state.beat;
  const pos = state.responses[sc.id + '_pos'];
  const neg = state.responses[sc.id + '_neg'];
  const samShow = sc.affectedParty && sc.affectedParty.role === 'average_ai_user';
  const hasCase = !!sc.caseAnchor;
  const chosen = state.protectiveChoices[sc.id];
  const existingPred = state.triggerPredictions[sc.id];
  const puzzleResolved = !!existingPred;

  // Reveal counts toward the Case Closed badge.
  useEffect(() => {
    if (beat === 7 && hasCase) actions.markCaseViewed(sc.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, sc.id]);

  const engagement = computeEngagement(state, scenarios).total;
  const sense = computeTriggerSense(state.triggerPredictions);

  const setBeat = (b) => actions.setBeat(b);
  const Back = ({ to }) => (
    <button className="btn btn-ghost" onClick={() => setBeat(to)}>
      ← Back
    </button>
  );
  const finishLabel = i < tot - 1 ? 'Next round →' : 'See my results →';

  let content = null;

  if (beat === 1) {
    content = (
      <>
        <h2 className="scn-title">{sc.title}</h2>
        <p className="scn-setup">{sc.setup}</p>
        <div className="nav-row">
          <span className="spacer" />
          <button className="btn btn-primary" onClick={() => setBeat(2)}>
            The good day →
          </button>
        </div>
      </>
    );
  } else if (beat === 2) {
    content = (
      <>
        <h2 className="scn-title">{sc.title}</h2>
        <div className="cond pos">
          <div className="cond-tag">The good day</div>
          <div className="cond-out">{sc.positive.outcome}</div>
          <div className="cond-q">
            <QuestionText text={sc.positive.question} />
          </div>
          <LikertScale value={pos} onChange={(n) => actions.setResponse(sc.id + '_pos', n)} />
        </div>
        <div className="nav-row">
          <Back to={1} />
          <button className="btn btn-primary" disabled={pos === undefined} onClick={() => setBeat(3)}>
            Predict the triggers →
          </button>
        </div>
      </>
    );
  } else if (beat === 3) {
    content = (
      <>
        <h2 className="scn-title">{sc.title}</h2>
        <TriggerPuzzle
          key={sc.id}
          scenario={sc}
          existing={existingPred}
          onResolved={({ predicted, correct }) =>
            actions.setTriggerPrediction(sc.id, predicted, correct)
          }
        />
        <div className="nav-row">
          <Back to={2} />
          {puzzleResolved ? (
            <button className="btn btn-primary" onClick={() => setBeat(4)}>
              Now the bad day →
            </button>
          ) : (
            <span className="spacer" />
          )}
        </div>
      </>
    );
  } else if (beat === 4) {
    content = (
      <>
        <h2 className="scn-title">{sc.title}</h2>
        {samShow && <SamBadge />}
        <div className="cond neg">
          <div className="cond-tag">The bad day</div>
          <div className="cond-out">{sc.negative.outcome}</div>
          <div className="cond-q">
            <QuestionText text={sc.negative.question} />
          </div>
          <LikertScale value={neg} onChange={(n) => actions.setResponse(sc.id + '_neg', n)} />
        </div>
        <div className="nav-row">
          <Back to={3} />
          <button className="btn btn-primary" disabled={neg === undefined} onClick={() => setBeat(5)}>
            See the gap →
          </button>
        </div>
      </>
    );
  } else if (beat === 5) {
    content = (
      <>
        <h2 className="scn-title">{sc.title}</h2>
        <GapBars own={pos} acc={neg} />
        <div className="nav-row">
          <Back to={4} />
          <button className="btn btn-primary" onClick={() => setBeat(6)}>
            Your move →
          </button>
        </div>
      </>
    );
  } else if (beat === 6) {
    content = (
      <>
        <h2 className="scn-title">{sc.title}</h2>
        <p className="puzzle-prompt">{CHOICE_PROMPT}</p>
        <div className="choice-list">
          {CHOICES[sc.id].map((opt) => (
            <button
              key={opt.id}
              className={'choice-opt' + (chosen === opt.id ? ' sel' : '')}
              onClick={() => actions.setChoice(sc.id, opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="nav-row">
          <Back to={5} />
          {hasCase ? (
            <button
              className="btn btn-primary"
              disabled={chosen === undefined}
              onClick={() => setBeat(7)}
            >
              What really happened →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={chosen === undefined}
              onClick={() => actions.nextRound()}
            >
              {finishLabel}
            </button>
          )}
        </div>
      </>
    );
  } else if (beat === 7) {
    const ca = sc.caseAnchor;
    content = (
      <>
        <h2 className="scn-title">{sc.title}</h2>
        <div className="case">
          <span className="eyebrow">This really happened</span>
          <div className="case-name">{ca.name}</div>
          <div className="case-cite">{ca.citation}</div>
          <div className="case-out">{ca.realOutcome}</div>
          {ca.sourceNote && <div className="case-source">{ca.sourceNote}</div>}
        </div>
        <p className="muted" style={{ fontSize: 14, marginTop: 14 }}>
          The gap between what people claim and what courts decide is measurable. You just measured
          yours.
        </p>
        <div className="nav-row">
          <Back to={6} />
          <button className="btn btn-primary" onClick={() => actions.nextRound()}>
            {finishLabel}
          </button>
        </div>
      </>
    );
  }

  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="card">
          <div className="scn-head">
            <span className="scn-round">
              Round {String(i + 1).padStart(2, '0')} of {String(tot).padStart(2, '0')}
            </span>
            <span className="scn-domain">{domainLabel(sc.domain)}</span>
          </div>
          {content}
        </div>
      </div>
      <MeterBar engagement={engagement} masterySense={sense} round={i + 1} total={tot} />
    </section>
  );
}
