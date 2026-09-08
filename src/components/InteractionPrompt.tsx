import './InteractionPrompt.css';

export type InteractionKind = 'book' | 'talk' | 'lore';
export function InteractionIcon({kind = 'lore'}: {kind?: InteractionKind}) {
  return <span className={`interaction-icon icon-${kind}`} aria-hidden="true"><i/><b/></span>;
}

export default function InteractionPrompt({title, eyebrow, action, kind = 'lore', remembered = false, onActivate}: {
  title: string; eyebrow: string; action: string; kind?: InteractionKind;
  remembered?: boolean; onActivate: () => void;
}) {
  return <button type="button" className={`interaction-prompt ${remembered ? 'remembered' : ''}`} aria-label={`${action}: ${title}`} onClick={onActivate}>
    <InteractionIcon kind={kind}/>
    <span className="interaction-copy"><small>{eyebrow}</small><strong>{title}</strong><span className="interaction-action"><kbd>E</kbd><span>{action}</span><b aria-hidden="true">→</b></span></span>
    <span className="interaction-tip">CLICK / TAP TO OPEN</span>
  </button>;
}
