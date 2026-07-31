// Human-readable labels for scenario domains.
export const DOMAINS = {
  creative: 'Creative',
  analytical: 'Analytical',
  technical: 'Technical',
  physical_safety: 'Physical Safety',
  discrimination: 'Discrimination',
  synthetic_affection: 'Synthetic Affection',
};

export function domainLabel(key) {
  return DOMAINS[key] || key;
}
