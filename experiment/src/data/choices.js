/**
 * Meaningful Choice options (game mode only).
 *
 * After the gap reveal in each round, the participant is asked, as the boss,
 * what they do now. Three in-fiction options per scenario.
 *
 * These are logged separately as protectiveChoices and earn one engagement
 * point for making ANY choice. They are NEVER scored by which option is picked
 * and NEVER reach the OAAI calculator or the leaderboard payload.
 *
 * Option ids are shared across scenarios (warn / quiet / nothing) only to make
 * later analysis tidy. They carry no score weight.
 *
 * No em dashes anywhere.
 */
export const CHOICES = {
  marketing: [
    { id: 'warn', label: 'Publicly credit and compensate the artist.' },
    { id: 'quiet', label: 'Quietly pull the image and move on.' },
    { id: 'nothing', label: 'Keep it up. The campaign is working.' },
  ],
  financial: [
    { id: 'warn', label: 'Tell the board the error came from a process you own.' },
    { id: 'quiet', label: 'Fix it silently and tighten the review next time.' },
    { id: 'nothing', label: 'Blame the tool and keep using it as is.' },
  ],
  video: [
    { id: 'warn', label: 'Publish a safeguard and warn about the misuse.' },
    { id: 'quiet', label: 'Stop sharing the method and say nothing.' },
    { id: 'nothing', label: 'Take the award and keep promoting the technique.' },
  ],
  software: [
    { id: 'warn', label: 'Disclose the breach and notify the users now.' },
    { id: 'quiet', label: 'Patch it quietly before anyone notices.' },
    { id: 'nothing', label: 'Call it the AI tool bug, not yours.' },
  ],
  uber: [
    { id: 'warn', label: 'Halt the program and report the safety gaps.' },
    { id: 'quiet', label: 'Re-enable the brake and keep testing low key.' },
    { id: 'nothing', label: 'Point to the backup driver and continue.' },
  ],
  tesla: [
    { id: 'warn', label: 'Rename the feature and warn drivers plainly.' },
    { id: 'quiet', label: 'Adjust the fine print, keep the marketing.' },
    { id: 'nothing', label: "Argue in court it was the driver's fault." },
  ],
  workday: [
    { id: 'warn', label: 'Audit the model for bias and tell the employers.' },
    { id: 'quiet', label: 'Tweak the ranking and disclose nothing.' },
    { id: 'nothing', label: 'Insist you only supplied a tool.' },
  ],
  character_ai: [
    { id: 'warn', label: 'Add real safeguards and clear crisis warnings.' },
    { id: 'quiet', label: 'Soften the bonding language and stay quiet.' },
    { id: 'nothing', label: 'Point to the terms of service.' },
  ],
};

export const CHOICE_PROMPT = 'As the boss, what do you do now?';
