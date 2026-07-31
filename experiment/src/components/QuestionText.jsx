/**
 * Renders a measurement question, italicizing the quoted claim without altering
 * a single character of the wording. The quotes are split out and re-added.
 */
export default function QuestionText({ text }) {
  const parts = text.split('"');
  if (parts.length >= 3) {
    return (
      <>
        {parts[0]}
        <span className="serif-q">"{parts[1]}"</span>
        {parts.slice(2).join('"')}
      </>
    );
  }
  return <>{text}</>;
}
