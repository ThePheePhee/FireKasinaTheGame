import {useState} from 'react';
import type {Route} from '../data/routes';
import {pathContent} from '../data/pathContent';
import './RoadsideSign.css';

/** A road encounter is an invitation, never an automatic interruption. */
export default function RoadsideSign({routes,onRead}:{routes:Route[];onRead:(route:Route)=>void}){
 const [expanded,setExpanded]=useState(false),primary=routes[0];
 if(!primary)return null;
 return <section className={`roadside-sign ${primary.family}`} aria-label="Names of the paths here">
  <button type="button" className="roadside-main" onClick={()=>onRead(primary)} aria-label={`Read path lore: ${primary.name}`}>
   <span className="roadside-post" aria-hidden="true"><i/><b/></span>
   <span className="roadside-title"><small>ON A NAMED PATH</small><strong>{primary.name}</strong><span className="roadside-read"><kbd>R</kbd> READ THIS PATH <b aria-hidden="true">↗</b></span></span>
  </button>
  {routes.length>1&&<>
   <button type="button" className="roadside-shared" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{routes.length} named paths share this stretch <span aria-hidden="true">{expanded?'▴':'▾'}</span></button>
   {expanded&&<div className="roadside-choices"><p>One road can carry more than one teaching.</p>{routes.map(route=><button type="button" key={route.id} onClick={()=>onRead(route)}><strong>{route.name}</strong><span>{pathContent[route.id].journey}</span></button>)}</div>}
  </>}
 </section>;
}
