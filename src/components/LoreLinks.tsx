import type {LoreLink} from '../data/interiorMaps';
import {InteractionIcon} from './InteractionPrompt';
import './LoreLinks.css';

export default function LoreLinks({links, title = 'FIELD NOTES'}: {links: readonly LoreLink[]; title?: string}) {
  if (!links.length) return null;
  return <nav className="field-notes" aria-label={title}><p>{title}<small>OPENS IN A NEW TAB</small></p>{links.map(link => <a key={`${link.label}:${link.url}`} href={link.url} target="_blank" rel="noreferrer"><InteractionIcon kind="book"/><span>{link.label}</span><b aria-hidden="true">↗</b></a>)}</nav>;
}
