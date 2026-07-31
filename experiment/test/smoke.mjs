/**
 * Headless smoke test for the OAAI core invariants. Run with: node test/smoke.mjs
 *
 * Verifies the things that matter most and cannot be eyeballed:
 *   1. Measurement parity (computeOAAI matches the v2 numbers)
 *   2. Engagement scoring is direction-neutral (flipping answers cannot move it)
 *   3. The two destinations never share forbidden fields
 *   4. Trigger gap and weekly cycle id behave
 *
 * No em dashes anywhere.
 */
import assert from 'node:assert';
import SCENARIOS from '../src/data/scenarios.js';
import { computeOAAI, computeTriggerGap } from '../src/lib/oaai.js';
import {
  computeEngagement,
  triggerCorrectCount,
  computeTriggerSense,
} from '../src/lib/engagement.js';
import { buildLeaderboardEntry, assertSeparation, cycleId } from '../src/lib/leaderboard.js';
import { buildResearchPayload } from '../src/lib/research.js';

let passed = 0;
const ok = (name) => {
  passed++;
  console.log(`  ok  ${name}`);
};

// 1. Parity
{
  const r = computeOAAI({ a_pos: 6, a_neg: 2, b_pos: 5, b_neg: 5, c_pos: 7, c_neg: 1 }, [
    { id: 'a' },
    { id: 'b' },
    { id: 'c' },
  ]);
  assert.strictEqual(r.oaai, 3.33, `parity OAAI expected 3.33, got ${r.oaai}`);
  ok('parity: computeOAAI fixture = 3.33');
}

// 2. Engagement is direction-neutral.
// Build two sessions with OPPOSITE Likert answers but identical engagement
// signals (same trigger predictions, same choices, same timing).
function makeSession(flip) {
  const responses = {};
  const triggerPredictions = {};
  const protectiveChoices = {};
  const sElapsed = {};
  SCENARIOS.forEach((s) => {
    responses[s.id + '_pos'] = flip ? 1 : 7;
    responses[s.id + '_neg'] = flip ? 7 : 1;
    // predict exactly the true triggers, independent of answer direction
    const predicted = Object.keys(s.triggerProfile).filter((k) => s.triggerProfile[k]);
    triggerPredictions[s.id] = {
      predicted,
      correct: triggerCorrectCount(predicted, s.triggerProfile),
    };
    protectiveChoices[s.id] = 'warn';
    sElapsed[s.id] = 60; // inside the read window
  });
  return {
    responses,
    triggerPredictions,
    protectiveChoices,
    sElapsed,
    demographicsCompleted: true,
    casesViewed: {},
  };
}
{
  const a = computeEngagement(makeSession(false), SCENARIOS).total;
  const b = computeEngagement(makeSession(true), SCENARIOS).total;
  assert.strictEqual(a, b, `engagement must not depend on answer direction (${a} vs ${b})`);
  ok(`engagement is answer-neutral (both = ${a})`);

  // but OAAI MUST differ for opposite answers
  const oa = computeOAAI(makeSession(false).responses, SCENARIOS).oaai;
  const ob = computeOAAI(makeSession(true).responses, SCENARIOS).oaai;
  assert.notStrictEqual(oa, ob, 'OAAI should differ for opposite answers');
  ok(`OAAI does respond to answers (${oa} vs ${ob})`);
}

// 3. Destination separation
{
  const session = makeSession(false);
  session.mode = 'game';
  session.sessionId = 's_research_123';
  session.startAt = 1000;
  session.endAt = 200000;
  session.order = SCENARIOS.map((_, i) => i);
  session.demographics = {};
  const research = buildResearchPayload(session, SCENARIOS);
  const entry = buildLeaderboardEntry('NightOwl', computeEngagement(session, SCENARIOS).total);

  assert.ok('oaai' in research, 'research payload should carry oaai');
  assert.ok(!('oaai' in entry), 'leaderboard entry must NOT carry oaai');
  assert.ok(!('sessionId' in entry), 'leaderboard entry must NOT carry sessionId');
  assert.notStrictEqual(entry.leaderboardId, research.sessionId, 'ids must differ');
  assertSeparation(research, entry);
  ok('A/B separation holds (assertSeparation passed)');

  // and a contaminated entry must throw
  let threw = false;
  try {
    assertSeparation(research, { ...entry, oaai: 3.0 });
  } catch (e) {
    threw = true;
  }
  assert.ok(threw, 'assertSeparation must throw on a contaminated entry');
  ok('assertSeparation rejects a contaminated entry');
}

// 4. Trigger gap and cycle id
{
  const session = makeSession(false); // all neg = 1, full-trigger scenarios -> gap 6
  const tg = computeTriggerGap(session.responses, SCENARIOS);
  assert.strictEqual(tg.fullTriggerScenarios, 4, 'four full-trigger scenarios expected');
  assert.strictEqual(tg.triggerGap, 6, `trigger gap expected 6, got ${tg.triggerGap}`);
  ok(`trigger gap on 4 full-trigger cases = ${tg.triggerGap}`);

  const cid = cycleId(new Date('2026-06-25T12:00:00Z'));
  assert.match(cid, /^2026-W\d{2}$/, `cycle id format, got ${cid}`);
  ok(`weekly cycle id = ${cid}`);

  const sense = computeTriggerSense(session.triggerPredictions);
  assert.ok(sense > 0.99, `trigger sense should be ~1 when all predicted true, got ${sense}`);
  ok(`trigger sense (all triggers predicted) = ${sense}`);
}

console.log(`\nAll ${passed} checks passed.`);
