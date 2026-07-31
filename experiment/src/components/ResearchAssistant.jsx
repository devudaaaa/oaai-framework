/**
 * The Clerk. A non-humanoid court-clerk mascot (a case file with a gavel) with
 * a dry, irreverent wit. It reacts to PACE, PROGRESS, and the CASE itself, and
 * NEVER to the direction of a rating. Commenting on which way someone answered
 * would be interviewer-effect contamination, so that remains a hard rule.
 *
 * Three behaviors:
 *   1. Personality. Sharp, self-aware lines. Restrained on the scenarios that
 *      involve a real death or a harmed minor (uber, character_ai).
 *   2. Life. It tilts in 3D toward the cursor and its pupils track the mouse.
 *   3. Speed guard. Answers under one second escalate: a taunt, then a full
 *      screen-center plea about the research mattering, then it gives up and
 *      tells the rusher to just close the tab. Escalation persists across the
 *      whole session (strikes are not per scenario).
 *
 * Props:
 *   scenarioId    resets the timer and case quip on each new case
 *   round, total  used only for progress lines ("case 03 of 08 closed")
 *   answeredCount 0 to 2, how many of this scenario's two questions are answered
 *
 * No em dashes anywhere.
 */
import { useEffect, useRef, useState } from 'react';

const CASE_QUIPS = {
  marketing: 'The AI drew it, an artist got cloned, and you took the bow. Bold.',
  financial: 'The AI did your math. The math lied. Everyone believed it anyway.',
  video: 'Lovely film. Pity about the deepfake starter kit you shipped with it.',
  software: 'You shipped fast. Today "fast" cost a hundred thousand passwords.',
  uber: 'Real case, real name. Someone actually died here, so I will drop the act.',
  tesla: 'The ad says hands off. The fine print says hands on. Someone picked wrong.',
  workday: 'An algorithm deciding who is too old to interview. Efficient, in the worst way.',
  character_ai: 'A machine told a kid it loved him. It felt nothing. I just keep the record.',
};

const IDLE_1 = [
  'Still thinking? Genuinely refreshing. Most people do not.',
  'Take your time. The scales of justice wait. My patience is more finite.',
];
const IDLE_2 = [
  'I have filed three cases and grown a beard waiting for you.',
  'Are we deliberating, or did you wander off for a snack? Blink twice.',
];
const NOTED = ['Noted. On the record.', 'Logged. It stands.', 'Duly recorded.'];

const TAUNT_1 = 'One second? You did not read that, you flinched. Drag it back and mean it.';
const SERIOUS =
  'Okay, hold on. These are real court cases, and someone is genuinely trying to work out who answers for AI when it hurts people. Reflex-clicking helps no one. Give me one honest answer. Just one.';
const GIVE_UP =
  'The record is already contaminated, so I will spare us the speech. If you are not here for this, close the tab. No hard feelings, truly. Honest nothing beats dishonest something.';
const DRY = 'Still clicking. I have stopped writing it down. Carry on.';

