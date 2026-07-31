import { SessionProvider, useSession } from './state/SessionContext.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './screens/Landing.jsx';
import Consent from './screens/Consent.jsx';
import Demographics from './screens/Demographics.jsx';
import SamIntro from './screens/SamIntro.jsx';
import ScenarioSurvey from './screens/survey/ScenarioSurvey.jsx';
import Results from './screens/Results.jsx';

const STATIC_PROGRESS = {
  landing: 2,
  consent: 8,
  demographics: 16,
  sam: 24,
  results: 100,
};

function progressFor(state) {
  if (state.screen === 'survey') {
    const tot = state.order.length;
    return Math.min(96, 28 + (state.idx / tot) * 68);
  }
  return STATIC_PROGRESS[state.screen] ?? 0;
}

const SCREENS = {
  landing: Landing,
  consent: Consent,
  demographics: Demographics,
  sam: SamIntro,
  survey: ScenarioSurvey,
  results: Results,
};

function Shell() {
  const { state, actions } = useSession();
  const View = SCREENS[state.screen] || Landing;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => actions.restart()} title="Start over">
          <span className="brand-name">devudaaaa</span>
          <span className="brand-tag">OAAI</span>
        </div>
      </header>
      <ProgressBar value={progressFor(state)} />
      <View />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}
