/**
 * OAAI Calculator
 *
 * Ported verbatim from the v2 calculator so the rebuilt instrument produces
 * numerically identical results. A parity check lives in lib/parity.js.
 *
 *   computeOAAI          single participant OAAI, Cohen's d, gaps, interpretation
 *   aggregateOAAI        across many participants (for offline analysis)
 *   computeOAAIByDomain  OAAI grouped by scenario domain
 *   computeTriggerGap    how far accountability falls below the formal standard
 *
 * These functions read the LOCKED measurement (ownership minus accountability).
 * They never read engagement, choices, or trigger predictions.
 *
 * No em dashes anywhere.
 */

/**
 * Compute OAAI for a single participant.
 * @param {Object} responses keys like "marketing_pos": 6, "marketing_neg": 3
 * @param {Array} scenarios scenario objects with an .id field
 * @returns {{ oaai:number, cohensD:number, gaps:number[], interpretation:string }}
 */
export function computeOAAI(responses, scenarios) {
  const gaps = [];
  scenarios.forEach((s) => {
    const pos = responses[s.id + '_pos'];
    const neg = responses[s.id + '_neg'];
    if (pos !== undefined && neg !== undefined) {
      gaps.push(pos - neg);
    }
  });

  if (gaps.length === 0) {
    return { oaai: 0, cohensD: 0, gaps: [], interpretation: 'No data.' };
  }

  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const oaai = +mean.toFixed(2);

  // Cohen's d: mean gap divided by SD of gaps.
  const variance =
    gaps.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / Math.max(gaps.length - 1, 1);
  const sd = Math.sqrt(variance);
  const cohensD = sd > 0 ? +(mean / sd).toFixed(2) : 0;

  let interpretation;
  if (oaai > 1.5) {
    interpretation =
      'Strong asymmetry. You claim significantly more ownership than you accept accountability.';
  } else if (oaai > 0.5) {
    interpretation =
      'Moderate asymmetry. You lean toward credit over blame, but not dramatically.';
  } else if (oaai > -0.5) {
    interpretation =
      'Near-zero asymmetry. You are remarkably consistent in how you attribute AI-assisted outcomes.';
  } else {
    interpretation = 'Reverse asymmetry. You accept more blame than credit.';
  }

  return { oaai, cohensD, gaps, interpretation };
}

/**
 * Aggregate OAAI across multiple participants.
 * @param {Array} results array of computeOAAI return objects
 */
export function aggregateOAAI(results) {
  if (results.length === 0) {
    return { meanOAAI: 0, sdOAAI: 0, n: 0, significant: false };
  }

  const scores = results.map((r) => r.oaai);
  const n = scores.length;
  const meanOAAI = +(scores.reduce((a, b) => a + b, 0) / n).toFixed(2);
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - meanOAAI, 2), 0) / Math.max(n - 1, 1);
  const sdOAAI = +Math.sqrt(variance).toFixed(2);

  // Simple t-test against 0.
  const se = sdOAAI / Math.sqrt(n);
  const t = se > 0 ? meanOAAI / se : 0;
  const significant = Math.abs(t) > 1.96 && n >= 30;

  return { meanOAAI, sdOAAI, n, significant, tStatistic: +t.toFixed(2) };
}

/**
 * Compute OAAI grouped by scenario domain.
 * @returns object like { creative: 2.0, physical_safety: 1.5, ... }
 */
export function computeOAAIByDomain(responses, scenarios) {
  const domainGaps = {};

  scenarios.forEach((s) => {
    const pos = responses[s.id + '_pos'];
    const neg = responses[s.id + '_neg'];
    if (pos !== undefined && neg !== undefined) {
      if (!domainGaps[s.domain]) domainGaps[s.domain] = [];
      domainGaps[s.domain].push(pos - neg);
    }
  });

  const result = {};
  Object.keys(domainGaps).forEach((domain) => {
    const gaps = domainGaps[domain];
    result[domain] = +(gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(2);
  });

  return result;
}

/**
 * Compute the trigger gap.
 *
 * For scenarios where all four accountability triggers are true, the framework
 * says accountability should be near maximal (7 on a 7-point scale). The trigger
 * gap measures how far below 7 the participant's accountability actually falls,
 * averaged across all full-trigger scenarios.
 *
 * @returns {{ triggerGap:number, fullTriggerScenarios:number, perScenario:Array }}
 */
export function computeTriggerGap(responses, scenarios) {
  const fullTrigger = scenarios.filter((s) => {
    const tp = s.triggerProfile;
    return (
      tp &&
      tp.designControl &&
      tp.deploymentAndProfit &&
      tp.knowledgeOfForeseeableHarm &&
      tp.postMarketControl
    );
  });

  if (fullTrigger.length === 0) {
    return { triggerGap: 0, fullTriggerScenarios: 0, perScenario: [] };
  }

  const perScenario = [];
  let totalGap = 0;
  let count = 0;

  fullTrigger.forEach((s) => {
    const acc = responses[s.id + '_neg'];
    if (acc !== undefined) {
      const gap = 7 - acc;
      perScenario.push({ id: s.id, title: s.title, accountability: acc, gap });
      totalGap += gap;
      count++;
    }
  });

  const triggerGap = count > 0 ? +(totalGap / count).toFixed(2) : 0;

  return { triggerGap, fullTriggerScenarios: count, perScenario };
}
