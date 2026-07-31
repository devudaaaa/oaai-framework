/**
 * The frozen 1 to 7 measurement control, presented as a snap-to-7 slider.
 *
 * The instrument is unchanged: seven discrete integer values, endpoint anchors
 * only ("Not me at all" to "Completely me"), no intermediate word labels that
 * would relabel the scale. The slider is a presentation of the same instrument,
 * not a new one. It emits integers 1 to 7 only.
 *
 * No default position: until the participant moves it, no value is committed
 * (value stays undefined) and the thumb is hidden. This guards against the
 * slider-centering artifact where everyone leaves the thumb at the midpoint.
 *
 * Do not change the scale, the count, or the endpoint labels.
 */
export default function LikertScale({
  value,
  onChange,
  leftLabel = 'Not me at all',
  rightLabel = 'Completely me',
}) {
  const touched = value !== undefined && value !== null;
  const display = touched ? value : 4;
  const pct = ((display - 1) / 6) * 100;
  const fill = touched
    ? `linear-gradient(to right, var(--pg) 0%, var(--pg) ${pct}%, var(--h) ${pct}%, var(--h) 100%)`
    : 'var(--h2)';

  return (
    <div className={'slider-q' + (touched ? ' touched' : '')}>
      <div className="slider-labels">
        <span className="likert-end">{leftLabel}</span>
        <span className="slider-readout">{touched ? `You chose ${value}` : 'Drag to answer'}</span>
        <span className="likert-end">{rightLabel}</span>
      </div>
      <input
        type="range"
        className="slider-input"
        min="1"
        max="7"
        step="1"
        value={display}
        style={{ background: fill }}
        aria-label="Rate from 1 to 7"
        aria-valuetext={touched ? String(value) : 'not answered yet'}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-ticks" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} className={'slider-tick' + (touched && value === n ? ' on' : '')}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
