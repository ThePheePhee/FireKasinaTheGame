import {useEffect,useState} from 'react';
import type {AtlasCell,SubMapDefinition,SubMapRoom} from '../data/subMaps';
import './SubMap.css';
import './SubMapFixes.css';

const atlasPosition=([column,row]:AtlasCell)=>`${column*25}% ${row*25}%`;

export default function SubMap({map,onExit}:{map:SubMapDefinition;onExit:()=>void}){
 const [levelIndex,setLevelIndex]=useState(0),[selected,setSelected]=useState<SubMapRoom>(map.levels[0].rooms[0]);
 const level=map.levels[levelIndex];
 useEffect(()=>{setLevelIndex(0);setSelected(map.levels[0].rooms[0])},[map]);
 const chooseLevel=(index:number)=>{setLevelIndex(index);setSelected(map.levels[index].rooms[0])};
 return <section className={`submap submap-${map.id}`} aria-label={map.name}>
  <div className="submap-scanlines"/>
  <div className="submap-header"><button type="button" onClick={onExit}>← RETURN TO OVERWORLD</button><div><p>{map.kicker}</p><h1>{map.name}</h1></div><span>AREA MAP</span></div>
  <nav className="floor-tabs" aria-label="Area levels">{map.levels.map((item,index)=><button key={item.id} className={index===levelIndex?'active':''} onClick={()=>chooseLevel(index)}>{item.name}</button>)}</nav>
  <main className="submap-board">
   <section className="dungeon-map" aria-label={level.name}>
    <div className="floor-title"><h2>{level.name}</h2><p>{level.subtitle}</p></div>
    <div className="room-route">{level.rooms.map((room,index)=><div className="room-step" key={room.id}>{index>0&&<i aria-hidden="true">◆ ◆ ◆</i>}<button className={selected.id===room.id?'active':''} onClick={()=>setSelected(room)} aria-label={`Explore ${room.name}`}><span className="room-art" style={{backgroundImage:`url(${import.meta.env.BASE_URL}assets/submaps-atlas.png)`,backgroundPosition:atlasPosition(room.art)}}/><b>{room.name}</b><small>{index+1}</small></button></div>)}</div>
   </section>
   <aside className="room-lore" aria-live="polite"><p>ROOM DISCOVERED</p><h2>{selected.name}</h2><div className="room-lore-art" style={{backgroundImage:`url(${import.meta.env.BASE_URL}assets/submaps-atlas.png)`,backgroundPosition:atlasPosition(selected.art)}}/><p>{selected.copy}</p>{selected.reference&&<a href={selected.reference.url} target="_blank" rel="noreferrer">FIELD GUIDE · {selected.reference.label} ↗</a>}<small>Choose another chamber to continue exploring.</small></aside>
  </main>
  <button type="button" className="submap-exit" onClick={onExit}>← EXIT AREA MAP</button>
 </section>
}
