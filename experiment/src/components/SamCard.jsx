import SAM from '../data/averageAiUser.js';

export default function SamCard() {
  return (
    <div className="sam-card">
      <div className="sam-name">{SAM.name}</div>
      <div className="sam-tag">{SAM.tagline}</div>
      <ul className="sam-props">
        {SAM.properties.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <div className="sam-note">{SAM.note}</div>
    </div>
  );
}
