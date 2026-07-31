/**
 * Session state for the whole experiment. One reducer drives every screen.
 *
 * It holds the LOCKED responses (id_pos, id_neg), the game-only signals
 * (trigger predictions, protective choices), per-scenario timing, and the
 * current screen. The reducer never mixes research data with leaderboard data.
 *
 * No em dashes anywhere.
 */
import { createContext, useContext, useMemo, useReducer } from 'react';
import SCENARIOS from '../data/scenarios.js';
import { randomId } from '../lib/storage.js';

const SessionContext = createContext(null);

function currentId(state) {
  return SCENARIOS[state.order[state.idx]].id;
}

function closeTimer(state) {
  const id = currentId(state);
  const start = state.sTimes[id];
  if (!start) return state.sElapsed;
  const delta = Math.round((Date.now() - start) / 1000);
  return { ...state.sElapsed, [id]: (state.sElapsed[id] || 0) + delta };
}

function openTimer(state, idx) {
  const id = SCENARIOS[state.order[idx]].id;
  return { ...state.sTimes, [id]: Date.now() };
}

function init() {
  return {
    screen: 'landing',
    mode: 'survey', // single unified experience; kept for downstream payload compatibility
    sessionId: randomId('s'),
    startAt: null,
    endAt: null,
    demographics: { ageBand: '', aiUsage: '', aiRelation: '', region: '' },
    demographicsCompleted: false,
    order: SCENARIOS.map((_, i) => i), // fixed order preserves the designed arc
    idx: 0,
    beat: 1,
    responses: {},
    triggerPredictions: {},
    protectiveChoices: {},
    casesViewed: {},
    sTimes: {},
    sElapsed: {},
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'START':
      return { ...state, startAt: state.startAt || Date.now() };
    case 'SET_DEMO':
      return { ...state, demographics: { ...state.demographics, [action.key]: action.value } };
    case 'SET_DEMO_COMPLETE':
      return { ...state, demographicsCompleted: action.value };
    case 'BEGIN':
      return {
        ...state,
        screen: 'survey',
        idx: 0,
        beat: 1,
        startAt: state.startAt || Date.now(),
        sTimes: openTimer(state, 0),
      };
    case 'SET_RESPONSE':
      return { ...state, responses: { ...state.responses, [action.key]: action.value } };
    case 'SET_BEAT':
      return { ...state, beat: action.beat };
    case 'SET_TRIGGER_PRED':
      return {
        ...state,
        triggerPredictions: {
          ...state.triggerPredictions,
          [action.id]: { predicted: action.predicted, correct: action.correct },
        },
      };
    case 'SET_CHOICE':
      return {
        ...state,
        protectiveChoices: { ...state.protectiveChoices, [action.id]: action.optionId },
      };
    case 'MARK_CASE_VIEWED':
      return { ...state, casesViewed: { ...state.casesViewed, [action.id]: true } };
    case 'NEXT_ROUND': {
      const sElapsed = closeTimer(state);
      if (state.idx >= state.order.length - 1) {
        return { ...state, sElapsed, endAt: Date.now(), screen: 'results' };
      }
      const idx = state.idx + 1;
      return { ...state, sElapsed, idx, beat: 1, sTimes: openTimer(state, idx) };
    }
    case 'PREV_ROUND': {
      if (state.idx === 0) return state;
      const sElapsed = closeTimer(state);
      const idx = state.idx - 1;
      return { ...state, sElapsed, idx, beat: 1, sTimes: openTimer(state, idx) };
    }
    case 'FINISH': {
      const sElapsed = closeTimer(state);
      return { ...state, sElapsed, endAt: Date.now(), screen: 'results' };
    }
    case 'GOTO_LEADERBOARD':
      return { ...state, screen: 'leaderboard' };
    case 'RESET':
      return init();
    default:
      return state;
  }
}

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const actions = useMemo(
    () => ({
      setScreen: (screen) => dispatch({ type: 'SET_SCREEN', screen }),
      setMode: (mode) => dispatch({ type: 'SET_MODE', mode }),
      start: () => dispatch({ type: 'START' }),
      setDemo: (key, value) => dispatch({ type: 'SET_DEMO', key, value }),
      setDemoComplete: (value) => dispatch({ type: 'SET_DEMO_COMPLETE', value }),
      begin: () => dispatch({ type: 'BEGIN' }),
      setResponse: (key, value) => dispatch({ type: 'SET_RESPONSE', key, value }),
      setBeat: (beat) => dispatch({ type: 'SET_BEAT', beat }),
      setTriggerPrediction: (id, predicted, correct) =>
        dispatch({ type: 'SET_TRIGGER_PRED', id, predicted, correct }),
      setChoice: (id, optionId) => dispatch({ type: 'SET_CHOICE', id, optionId }),
      markCaseViewed: (id) => dispatch({ type: 'MARK_CASE_VIEWED', id }),
      nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
      prevRound: () => dispatch({ type: 'PREV_ROUND' }),
      finish: () => dispatch({ type: 'FINISH' }),
      gotoLeaderboard: () => dispatch({ type: 'GOTO_LEADERBOARD' }),
      restart: () => dispatch({ type: 'RESET' }),
    }),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      actions,
      scenarios: SCENARIOS,
      current: SCENARIOS[state.order[state.idx]],
    }),
    [state, actions],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
