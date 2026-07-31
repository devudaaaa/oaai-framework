# OAAI Experiment (app)

A ground-up React rebuild of the OAAI experiment. One codebase, two modes:

- **Survey** is the clean research baseline. One screen per scenario, both
  questions visible.
- **Boss Game** is the engagement build. You run the company, predict the
  accountability triggers, make the call, earn an Engagement Score, and climb a
  weekly leaderboard.

The 1 to 7 ownership and accountability questions, their scale, and their order
are frozen and identical across both modes. Scoring in game mode is
direction-neutral: points come from engagement signals only, never from which
way you answered.

No em dashes anywhere in this codebase. Please keep it that way.

## Run it

```bash
npm install
npm run dev      # local dev server with hot reload
npm run build    # static build to dist/
npm run preview  # serve the production build locally
```

## Deploy (static, no backend)

`vite.config.js` sets `base: './'`, so the contents of `dist/` run from any path
on GitHub Pages or devudaaaa.xyz with no extra config. Build, then publish
`dist/`.

## The two data destinations (never joined)

| | Destination A: Research | Destination B: Leaderboard |
|---|---|---|
| File | `src/lib/research.js` | `src/lib/leaderboard.js` |
| Carries | anonymous session id, demographics, OAAI, domain and trigger gap, timing | pseudonym, Engagement Score, weekly cycle id, a fresh unrelated id |
| Never carries | pseudonym, Engagement Score | any Likert answer, OAAI, choices, trigger predictions, the research session id |
| Write path | Google Form (no-cors POST) | a separate Google Form (no-cors POST) |
| Read path | not read back | published Google Sheet CSV |

A dev guard, `assertSeparation`, throws if a leaderboard entry ever carries a
research field. The two ids are generated independently.

## Connect the backends

See `GOOGLE_FORMS_SETUP.md`. In short:

1. Create the research form, paste its id and entry ids into `GF_RESEARCH` in
   `src/lib/research.js`.
2. Create the leaderboard form, paste its id and entry ids into `GF_LEADERBOARD`
   in `src/lib/leaderboard.js`.
3. Link the leaderboard form to a sheet, publish that sheet to the web as CSV,
   and paste the CSV url into `LEADERBOARD_CSV_URL`.

Until configured, research falls back to a local download or copy, and the
leaderboard shows your own local entry.

## Weekly rewards

Each ISO week is its own leaderboard cycle (`cycleId`, for example `2026-W26`).
At the end of a cycle, the top three players can email `omg@devudaaaa.xyz` to
claim a reward, and Devudalab contacts them. No email is collected in the app.

## Where things live

```
src/
  data/        scenarios, Sam, domains, triggers, choices (measurement frozen)
  lib/         oaai (ported), engagement (answer-neutral), research, leaderboard,
               parity, storage, format
  components/  LikertScale, TriggerPuzzle, GapBars, MeterBar, SamCard, SamBadge,
               BadgeGrid, QuestionText, ProgressBar, Footer
  screens/     Landing, Consent, ModeSelect, Demographics, SamIntro, Results
               survey/ScenarioSurvey
               game/GameRound  (the seven beats)
               leaderboard/LeaderboardEntry, LeaderboardView
  state/       SessionContext (one reducer)
  styles/      tokens.css, app.css
```

## Parity

`src/lib/parity.js` runs a fixture through the ported `computeOAAI` on load in
dev and logs to the console, confirming the rebuilt calculator matches the v2
numbers.
