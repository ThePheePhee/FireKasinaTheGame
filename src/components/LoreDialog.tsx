import {useEffect, useId, useRef, type ReactNode} from 'react';

export default function LoreDialog({title, eyebrow, className = '', onClose, children}: {
  title: string;
  eyebrow: string;
  className?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panel = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  closeRef.current = onClose;
  useEffect(() => {
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.focus({preventScroll: true});
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeRef.current();
      } else if (event.key === 'Tab') {
        const choices = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), summary, [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0);
        if (!choices.length) { event.preventDefault(); return; }
        const index = choices.indexOf(document.activeElement as HTMLElement);
        if (event.shiftKey && index <= 0) { event.preventDefault(); choices[choices.length - 1].focus(); }
        else if (!event.shiftKey && (index === -1 || index === choices.length - 1)) { event.preventDefault(); choices[0].focus(); }
      }
    };
    window.addEventListener('keydown', keydown, true);
    return () => {
      window.removeEventListener('keydown', keydown, true);
      if (before?.isConnected) before.focus({preventScroll: true});
    };
  }, []);
  return <div className={`lore-backdrop ${className.includes('journey-menu') ? 'menu-backdrop' : ''}`} onPointerDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={panel} className={`bubble dialogue ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <button type="button" className="dialogue-close" aria-label="Close dialogue" onClick={onClose}>×</button>
      <p>{eyebrow}</p><h2 id={titleId}>{title}</h2><div className="rule"/>
      {children}
    </section>
  </div>;
}
