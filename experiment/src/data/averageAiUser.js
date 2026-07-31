/**
 * The Average AI User: Sam
 *
 * Sam is the empirical counterpart to the formal "protected user" entity in the
 * OAAI thesis. Sam appears at three moments only:
 *   1. Introduction screen, before scenarios
 *   2. Inside scenarios where affectedParty.role === 'average_ai_user'
 *   3. In the results debrief
 *
 * Scientific guardrail: Sam must NOT appear between the ownership question and
 * the accountability question within a single scenario. Sam frames the
 * experiment, not the individual slider.
 *
 * No em dashes anywhere.
 */

const AVERAGE_AI_USER = {
  name: 'Sam',
  tagline: 'Sam is who the rules are meant to protect.',
  properties: [
    'Uses AI tools every day for work, questions, and company.',
    'Has never read a terms of service all the way through. Few people have.',
    'Cannot look inside the AI to check how it was built or trained.',
    'Assumes that if a company released it, it is reasonably safe to use.',
    'Will read a plain warning if it is clear and put in front of them.',
    'Is sometimes lonely, anxious, grieving, or young. Like everyone.',
  ],
  note: "In the framework, Sam's right to safety cannot be signed away by fine print. A company cannot move its responsibility onto Sam.",
};

export default AVERAGE_AI_USER;
