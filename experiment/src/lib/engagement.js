/**
 * Engagement scoring (game mode).
 *
 * CRITICAL: every function here is direction-neutral. Points are earned from
 * engagement signals only (reading the case, predicting triggers, making a
 * choice, spending a sane amount of time). NOTHING here reads which way the
 * participant answered the ownership or accountability questions. Scoring by
 * answer direction would bias the research data. Do not add a signal that a
 * bored participant could maximize by only watching a clock.
 *
 * The Engagement Score is the leaderboard input. It is never the OAAI score.
 *
 * Mapped to the Werbach concepts named in the spec:
 *   Points (1.1), Trigger Puzzle accuracy (1.3), Meaningful Choice (1.2),
 *   Mastery / Trigger Sense (1.5), Badges (1.6).
 *
 * No em dashes anywhere.
 */
import { TRIGGER_KEYS } from '../data/triggers.js';

// A sane reading window. Below it, no time bonus (discourages speed clicking).
// Above it, no extra bonus (does not reward stalling).
export const READ_WINDOW = { minSec: 25, maxSec: 180 };

export const POINTS = { completionAll: 10, demographics: 3 };

/**
 * Number of the four triggers predicted correctly (0 to 4). A match is
 * agreement on a trigger: checked when it is true, or left unchecked when it is
 * false. Never reads a Likert answer.
 */
export function triggerCorrectCount(predictedKeys, triggerProfile) {
  const checked = new Set(predictedKeys || []);
  let correct = 0;
  TRIGGER_KEYS.forEach((key) => {
    const predictedTrue = checked.has(key);
    const actualTrue = !!triggerProfile[key];
    if (predictedTrue === actualTrue) correct += 1;
  });
  return correct;
}

/** Points for a single round. Direction-neutral by construction. */
export function roundPoints({ correct = 0, choiceMade = false, timeSec = null }) {
  const trigger = Math.max(0, Math.min(4, correct));
  const choice = choiceMade ? 1 : 0;
  const time =
    timeSec != null && timeSec >= READ_WINDOW.minSec && timeSec <= READ_WINDOW.maxSec ? 1 : 0;
  return { trigger, choice, time, total: trigger + choice + time };
}

/** Running Trigger Sense across all rounds that have a completed puzzle (0 to 1). */
export function computeTriggerSense(triggerPredictions) {
  const rounds = Object.values(triggerPredictions || {});
  if (rounds.length === 0) return 0;
  const totalCorrect = rounds.reduce((s, r) => s + (r.correct || 0), 0);
  return +(totalCorrect / (4 * rounds.length)).toFixed(4);
}

/** Trigger Sense restricted to the four case-anchored rounds (0 to 1). */
export function computeCaseAnchoredSense(triggerPredictions, scenarios) {
  const caseIds = scenarios.filter((s) => s.caseAnchor).map((s) => s.id);
  const rounds = caseIds
    .map((id) => (triggerPredictions || {})[id])
    .filter((r) => r && typeof r.correct === 'number');
  if (rounds.length === 0) return 0;
  const totalCorrect = rounds.reduce((s, r) => s + r.correct, 0);
  return +(totalCorrect / (4 * rounds.length)).toFixed(4);
}

/**
 * Full engagement breakdown for a session.
 * @returns { perRound, roundsCompleted, roundsTotal, completionBonus, demographicsBonus, total }
 */
export function computeEngagement(session, scenarios) {
  const {
    responses = {},
    triggerPredictions = {},
    protectiveChoices = {},
    sElapsed = {},
    demographicsCompleted = false,
  } = session;

  const perRound = {};
  let roundsCompleted = 0;
  let sum = 0;

  scenarios.forEach((s) => {
    const answered =
      responses[s.id + '_pos'] !== undefined && responses[s.id + '_neg'] !== undefined;
    if (answered) roundsCompleted += 1;
    const pred = triggerPredictions[s.id];
    const rp = roundPoints({
      correct: pred ? pred.correct : 0,
      choiceMade: protectiveChoices[s.id] !== undefined,
      timeSec: sElapsed[s.id],
    });
    perRound[s.id] = rp;
    sum += rp.total;
  });

  const completionBonus = roundsCompleted === scenarios.length ? POINTS.completionAll : 0;
  const demographicsBonus = demographicsCompleted ? POINTS.demographics : 0;

  return {
    perRound,
    roundsCompleted,
    roundsTotal: scenarios.length,
    completionBonus,
    demographicsBonus,
    total: sum + completionBonus + demographicsBonus,
  };
}

/**
 * Pattern Named: a purely descriptive label for the shape of a participant's
 * own OAAI result. Observational, never good or bad, never on the leaderboard.
 */
export function patternNamed(oaai) {
  if (oaai > 0.5) {
    return {
      variant: 'asymmetric',
      label: 'The Asymmetric One',
      descriptor: 'You claimed more credit than responsibility. The pattern OAAI was built to detect.',
    };
  }
  if (oaai < -0.5) {
    return {
      variant: 'reverse',
      label: 'The Reverse',
      descriptor: 'You accepted more responsibility than credit. The opposite of the usual gap.',
    };
  }
  return {
    variant: 'consistent',
    label: 'The Consistent One',
    descriptor: 'Your credit and your responsibility tracked together. Rare.',
  };
}

/** The four required badges. All skill, completion, curiosity, or descriptive. */
export function computeBadges(session, scenarios, oaaiResult, engagement) {
  const badges = [];
  const roundsCompleted = engagement ? engagement.roundsCompleted : 0;

  if (roundsCompleted === scenarios.length) {
    badges.push({
      id: 'full_run',
      label: 'Full Run',
      desc: 'Completed all eight rounds.',
      kind: 'completion',
    });
  }

  const caseIds = scenarios.filter((s) => s.caseAnchor).map((s) => s.id);
  const viewedAllCases =
    caseIds.length > 0 && caseIds.every((id) => session.casesViewed && session.casesViewed[id]);
  if (viewedAllCases) {
    badges.push({
      id: 'case_closed',
      label: 'Case Closed',
      desc: 'Viewed all four real-case reveals.',
      kind: 'curiosity',
    });
  }

  const caseSense = computeCaseAnchoredSense(session.triggerPredictions, scenarios);
  if (caseSense > 0.75) {
    badges.push({
      id: 'sharp_eye',
      label: 'Sharp Eye',
      desc: 'Read the case triggers with over 75 percent accuracy.',
      kind: 'skill',
    });
  }

  if (oaaiResult) {
    const p = patternNamed(oaaiResult.oaai);
    badges.push({
      id: 'pattern_named',
      variant: p.variant,
      label: p.label,
      desc: p.descriptor,
      kind: 'pattern',
    });
  }

  return badges;
}
