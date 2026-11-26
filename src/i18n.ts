import {useSyncExternalStore} from 'react';
import translations from './translations.json';
export type Language='de'|'en';
export function readLanguage():Language {try{return localStorage.getItem('lt-language')==='en'?'en':'de';}catch{return 'de';}}
let language:Language=readLanguage();
const listeners=new Set<()=>void>();
const english=translations as Record<string,string>;
const german=Object.fromEntries(Object.entries(english).map(([de,en])=>[en,de]));
export function setLanguage(next:Language){language=next;try{localStorage.setItem('lt-language',next);}catch{/* The switch still works without persistence. */}if(typeof document!=='undefined')document.documentElement.lang=next;listeners.forEach(fn=>fn());}
export function t(text:string,...values:unknown[]):string {
 const dictionary=language==='en'?english:german;
 if(language==='en'){
  let match=text.match(/^(.+): Text mit 1–(\d+) Zeichen erwartet\.$/);
  if(match)return `${t(match[1])}: enter 1–${match[2]} characters.`;
  match=text.match(/^(.+): Zahl zwischen ([\d.]+) und ([\d.]+) erwartet\.$/);
  if(match)return `${t(match[1])}: enter a number between ${match[2]} and ${match[3]}.`;
  match=text.match(/^(.+): (\d+)–(\d+) Einträge erwartet\.$/);
  if(match)return `${t(match[1])}: expected ${match[2]}–${match[3]} entries.`;
  match=text.match(/^(.+): doppelte ID\.$/);
  if(match)return `${t(match[1])}: duplicate ID.`;
 }
 const translated=dictionary[text]??text.split(/(?<=\.) /).map(s=>dictionary[s]??s).join(' ');
 return translated.replace(/\{(\d+)\}/g,(match,index)=>values[Number(index)]===undefined?match:t(String(values[Number(index)])));
}
export function useLanguage(){const current=useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>language,()=> 'de' as Language);return [current,setLanguage] as const;}
if(typeof document!=='undefined')document.documentElement.lang=language;
