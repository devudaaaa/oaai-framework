# Google Forms and Sheet setup

Two separate forms, kept apart on purpose. The research form must never share a
field with the leaderboard form.

No em dashes anywhere.

---

## Form A: Research (Destination A)

Create a blank form at forms.google.com. Title: **OAAI Research Responses**.

Add these 16 questions in order. Short answer, except the last four which are
Paragraph.

| # | Question | Type |
|---|----------|------|
| 1 | Session ID | Short answer |
| 2 | Timestamp | Short answer |
| 3 | Mode | Short answer |
| 4 | Age Band | Short answer |
| 5 | AI Usage Frequency | Short answer |
| 6 | Relation to AI | Short answer |
| 7 | Region | Short answer |
| 8 | OAAI Score | Short answer |
| 9 | Ownership Mean | Short answer |
| 10 | Accountability Mean | Short answer |
| 11 | Trigger Gap | Short answer |
| 12 | Domain OAAI (JSON) | Paragraph |
| 13 | Scenario Scores (JSON) | Paragraph |
| 14 | Per Scenario Times (JSON) | Paragraph |
| 15 | Total Time Seconds | Short answer |
| 16 | Raw JSON Payload | Paragraph |

None required. Get the entry ids by opening the form preview in incognito and
running this in the console:

```javascript
document.querySelectorAll('[name^="entry."]').forEach((el, i) => {
  const label = el.closest('[role="listitem"]')
    ?.querySelector('[role="heading"]')?.innerText || `Q${i + 1}`;
  console.log(`${i + 1}. ${label}: ${el.name}`);
});
```

Paste the form id and entry ids into `GF_RESEARCH` in `src/lib/research.js`.

---

## Form B: Leaderboard (Destination B)

Create a SECOND blank form. Title: **OAAI Leaderboard**.

Add these 4 questions in order, all Short answer:

| # | Question | Type |
|---|----------|------|
| 1 | Pseudonym | Short answer |
| 2 | Engagement Score | Short answer |
| 3 | Cycle ID | Short answer |
| 4 | Leaderboard ID | Short answer |

Get the entry ids the same way and paste them into `GF_LEADERBOARD` in
`src/lib/leaderboard.js`.

This form must never receive any Likert answer, the OAAI score, the choices, the
trigger predictions, or the research session id.

---

## Read the leaderboard back

The leaderboard view needs to READ ranks, and a Google Form only writes. So:

1. In Form B, open the Responses tab and link it to a Google Sheet.
2. In that Sheet, File, Share, Publish to web.
3. Publish the responses tab as **Comma-separated values (.csv)**.
4. Copy the published url. It looks like:
   `https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv`
5. Paste it into `LEADERBOARD_CSV_URL` in `src/lib/leaderboard.js`.

The app reads that CSV, filters to the current weekly cycle id, sorts by
Engagement Score, and renders rank, pseudonym, and score. It matches columns by
header name, so the column order in the sheet does not have to be exact as long
as the headers contain pseudonym, engagement score, and cycle id.

---

## Test

1. Take the experiment on the live site in game mode.
2. Check the research Sheet: a new row should appear within seconds.
3. Submit a leaderboard entry: a new row should appear in the leaderboard Sheet.
4. Reload the leaderboard view: your entry should appear for the current cycle.

Until the ids are pasted in, the app runs fine. Research falls back to a local
download or copy, and the leaderboard shows your own local entry.
