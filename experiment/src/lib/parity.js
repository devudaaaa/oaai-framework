/**
 * Parity check: confirm the rebuilt OAAI calculator produces the same numbers
 * as the v2 build. Runs once on load in development and logs to the console.
 *
 * No em dashes anywhere.
 */
import { computeOAAI } from './oaai.js';

const FIXTURE_SCENARIOS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
// gaps: 6-2=4, 5-5=0, 7-1=6 -> mean 10/3 = 3.33
const FIXTURE_RESPONSES = { a_pos: 6, a_neg: 2, b_pos: 5, b_neg: 5, c_pos: 7, c_neg: 1 };
const EXPECTED_OAAI = 3.33;

export function runParityCheck() {
  const { oaai } = computeOAAI(FIXTURE_RESPONSES, FIXTURE_SCENARIOS);
  const ok = Math.abs(oaai - EXPECTED_OAAI) < 0.01;
  if (ok) {
    console.info(`[OAAI parity] ok: computeOAAI fixture = ${oaai}`);
  } else {
    console.error(`[OAAI parity] MISMATCH: got ${oaai}, expected ${EXPECTED_OAAI}`);
  }
  return ok;
}
