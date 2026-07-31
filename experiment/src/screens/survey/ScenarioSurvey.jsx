import { useSession } from '../../state/SessionContext.jsx';
import LikertScale from '../../components/LikertScale.jsx';
import QuestionText from '../../components/QuestionText.jsx';
import SamBadge from '../../components/SamBadge.jsx';
import ResearchAssistant from '../../components/ResearchAssistant.jsx';
import { domainLabel } from '../../data/domains.js';

export default function ScenarioSurvey() {
  const { state, actions, current, scenarios } = useSession();
  const sc = current;
  const i = state.idx;
  const tot = scenarios.length;
  const pos = state.responses[sc.id + '_pos'];
  const neg = state.responses[sc.id + '_neg'];
  const canNext = pos !== undefined && neg !== undefined;
  const answeredCount = (pos !== undefined ? 1 : 0) + (neg !== undefined ? 1 : 0);
  const samShow = sc.affectedParty && sc.affectedParty.role === 'average_ai_user';
  const last = i === tot - 1;

  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="card">
          <div className="scn-head">
            <span className="scn-round">
              Scenario {String(i + 1).padStart(2, '0')} of {String(tot).padStart(2, '0')}
            </span>
            <span className="scn-domain">{domainLabel(sc.domain)}</span>
          </div>

          {samShow && <SamBadge />}
          <h2 className="scn-title">{sc.title}</h2>
          <p className="scn-setup">{sc.setup}</p>

          <div className="cond pos">
            <div className="cond-tag">The good day</div>
            <div className="cond-out">{sc.positive.outcome}</div>
            <div className="cond-q">
              <QuestionText text={sc.positive.question} />
            </div>
            <LikertScale value={pos} onChange={(n) => actions.setResponse(sc.id + '_pos', n)} />
          </div>

          <div className="cond neg">
            <div className="cond-tag">The bad day</div>
            <div className="cond-out">{sc.negative.outcome}</div>
            <div className="cond-q">
              <QuestionText text={sc.negative.question} />
            </div>
            <LikertScale value={neg} onChange={(n) => actions.setResponse(sc.id + '_neg', n)} />
          </div>

          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => actions.prevRound()} disabled={i === 0}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => actions.nextRound()} disabled={!canNext}>
              {last ? 'See my results →' : 'Next scenario →'}
            </button>
          </div>
        </div>
      </div>
      <ResearchAssistant scenarioId={sc.id} round={i + 1} total={tot} answeredCount={answeredCount} />
    </section>
  );
}
