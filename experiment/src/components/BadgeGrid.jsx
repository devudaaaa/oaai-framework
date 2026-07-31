const ICONS = {
  full_run: '\u{1F3C1}', // checkered flag
  case_closed: '⚖️', // scales
  sharp_eye: '\u{1F3AF}', // bullseye
  pattern_named: '✦', // star
};

export default function BadgeGrid({ badges }) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="badge-grid">
      {badges.map((b) => (
        <div key={b.id} className={'badge' + (b.kind === 'pattern' ? ' pattern' : '')}>
          <div className="badge-icon">{ICONS[b.id] || '◆'}</div>
          <div className="badge-title">{b.label}</div>
          <div className="badge-desc">{b.desc}</div>
        </div>
      ))}
    </div>
  );
}