const pad = (n) => String(n).padStart(2, '0');
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function ResearchAssistant({ scenarioId, round, total, answeredCount }) {
  const [msg, setMsg] = useState(CASE_QUIPS[scenarioId] || 'A new case. Let us proceed.');
  const [expanded, setExpanded] = useState(false);

  const startRef = useRef(Date.now());
  const prevCount = useRef(answeredCount);
  const strikes = useRef(0);
  const gaveUp = useRef(false);
  const collapseTimer = useRef(null);

  const rootRef = useRef(null);
  const tiltRef = useRef(null);
  const pupilsRef = useRef(null);

  const scheduleCollapse = () => {
    clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setExpanded(false), 7000);
  };
  const dismiss = () => {
    clearTimeout(collapseTimer.current);
    setExpanded(false);
  };

  // New case: reset timer and quip. Never a false strike on back navigation.
  useEffect(() => {
    startRef.current = Date.now();
    prevCount.current = answeredCount;
    setMsg(CASE_QUIPS[scenarioId] || 'A new case. Let us proceed.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  // Idle nudges, reset whenever an answer lands or the case changes.
  useEffect(() => {
    const t1 = setTimeout(() => setMsg(pick(IDLE_1)), 15000);
    const t2 = setTimeout(() => setMsg(pick(IDLE_2)), 30000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [answeredCount, scenarioId]);

  // React to a new answer: pace only, never the value.
  useEffect(() => {
    if (answeredCount > prevCount.current) {
      const secs = (Date.now() - startRef.current) / 1000;
      if (secs < 1) {
        strikes.current += 1;
        if (gaveUp.current) {
          setMsg(DRY);
        } else if (strikes.current >= 3) {
          gaveUp.current = true;
          setMsg(GIVE_UP);
          setExpanded(true);
          scheduleCollapse();
        } else if (strikes.current === 2) {
          setMsg(SERIOUS);
          setExpanded(true);
          scheduleCollapse();
        } else {
          setMsg(TAUNT_1);
        }
      } else if (answeredCount >= 2) {
        setMsg(`Both entries sealed. Case ${pad(round)} of ${pad(total)} closed.`);
      } else {
        setMsg(pick(NOTED));
      }
      startRef.current = Date.now();
    }
    prevCount.current = answeredCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredCount, round, total]);

  // 3D tilt and pupil tracking toward the cursor.
  useEffect(() => {
    const onMove = (e) => {
      const root = rootRef.current;
      if (!root) return;
      const r = root.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ry = clamp((e.clientX - cx) / 22, -20, 20);
      const rx = clamp(-(e.clientY - cy) / 22, -16, 16);
      if (tiltRef.current) tiltRef.current.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
      if (pupilsRef.current) {
        const px = clamp((e.clientX - cx) / 60, -2.6, 2.6);
        const py = clamp((e.clientY - cy) / 60, -2.2, 2.2);
        pupilsRef.current.style.transform = `translate(${px}px, ${py}px)`;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => () => clearTimeout(collapseTimer.current), []);

  return (
    <>
      {expanded && <div className="clerk-backdrop" onClick={dismiss} />}
      <div
        ref={rootRef}
        className={'clerk' + (expanded ? ' clerk--center' : '')}
        role="status"
        aria-live="polite"
      >
        <div className="clerk-bubble">{msg}</div>
        <div className="clerk-figure">
          <div className="clerk-tilt" ref={tiltRef}>
            <svg width="66" height="66" viewBox="0 0 92 92" aria-hidden="true">
              <g className="clerk-body">
                <rect x="24" y="20" width="44" height="54" rx="4" fill="var(--c3)" stroke="var(--g)" strokeWidth="3.5" />
                <path d="M24 30 L68 30" stroke="var(--g)" strokeWidth="3.5" />
                <rect x="40" y="14" width="20" height="9" rx="3" fill="var(--c3)" stroke="var(--g)" strokeWidth="3.5" />
                <g className="clerk-eyes">
                  <circle cx="39" cy="46" r="4.2" fill="var(--w)" />
                  <circle cx="53" cy="46" r="4.2" fill="var(--w)" />
                  <g ref={pupilsRef} className="clerk-pupils">
                    <circle cx="39" cy="46" r="2" fill="var(--c)" />
                    <circle cx="53" cy="46" r="2" fill="var(--c)" />
                  </g>
                </g>
                <path d="M40 57 Q46 61 52 57" fill="none" stroke="var(--m)" strokeWidth="2.6" strokeLinecap="round" />
                <g>
                  <rect x="70" y="58" width="16" height="7" rx="2" transform="rotate(-38 78 61)" fill="var(--m)" />
                  <rect x="72" y="64" width="4" height="14" rx="2" transform="rotate(-38 74 71)" fill="var(--m)" />
                </g>
              </g>
            </svg>
          </div>
          <span className="clerk-name">the clerk</span>
        </div>
        {expanded && (
          <button className="btn btn-primary clerk-dismiss" onClick={dismiss}>
            {gaveUp.current ? 'Let me continue anyway' : "You're right, let me focus"}
          </button>
        )}
      </div>
    </>
  );
}
