import {useEffect,useState} from 'react';
export type MapTheme='system'|'light'|'dark';
export const mapPalette=(dark:boolean,schematic=false)=>dark?{
 paper:'#14212f',water:'#101f2e',land:schematic?'#21343a':'#29413e',coast:'#476463',urban:'#435251',airport:'#536064',place:'#bed3c8',halo:'#182c31',lakeLabel:'#accbda',text:'#f0f5f8',casing:'#14212f',hubBorder:'#a6bac8',repeat:'#a6bac8'
}:{paper:'#f8faf7',water:schematic?'#e2eef1':'#b8dfe5',land:schematic?'#eff3e9':'#dce6cf',coast:schematic?'#dde6d8':'#bdd0b7',urban:'#cbd5d2',airport:'#bbc7c9',place:schematic?'#61776f':'#4e726e',halo:schematic?'#f3f6ef':'#e5eddb',lakeLabel:'#476c7b',text:'#203640',casing:'#f8faf7',hubBorder:'#263d48',repeat:'#657080'};
export function luminance(hex:string){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
export function mapLineInk(hex:string,dark:boolean){
 let rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const format=()=>`#${rgb.map(c=>Math.round(c).toString(16).padStart(2,'0')).join('')}`;
 for(let i=0;i<40&&(dark?luminance(format())<.43:luminance(format())>.18);i++)rgb=rgb.map(c=>dark?c+(255-c)*.12:c*.9);
 return format();
}
function readTheme():MapTheme{try{const value=localStorage.getItem('lt-map-theme');return value==='light'||value==='dark'?value:'system';}catch{return 'system';}}
export function useMapTheme(){
 const [theme,setTheme]=useState<MapTheme>(readTheme),[systemDark,setSystemDark]=useState(()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)'),change=()=>setSystemDark(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 const choose=(value:MapTheme)=>{setTheme(value);try{localStorage.setItem('lt-map-theme',value);}catch{/* Theme still works without storage. */}};
 return {theme,setTheme:choose,dark:theme==='dark'||theme==='system'&&systemDark};
}
