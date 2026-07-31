import { useSession } from '../state/SessionContext.jsx';

export default function Landing() {
  const { actions } = useSession();
  const go = () => {
    actions.start();
    actions.setScreen('consent');
  };
  return (
    <section className="screen fade-in">
      <div className="wrap">
        <p className="eyebrow landing-eyebrow">OAAI Experiment</p>
        <h1 className="display">
          When AI helps, who owns it? When AI harms, who answers?
        </h1>
        <p className="landing-sub">
          Eight scenarios. You rate how much credit you claim and how much responsibility you
          accept, at identical AI involvement. The gap between the two is your OAAI.
        </p>
        <ul className="landing-points">
          <li>Anonymous. No login and no real name required.</li>
          <li>About 5 to 10 minutes.</li>
          <li>Four of the eight are grounded in real court cases.</li>
        </ul>
        <button className="btn btn-primary" onClick={go}>
          Begin →
        </button>
      </div>
    </section>
  );
}
