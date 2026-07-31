/**
 * Destination B: public leaderboard.
 *
 * A SEPARATE Google Form for writing, and a published Google Sheet CSV for
 * reading ranks back. This destination must NEVER receive a Likert answer, an
 * OAAI score, a protective choice, a trigger prediction, or the research
 * session id. It carries only: pseudonym, Engagement Score, weekly cycle id,
 * and a fresh unrelated leaderboard id.
 *
 * Weekly cycles: each ISO week is its own board. The top three of the current
 * cycle may email omg@devudaaaa.xyz to claim a reward. No email is collected
 * in the app.
 *
 * See GOOGLE_FORMS_SETUP.md. No em dashes anywhere.
 */
import { randomId } from './storage.js';

export const GF_LEADERBOARD = {
  formId: 'PASTE_LEADERBOARD_FORM_ID',
  fields: {
    pseudonym: 'entry.X',
    engagementScore: 'entry.X',
    cycleId: 'entry.X',
    leaderboardId: 'entry.X',
  },
};

// Published-to-web CSV of the leaderboard responses sheet (File, Share, Publish
// to web, CSV). Used only to read ranks back for display.
export const LEADERBOARD_CSV_URL = 'PASTE_LEADERBOARD_CSV_URL';

export const CLAIM_EMAIL = 'omg@devudaaaa.xyz';

export function isLeaderboardConfigured() {
  return GF_LEADERBOARD.formId && !GF_LEADERBOARD.formId.startsWith('PASTE_');
}

export function isLeaderboardReadable() {
  return LEADERBOARD_CSV_URL && !LEADERBOARD_CSV_URL.startsWith('PASTE_');
}

// ISO 8601 week id, e.g. "2026-W26". One leaderboard cycle per week.
export function cycleId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // shift to the Thursday of this week
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7,
    );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function cycleLabel(id = cycleId()) {
  return `Cycle ${id}`;
}

/** Build the Destination B entry. Carries no research fields. */
export function buildLeaderboardEntry(pseudonym, engagementScore) {
  return {
    pseudonym: String(pseudonym || '').slice(0, 40),
    engagementScore: Number(engagementScore) || 0,
    cycleId: cycleId(),
    leaderboardId: randomId('lb'), // unrelated to the research session id
  };
}

export async function submitLeaderboard(entry) {
  if (!isLeaderboardConfigured()) return { ok: false, configured: false };
  try {
    const url = `https://docs.google.com/forms/d/e/${GF_LEADERBOARD.formId}/formResponse`;
    const fd = new FormData();
    const f = GF_LEADERBOARD.fields;
    fd.append(f.pseudonym, entry.pseudonym);
    fd.append(f.engagementScore, String(entry.engagementScore));
    fd.append(f.cycleId, entry.cycleId);
    fd.append(f.leaderboardId, entry.leaderboardId);
    await fetch(url, { method: 'POST', mode: 'no-cors', body: fd });
    return { ok: true, configured: true };
  } catch (e) {
    return { ok: false, configured: true, error: String(e) };
  }
}

// Minimal CSV parser that handles quoted fields and commas inside quotes.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function pick(headers, row, names) {
  for (const n of names) {
    const idx = headers.findIndex((h) => h.trim().toLowerCase() === n.toLowerCase());
    if (idx >= 0) return row[idx];
  }
  return undefined;
}

/** Read ranks for a cycle (default: current week) from the published Sheet CSV. */
export async function fetchLeaderboard({ cycle } = {}) {
  if (!isLeaderboardReadable()) return null;
  const targetCycle = cycle || cycleId();
  const res = await fetch(LEADERBOARD_CSV_URL);
  const text = await res.text();
  const rows = parseCSV(text).filter((r) => r.length > 1);
  if (rows.length === 0) return [];
  const headers = rows[0];
  const entries = rows.slice(1).map((r) => ({
    pseudonym: pick(headers, r, ['pseudonym', 'name']) || 'anon',
    engagementScore: Number(pick(headers, r, ['engagementscore', 'engagement score', 'score']) || 0),
    cycleId: pick(headers, r, ['cycleid', 'cycle id', 'cycle']) || '',
  }));
  const inCycle = entries.filter((e) => e.cycleId === targetCycle);
  inCycle.sort((a, b) => b.engagementScore - a.engagementScore);
  return inCycle.map((e, i) => ({ rank: i + 1, ...e }));
}

/**
 * Dev guard: prove the leaderboard entry never carries a research field, and
 * that the leaderboard id is not the research session id.
 */
export function assertSeparation(researchPayload, leaderboardEntry) {
  const forbiddenOnB = [
    'oaai',
    'ownershipMean',
    'accountabilityMean',
    'triggerGap',
    'scenarios',
    'sessionId',
    'demographics',
    'protectiveChoices',
    'triggerPredictions',
  ];
  for (const k of forbiddenOnB) {
    if (k in leaderboardEntry) {
      throw new Error(`Leaderboard entry leaked research field: ${k}`);
    }
  }
  if (
    researchPayload &&
    leaderboardEntry &&
    researchPayload.sessionId === leaderboardEntry.leaderboardId
  ) {
    throw new Error('Leaderboard id must not equal research session id');
  }
  return true;
}
