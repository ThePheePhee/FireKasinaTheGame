import {useMemo, useState} from 'react';
import {availableJournalEntries, searchJournal, type JournalCategory} from '../game/journal';
import LoreDialog from './LoreDialog';
import LoreLinks from './LoreLinks';
import './FieldJournal.css';

export default function FieldJournal({sandbox, discovered, notebook, onClose}: {sandbox: boolean; discovered: Iterable<string>; notebook: Iterable<string>; onClose: () => void}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<JournalCategory | undefined>();
  const [selected, setSelected] = useState<string | null>(null);
  const entries = useMemo(() => availableJournalEntries(sandbox, discovered, notebook), [sandbox, discovered, notebook]);
  const matches = searchJournal(entries, query, category);
  const entry = selected ? entries.find(item => item.id === selected) : undefined;
  return <LoreDialog title="THE TRAVELLER’S JOURNAL" eyebrow={sandbox ? 'SANDBOX · COMPLETE FIELD GUIDE' : 'YOUR DISCOVERIES · JOURNEY PAUSED'} className="field-journal journey-menu" onClose={onClose}>
    {entry ? <article className="journal-entry"><button className="journal-back" onClick={() => setSelected(null)}>← BACK TO ENTRIES</button><p className="journal-context">{entry.context}</p><h3>{entry.title}</h3><p className="copy">{entry.copy}</p><LoreLinks links={entry.links}/></article> : <>
      <p className="journal-intro">{sandbox ? 'Every place, path and field note in the shared landscape.' : 'Places you have found and notes you have read. New pages appear as you explore.'} Reading here does not move your traveller.</p>
      <div className="journal-filters"><label>SEARCH THE JOURNAL<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="A place, a thought, a curious find…"/></label><label>SHOW<select value={category ?? ''} onChange={event => setCategory((event.target.value || undefined) as JournalCategory | undefined)}><option value="">All entries</option>{(['Places', 'Paths', 'Curiosities', 'Interiors'] as const).map(item => <option key={item}>{item}</option>)}</select></label></div>
      <p className="journal-count" role="status">{matches.length} {matches.length === 1 ? 'ENTRY' : 'ENTRIES'}</p>
      <div className="journal-list">{matches.map(item => <button key={item.id} onClick={() => setSelected(item.id)}><span>{item.title}</span><small>{item.category} · {item.context}</small><b aria-hidden="true">›</b></button>)}</div>
      {!matches.length && <p className="copy">No page by that name yet. Try another word—or take your boots for a walk.</p>}
    </>}
  </LoreDialog>;
}
