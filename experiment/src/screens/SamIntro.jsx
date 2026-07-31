import { useSession } from '../state/SessionContext.jsx';
import SamCard from '../components/SamCard.jsx';

export default function SamIntro() {
  const { actions } = useSession();
  return (
    <section className="screen fade-in">
      <div className="wrap">
        <div className="card">
          <p className="eyebrow" style={{ color: 'var(--p)', marginBottom: 16 }}>
            Meet someone, 20 seconds
          </p>
          <h2 className="subhead">Before you begin, meet Sam.</h2>
          <p className="muted" style={{ margin: '12px 0 4px', fontSize: 15 }}>
            In several scenarios, someone is affected by the AI system you run. That person is Sam.
          </p>
          <SamCard />
          <p className="muted" style={{ fontSize: 14 }}>
            Sam is not a test. Sam is the reason the framework exists. Keep Sam in mind.
          </p>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => actions.setScreen('demographics')}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => actions.begin()}>
              Begin scenarios →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
