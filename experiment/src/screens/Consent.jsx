import { useSession } from '../state/SessionContext.jsx';

export default function Consent() {
  const { actions } = useSession();
  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="card">
          <p className="eyebrow" style={{ color: 'var(--g)', marginBottom: 16 }}>
            Before you start
          </p>
          <h2 className="subhead">A few words on how your answers are used.</h2>
          <ul className="landing-points" style={{ marginTop: 24 }}>
            <li>
              Your responses are recorded anonymously, for research on how people attribute
              AI-assisted outcomes.
            </li>
            <li>No name, email, or login is ever tied to your research answers.</li>
            <li>You can stop at any time by closing the tab.</li>
          </ul>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => actions.setScreen('landing')}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => actions.setScreen('demographics')}>
              I understand, continue →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
