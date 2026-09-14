import {useRef, useState} from 'react';
import {exportJourney, importJourney, MAX_JOURNEY_FILE_BYTES, type SavedJourney} from '../game/saveGame';
import LoreDialog from './LoreDialog';
import './FieldJournal.css';

export default function JourneyTransfer({snapshot, onImport, onClose}: {snapshot: () => SavedJourney; onImport: (journey: SavedJourney) => void; onClose: () => void}) {
  const input = useRef<HTMLInputElement>(null);
  const readRequest = useRef(0);
  const [candidate, setCandidate] = useState<SavedJourney | null>(null);
  const [error, setError] = useState('');
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJourney(snapshot())], {type: 'application/json'}));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'fire-kasina-journey.json'; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <LoreDialog title={candidate ? 'RESTORE THIS JOURNEY?' : 'PACK YOUR JOURNAL'} eyebrow="LOCAL SAVE FILE · NO ACCOUNT OR UPLOAD" className="journey-menu journey-transfer" onClose={onClose}>
    {candidate ? <><p className="copy">Concentration {Math.round(candidate.stats.concentration)} · Clarity {Math.round(candidate.stats.clarity)} · Confusion {Math.round(candidate.stats.confusion)}</p><p className="copy">Restoring replaces the journey saved in this browser, including discoveries and exploration assists. Your traveller returns to the saved position on the main map.</p><div className="journey-tools"><button onClick={() => onImport(candidate)}>RESTORE JOURNEY</button><button onClick={() => setCandidate(null)}>KEEP CURRENT JOURNEY</button></div></> : <><p className="copy">Save a copy of your progress before starting again, changing browsers or moving to another device. Interiors and activities resume from the main map; unfinished encounters are not stored.</p><div className="journey-tools"><button onClick={download}>DOWNLOAD SAVE FILE</button><button onClick={() => input.current?.click()}>CHOOSE A SAVE FILE</button></div><input ref={input} type="file" accept=".json,application/json" aria-label="Journey save file" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ''; const request = ++readRequest.current; if (!file) return;
      setError('');
      if (file.size > MAX_JOURNEY_FILE_BYTES) { setError('That file is too large. Choose a Fire Kasina journey file under 2 MB.'); return; }
      try { const journey = importJourney(await file.text()); if (request !== readRequest.current) return; if (journey) setCandidate(journey); else setError('This is not a supported Fire Kasina journey file. Your current journey is unchanged.'); }
      catch { if (request === readRequest.current) setError('The file could not be read. Your current journey is unchanged.'); }
    }}/>{error && <p className="transfer-error" role="alert">{error}</p>}</>}
  </LoreDialog>;
}
