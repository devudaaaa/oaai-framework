import { useSession } from '../state/SessionContext.jsx';

const QUESTIONS = [
  {
    key: 'ageBand',
    label: 'Your age',
    options: [
      ['under_18', 'Under 18'],
      ['18_24', '18 to 24'],
      ['25_34', '25 to 34'],
      ['35_44', '35 to 44'],
      ['45_54', '45 to 54'],
      ['55_plus', '55 or older'],
    ],
  },
  {
    key: 'aiUsage',
    label: 'How often do you use AI tools?',
    options: [
      ['daily', 'Daily'],
      ['weekly', 'A few times a week'],
      ['monthly', 'A few times a month'],
      ['rarely', 'Rarely'],
      ['never', 'Never'],
    ],
  },
  {
    key: 'aiRelation',
    label: 'Your relationship to AI work',
    options: [
      ['researcher', 'Researcher'],
      ['engineer', 'Engineer'],
      ['policy', 'Policy / Law'],
      ['student', 'Student'],
      ['industry', 'Industry (non-technical)'],
      ['creative', 'Creative / Writer'],
      ['curious', 'Curious citizen'],
      ['other', 'Other'],
    ],
  },
  {
    key: 'region',
    label: 'Where in the world are you?',
    options: [
      ['us_west', 'US West'],
      ['us_east', 'US East'],
      ['us_other', 'US Other'],
      ['india', 'India'],
      ['china', 'China'],
      ['eu', 'Europe / UK'],
      ['latam', 'Latin America'],
      ['mena', 'Middle East / Africa'],
      ['apac', 'Other Asia-Pacific'],
      ['skip', 'Prefer not to say'],
    ],
  },
];

export default function Demographics() {
  const { state, actions } = useSession();
  const cont = () => {
    const any = Object.values(state.demographics).some((v) => v);
    actions.setDemoComplete(any);
    actions.setScreen('sam');
  };
  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="card">
          <p className="eyebrow" style={{ color: 'var(--g)', marginBottom: 14 }}>
            About you, all optional
          </p>
          <h2 className="subhead">A little context helps the research. Skip anything you like.</h2>
          <div style={{ marginTop: 26 }}>
            {QUESTIONS.map((q) => (
              <div className="demo-q" key={q.key}>
                <div className="demo-label">
                  {q.label} <span className="demo-hint">(optional)</span>
                </div>
                <div className="chip-row">
                  {q.options.map(([v, label]) => (
                    <button
                      key={v}
                      className={'chip' + (state.demographics[q.key] === v ? ' sel' : '')}
                      onClick={() =>
                        actions.setDemo(q.key, state.demographics[q.key] === v ? '' : v)
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => actions.setScreen('consent')}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={cont}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
