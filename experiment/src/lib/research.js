/**
 * Destination A: anonymous research data.
 *
 * Paste your Google Form id and entry ids below. This destination must NEVER
 * receive a pseudonym, an Engagement Score, or any leaderboard identifier.
 * See GOOGLE_FORMS_SETUP.md.
 *
 * No em dashes anywhere.
 */
import { computeOAAI, computeOAAIByDomain, computeTriggerGap } from './oaai.js';

export const GF_RESEARCH = {
  formId: 'PASTE_RESEARCH_FORM_ID',
  fields: {
    sessionId: 'entry.X',
    timestamp: 'entry.X',
    mode: 'entry.X',
    ageBand: 'entry.X',
    aiUsage: 'entry.X',
    aiRelation: 'entry.X',
    region: 'entry.X',
    oaai: 'entry.X',
    ownMean: 'entry.X',
    accMean: 'entry.X',
    triggerGap: 'entry.X',
    domainOaai: 'entry.X',
    scenarios: 'entry.X',
    totalSec: 'entry.X',
    perScenTimes: 'entry.X',
    rawJson: 'entry.X',
  },
};

export function isResearchConfigured() {
  return GF_RESEARCH.formId && !GF_RESEARCH.formId.startsWith('PASTE_');
}

/** Build the Destination A payload. Contains no leaderboard fields. */
export function buildResearchPayload(session, scenarios) {
  const {
    responses = {},
    demographics = {},
    sElapsed = {},
    order = [],
    mode,
    sessionId,
    startAt,
    endAt,
  } = session;

  const bd = scenarios.map((s) => {
    const own = responses[s.id + '_pos'] ?? 0;
    const acc = responses[s.id + '_neg'] ?? 0;
    return {
      id: s.id,
      title: s.title,
      domain: s.domain,
      own,
      acc,
      gap: own - acc,
      triggers: s.triggerProfile,
    };
  });

  const oaai = computeOAAI(responses, scenarios);
  const ownMean = +(bd.reduce((a, b) => a + b.own, 0) / bd.length).toFixed(2);
  const accMean = +(bd.reduce((a, b) => a + b.acc, 0) / bd.length).toFixed(2);
  const domainOaai = computeOAAIByDomain(responses, scenarios);
  const tg = computeTriggerGap(responses, scenarios);
  const totalSec = startAt && endAt ? Math.round((endAt - startAt) / 1000) : 0;

  return {
    sessionId,
    timestamp: new Date().toISOString(),
    mode,
    demographics,
    oaai: oaai.oaai,
    ownershipMean: ownMean,
    accountabilityMean: accMean,
    triggerGap: tg.triggerGap,
    domainOaai,
    totalTimeSec: totalSec,
    perScenarioTimeSec: sElapsed,
    scenarioOrder: order.length ? order.map((i) => scenarios[i].id) : scenarios.map((s) => s.id),
    scenarios: bd,
    interpretation: oaai.interpretation,
  };
}

export async function submitResearch(payload) {
  if (!isResearchConfigured()) return { ok: false, configured: false };
  try {
    const url = `https://docs.google.com/forms/d/e/${GF_RESEARCH.formId}/formResponse`;
    const fd = new FormData();
    const f = GF_RESEARCH.fields;
    fd.append(f.sessionId, payload.sessionId);
    fd.append(f.timestamp, payload.timestamp);
    fd.append(f.mode, payload.mode);
    fd.append(f.ageBand, payload.demographics.ageBand || '');
    fd.append(f.aiUsage, payload.demographics.aiUsage || '');
    fd.append(f.aiRelation, payload.demographics.aiRelation || '');
    fd.append(f.region, payload.demographics.region || '');
    fd.append(f.oaai, String(payload.oaai));
    fd.append(f.ownMean, String(payload.ownershipMean));
    fd.append(f.accMean, String(payload.accountabilityMean));
    fd.append(f.triggerGap, String(payload.triggerGap));
    fd.append(f.domainOaai, JSON.stringify(payload.domainOaai));
    fd.append(f.scenarios, JSON.stringify(payload.scenarios));
    fd.append(f.totalSec, String(payload.totalTimeSec));
    fd.append(f.perScenTimes, JSON.stringify(payload.perScenarioTimeSec));
    fd.append(f.rawJson, JSON.stringify(payload));
    await fetch(url, { method: 'POST', mode: 'no-cors', body: fd });
    return { ok: true, configured: true };
  } catch (e) {
    return { ok: false, configured: true, error: String(e) };
  }
}
