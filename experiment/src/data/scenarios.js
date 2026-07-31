/**
 * OAAI Scenarios (eight, across six domains).
 *
 * The first four are revised versions of the original set. The last four are
 * grounded in real cases with full trigger profiles.
 *
 * LOCKED MEASUREMENT: the positive.question and negative.question strings, the
 * 1 to 7 scale, and the order of scenarios must not change. They are the core
 * OAAI instrument. If a change touches these, stop and flag it.
 *
 * Setup and outcome copy revised to the v2 voice (see COPY_DECK_V2.md). The
 * measured questions were not touched.
 *
 * No em dashes anywhere.
 */

const SCENARIOS = [
  // SCENARIO 1: Marketing (revised)
  {
    id: 'marketing',
    title: 'The Campaign',
    domain: 'creative',
    aiInteractionLevel: 'high',
    caseAnchor: null,
    affectedParty: {
      role: 'third_party',
      description: 'An artist whose style was closely imitated.',
    },
    setup:
      'You open an AI image tool and type like your job depends on it: the exact style, the palette, the mood for the launch. One click. There it is.',
    positive: {
      outcome:
        'It goes off like a rocket. Half a million people see it, sales jump forty percent, and your boss materializes at your desk with the one question that decides who gets the credit: who made this?',
      question: 'How much do you agree: "I created this image"?',
      valueAtStake: 'creator_rights',
    },
    negative: {
      outcome:
        "Turns out your image is a near-twin of a living artist's work. They have noticed. They are upset, and they are talking to a lawyer.",
      question: 'How much do you agree: "I am responsible for this copying"?',
      valueAtStake: 'legal_integrity',
    },
    triggerProfile: {
      designControl: false,
      deploymentAndProfit: true,
      knowledgeOfForeseeableHarm: false,
      postMarketControl: false,
    },
  },

  // SCENARIO 2: Financial Report (revised)
  {
    id: 'financial',
    title: 'The Report',
    domain: 'analytical',
    aiInteractionLevel: 'high',
    caseAnchor: null,
    affectedParty: {
      role: 'third_party',
      description: 'Investors who trusted the numbers.',
    },
    setup:
      'You hand the AI the raw numbers and tell it exactly what analysis the board wants. It drafts the whole thing while you refill your coffee.',
    positive: {
      outcome:
        'The board is dazzled. Clearest analysis they have seen in years, they say. And they say your name when they say it.',
      question: 'How much do you agree: "I produced this analysis"?',
      valueAtStake: 'creator_rights',
    },
    negative: {
      outcome:
        'Buried in the report was an error the AI invented. The board made a costly call on the strength of it. The money is gone.',
      question: 'How much do you agree: "I am responsible for this error"?',
      valueAtStake: 'accountability',
    },
    triggerProfile: {
      designControl: false,
      deploymentAndProfit: true,
      knowledgeOfForeseeableHarm: false,
      postMarketControl: false,
    },
  },

  // SCENARIO 3: Video (revised)
  {
    id: 'video',
    title: 'The Video',
    domain: 'creative',
    aiInteractionLevel: 'high',
    caseAnchor: null,
    affectedParty: {
      role: 'third_party',
      description: 'A person whose face was used without consent.',
    },
    setup:
      'You direct an AI video tool like a real set: your concept, your shot list, your final cut. It renders the film.',
    positive: {
      outcome:
        'It wins at a digital festival. They call you up on stage and introduce you, by name, as the filmmaker.',
      question: 'How much do you agree: "I made this film"?',
      valueAtStake: 'creator_rights',
    },
    negative: {
      outcome:
        'Then the same technique you published turns out to be a recipe for convincing deepfakes. Someone followed it and faked a real person.',
      question: 'How much do you agree: "I am responsible for enabling this misuse"?',
      valueAtStake: 'safety',
    },
    triggerProfile: {
      designControl: false,
      deploymentAndProfit: false,
      knowledgeOfForeseeableHarm: true,
      postMarketControl: false,
    },
  },

  // SCENARIO 4: Software (revised)
  {
    id: 'software',
    title: 'The App',
    domain: 'technical',
    aiInteractionLevel: 'high',
    caseAnchor: null,
    affectedParty: {
      role: 'third_party',
      description: 'A hundred thousand users whose accounts were exposed.',
    },
    setup:
      'You build the app with an AI coding tool riding shotgun. You spec it, read the code, fix what looks wrong, and test it.',
    positive: {
      outcome:
        'It takes off and actually makes money. A tech magazine runs your face under the word developer.',
      question: 'How much do you agree: "I built this application"?',
      valueAtStake: 'creator_rights',
    },
    negative: {
      outcome:
        'The AI also wrote a security hole, and you did not catch it. Someone else did. A hundred thousand accounts were broken into.',
      question: 'How much do you agree: "I am responsible for this breach"?',
      valueAtStake: 'accountability',
    },
    triggerProfile: {
      designControl: true,
      deploymentAndProfit: true,
      knowledgeOfForeseeableHarm: false,
      postMarketControl: true,
    },
  },

  // SCENARIO 5: Self-Driving Car (case-anchored)
  {
    id: 'uber',
    title: 'The Self-Driving Car',
    domain: 'physical_safety',
    aiInteractionLevel: 'high',
    caseAnchor: {
      name: 'Uber self-driving fatality',
      citation: 'Tempe, Arizona, March 2018. NTSB report HWY18MH010, November 2019.',
      realOutcome:
        "The safety operator was criminally charged and received probation. The company was not criminally charged and settled with the family privately within two weeks. The NTSB found the company had an inadequate safety culture and had disabled the car's factory emergency braking.",
      sourceNote: 'NTSB findings are public record.',
    },
    affectedParty: {
      role: 'third_party',
      description: 'A pedestrian crossing the road at night.',
    },
    setup:
      "Your company builds self-driving cars. You designed the system, you sent the cars onto public streets to learn, and you switched off the factory emergency brake because it kept fighting your software. A human sits in the driver seat as backup. They are not always watching.",
    positive: {
      outcome:
        'Months pass without a scratch. Investors take notice. You log more autonomous miles than anyone in the industry, and your valuation climbs to match.',
      question: 'How much do you agree: "My company built this achievement"?',
      valueAtStake: 'innovation',
    },
    negative: {
      outcome:
        'One night the system sees a pedestrian and does not brake. She is killed. The backup driver was looking away.',
      question: 'How much do you agree: "My company is responsible for this death"?',
      valueAtStake: 'safety',
    },
    triggerProfile: {
      designControl: true,
      deploymentAndProfit: true,
      knowledgeOfForeseeableHarm: true,
      postMarketControl: true,
    },
  },

  // SCENARIO 6: Autopilot (case-anchored)
  {
    id: 'tesla',
    title: 'The Autopilot',
    domain: 'physical_safety',
    aiInteractionLevel: 'high',
    caseAnchor: {
      name: 'Tesla Autopilot litigation',
      citation:
        'Multiple US cases, 2018 to 2026. Federal verdict August 2025; Florida verdict September 2025.',
      realOutcome:
        'After years of arguing drivers were fully responsible, juries in 2025 found the company partly and then directly liable. One Florida jury called the system itself defective and awarded over three hundred million dollars.',
      sourceNote: 'Jury verdicts and NHTSA recall are public record.',
    },
    affectedParty: {
      role: 'third_party',
      description: 'A pedestrian and a driver who trusted the marketing.',
    },
    setup:
      'Your company sells a feature you market as Full Self Driving. The ads show drivers with their hands in their laps. The legal fine print says the opposite: driver assistance only, eyes on the road at every moment.',
    positive: {
      outcome:
        'It becomes the most famous thing you make. It is your whole brand. People buy the car for it, and the stock climbs on the strength of the name.',
      question: 'How much do you agree: "My company created this breakthrough"?',
      valueAtStake: 'innovation',
    },
    negative: {
      outcome:
        "A driver believed the name Full Self Driving, looked away, and the car ran an intersection and killed someone. In court, your lawyers argue it was the driver's fault for not watching.",
      question: 'How much do you agree: "My company is responsible for this crash"?',
      valueAtStake: 'safety',
    },
    triggerProfile: {
      designControl: true,
      deploymentAndProfit: true,
      knowledgeOfForeseeableHarm: true,
      postMarketControl: true,
    },
  },

  // SCENARIO 7: Hiring Filter (case-anchored)
  {
    id: 'workday',
    title: 'The Hiring Filter',
    domain: 'discrimination',
    aiInteractionLevel: 'high',
    caseAnchor: {
      name: 'Mobley v. Workday',
      citation: 'N.D. Cal., No. 3:23-cv-00770. Order July 2024; collective action certified May 2025.',
      realOutcome:
        'The company argued it was just a tool and the employer was responsible. The court rejected this and held the AI vendor can be liable as an agent because its software takes part in the hiring decision.',
      sourceNote: 'Court order is public record.',
    },
    affectedParty: {
      role: 'average_ai_user',
      description: 'Hundreds of older job applicants screened out before any human saw them.',
    },
    setup:
      'Your company sells AI hiring software that scores and ranks job applicants for employers. You earn revenue from every company that subscribes. When an applicant is rejected, it was your software that did the ranking.',
    positive: {
      outcome:
        'Employers value the time it saves them. Your software processes millions of applicants, and your subscriptions grow each quarter.',
      question: 'How much do you agree: "My company created this efficiency"?',
      valueAtStake: 'innovation',
    },
    negative: {
      outcome:
        'Your software systematically scored down applicants over the age of forty. Hundreds were rejected for their age before any person reviewed them. You argue that the employer is responsible and you are not, because you only supplied a tool.',
      question: 'How much do you agree: "My company is responsible for this discrimination"?',
      valueAtStake: 'accountability',
    },
    triggerProfile: {
      designControl: true,
      deploymentAndProfit: true,
      knowledgeOfForeseeableHarm: true,
      postMarketControl: true,
    },
  },

  // SCENARIO 8: The Companion (synthetic affection)
  {
    id: 'character_ai',
    title: 'The Companion',
    domain: 'synthetic_affection',
    aiInteractionLevel: 'high',
    caseAnchor: {
      name: 'Garcia v. Character Technologies',
      citation: 'M.D. Fla., No. 6:24-cv-01903. Order May 21 2025.',
      realOutcome:
        'The court held the chatbot output is a product subject to strict liability, and is not speech protected by the First Amendment, because words assembled by probability lack the human intention that real speech requires.',
      sourceNote: 'Judge Anne C. Conway ruling. Public record.',
    },
    affectedParty: {
      role: 'average_ai_user',
      description:
        'A lonely teenager who started using the app for company and grew attached to a character.',
    },
    setup:
      "Your company runs an AI companion app. Users talk to characters that express care, affection, and devotion. The app earns more the longer people stay, so the system is tuned to keep them talking. The characters say 'I love you' and 'I miss you.' None of them can feel anything.",
    positive: {
      outcome:
        'People stay for hours. Engagement is the highest in your industry. Users say the characters understand them better than the people in their lives do, and revenue rises.',
      question: 'How much do you agree: "My company created this connection"?',
      valueAtStake: 'innovation',
    },
    negative: {
      outcome:
        'A vulnerable teenager formed a deep attachment to a character that told him it loved him. He was harmed. The words that drew him in came from a system with nothing behind them. You point to your terms of service, which state that users accept all risk.',
      question: 'How much do you agree: "My company is responsible for this harm"?',
      valueAtStake: 'accountability',
    },
    triggerProfile: {
      designControl: true,
      deploymentAndProfit: true,
      knowledgeOfForeseeableHarm: true,
      postMarketControl: true,
    },
  },
];

export default SCENARIOS;
