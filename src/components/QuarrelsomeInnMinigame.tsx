import {useEffect, useRef, useState} from 'react';
import type {GameStats} from '../game/gameState';
import {innDebaters, validateInnDialogues, type DialogueReply} from '../data/quarrelsomeConversations';
import {advanceInnConversation, createInnSession, getAvailableInnReplies, getInnNode, leaveInnConversation, settleInnResult} from '../game/innDialogue';
import './QuarrelsomeDialogues.css';
import './QuarrelsomeInnMinigame.css';

const integrityIssues = validateInnDialogues();

export default function QuarrelsomeInnMinigame({stats, onChange, onExit}: {stats: GameStats;onChange: (stats: GameStats) => void;onExit: () => void}) {
  const containerRef = useRef<HTMLElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const settled = useRef(false);
  const [{debater, scenario}] = useState(() => {
    const debater = innDebaters[Math.floor(Math.random() * innDebaters.length)];
    return {debater, scenario: debater.scenarios[Math.floor(Math.random() * debater.scenarios.length)]};
  });
  const [session, setSession] = useState(createInnSession);
  const {result, history} = session;
  const node = getInnNode(scenario, session.nodeId);
  const replies = getAvailableInnReplies(scenario, session, stats);
  const last = history[history.length - 1];
  const mood = last?.tone ?? 'listening';
  const unavailable = integrityIssues.length > 0 || !node;

  const choose = (reply: DialogueReply) => {
    const exchange = history.length;
    // A double tap from the old scene cannot accidentally choose a reply in the new one.
    setSession(current => current.history.length !== exchange ? current : advanceInnConversation(scenario, current, reply, stats));
  };
  const finish = () => {
    if (!result || settled.current) return;
    settled.current = true;
    onChange(settleInnResult(stats, result));
    onExit();
  };
  const leave = () => {
    if (result) return finish();
    if (!history.length || unavailable) return onExit();
    setSession(leaveInnConversation);
  };

  useEffect(() => {
    dialogueRef.current?.scrollTo({top: 0});
    lineRef.current?.focus({preventScroll: true});
    if (result) containerRef.current?.scrollTo({top: 0});
  }, [history.length, result]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        leave();
      } else if (!unavailable && !result && /^[1-9]$/.test(event.key)) {
        const reply = replies[Number(event.key) - 1];
        if (reply) {event.preventDefault(); choose(reply);}
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const room = <div className="inn-room" aria-hidden="true">
    <div className="inn-firelight"/><div className="inn-embers"><i/><i/><i/><i/></div>
    <div className="debater-portrait" style={{backgroundPosition: `${debater.sprite * 25}% 50%`}}/>
    <div className="inn-player-sprite"/>
    <div className="speech-runes">{history.slice(-7).map((entry, index) => <i key={index} className={entry.tone}/>)}</div>
  </div>;

  return <section ref={containerRef} className={`inn-minigame inn-mood-${mood}`} role="dialog" aria-modal="true" aria-labelledby="inn-title">
    <header><small>MISTS OF PURIFICATION · TABLE {debater.sprite + 1}</small><h1 id="inn-title">THE QUARRELSOME INN</h1><p>Correct what matters, release what does not, and try not to become the furniture.</p></header>
    {unavailable ? <div className="inn-result partial"><small>THE INNKEEPER INTERVENES</small><h2>THE ARGUMENT NEEDS REPAIR</h2><p>A loose conversational thread was caught before it could tangle the whole game. Please try another table.</p><button onClick={onExit}>RETURN TO THE MISTS</button></div>
      : result ? <>
        <div className="result-room">{room}</div>
        <div className={`inn-result ${result.grade}`} role="status"><small>{result.grade.toUpperCase()} · {history.length} EXCHANGES</small><h2>{result.title}</h2><p>{result.copy}</p>
          <div className="inn-outcome-meters" aria-label="Changes from this conversation">
            {(['clarity', 'confusion', 'concentration'] as const).map(key => {
              const change = settleInnResult(stats, result)[key] - stats[key];
              return <span key={key}>{key} <b>{change > 0 ? '+' : ''}{change}</b></span>;
            })}
          </div>
          {scenario.reference && <a className="inn-field-note" href={scenario.reference.url} target="_blank" rel="noopener noreferrer">{scenario.reference.label} ↗</a>}
          <button onClick={finish}>RETURN TO THE MISTS</button>
        </div>
      </> : <div className="argument-stage">{room}<div ref={dialogueRef} className="argument-box">
        <small>{debater.name.toUpperCase()} · {debater.epithet}</small>
        {last && <div className="last-player-line"><b>YOU</b><span>“{last.reply}”</span></div>}
        <p ref={lineRef} tabIndex={-1} className="debater-line">{node.line}</p>
        {session.visits[session.nodeId] > 1 && <p className="inn-returning-thread">The same question returns. Untie the knot before it becomes another lap.</p>}
        <div className="conversation-thread"><span>CONVERSATION THREAD</span>{history.length ? <b aria-label={`${history.length} exchanges`}>{history.map((entry, index) => <i aria-hidden="true" key={index} className={entry.tone}/>)}</b> : <em>LISTENING…</em>}</div>
        {replies.map((reply, index) => <button key={`${session.nodeId}:${reply.text}`} onClick={() => choose(reply)}><span aria-hidden="true">{index + 1}</span>{reply.text}</button>)}
        <footer>Choose a reply · keys 1–{replies.length} · Esc to leave</footer>
      </div></div>}
    {!result && !unavailable && <button className="leave-inn" onClick={leave}>LEAVE THE ARGUMENT</button>}
  </section>;
}
