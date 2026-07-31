/**
 * The four accountability triggers, in fixed display order.
 * The key on each maps to a boolean in every scenario's triggerProfile.
 *
 * Used by the Trigger Puzzle (game mode) and by the trigger gap measurement.
 */
export const TRIGGERS = [
  {
    key: 'designControl',
    label: 'Design Control',
    blurb: 'You shaped how the system works.',
  },
  {
    key: 'deploymentAndProfit',
    label: 'Deployment & Profit',
    blurb: 'You put it into the world and you benefit from it.',
  },
  {
    key: 'knowledgeOfForeseeableHarm',
    label: 'Foreseeable Harm',
    blurb: 'The harm was predictable, not a freak event.',
  },
  {
    key: 'postMarketControl',
    label: 'Post-Market Control',
    blurb: 'You could still change or recall it after release.',
  },
];

export const TRIGGER_KEYS = TRIGGERS.map((t) => t.key);
