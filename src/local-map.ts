import type {Point} from './schematic';
import {projectGeographic,referencePlaces} from './geography';

export type Anchor={id:string;name:string;game:Point;image:Point|null};
export type Affine={a:number;b:number;c:number;d:number;e:number;f:number};
export type LocalMap={blob:Blob;name:string;width:number;height:number;anchors:Anchor[];opacity:number;enabled:boolean;alignmentVersion?:2};
export const defaultAnchors=():Anchor[]=>[referencePlaces[1],referencePlaces[2],referencePlaces[0]].map(p=>({id:p.id,name:p.name,game:{x:p.x,y:p.y},image:null}));
const usable=(a:Anchor|undefined)=>!!a?.image&&[a.image.x,a.image.y,a.game.x,a.game.y].every(Number.isFinite)&&a.image.x>=0&&a.image.x<=1&&a.image.y>=0&&a.image.y<=1;
// Fit a similarity transform in actual bitmap pixels. Equal scale on both axes,
// rotation and translation only: no shear, anisotropic scaling or reflection.
// The optional third point checks the result and never changes the transform.
export function imageTransform(anchors:Anchor[],width:number,height:number):Affine|null{
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!usable(anchors[0])||!usable(anchors[1]))return null;
 const first=anchors[0],second=anchors[1],p={x:first.image!.x*width,y:first.image!.y*height},q={x:second.image!.x*width,y:second.image!.y*height};
 const u=projectGeographic(first.game.x,first.game.y),v=projectGeographic(second.game.x,second.game.y);
 const sx=q.x-p.x,sy=q.y-p.y,dx=v.x-u.x,dy=v.y-u.y,den=sx*sx+sy*sy;
 if(Math.sqrt(den)<Math.max(10,Math.hypot(width,height)*.1)||Math.hypot(dx,dy)<15)return null;
 const a=(dx*sx+dy*sy)/den,b=(dy*sx-dx*sy)/den;
 const transform={a,b,c:-b,d:a,e:u.x-a*p.x+b*p.y,f:u.y-b*p.x-a*p.y};
 return Object.values(transform).every(n=>Number.isFinite(n)&&Math.abs(n)<1e7)?transform:null;
}
export function alignmentCheck(anchors:Anchor[],width:number,height:number){
 const matrix=imageTransform(anchors,width,height);if(!matrix)return null;
 const spanMetres=Math.hypot(anchors[1].game.x-anchors[0].game.x,anchors[1].game.y-anchors[0].game.y);
 let residualMetres:number|null=null;
 if(usable(anchors[2])){const predicted=applyTransform(matrix,{x:anchors[2].image!.x*width,y:anchors[2].image!.y*height}),expected=projectGeographic(anchors[2].game.x,anchors[2].game.y);residualMetres=Math.hypot(predicted.x-expected.x,predicted.y-expected.y)*10;}
 return {matrix,residualMetres,toleranceMetres:Math.max(120,spanMetres*.02),rotationDegrees:Math.atan2(matrix.b,matrix.a)*180/Math.PI};
}
export function inverseTransform(m:Affine,p:Point):Point|null{const det=m.a*m.d-m.b*m.c;if(!Number.isFinite(det)||Math.abs(det)<1e-14)return null;return {x:(m.d*(p.x-m.e)-m.c*(p.y-m.f))/det,y:(-m.b*(p.x-m.e)+m.a*(p.y-m.f))/det};}
export function storedImageTransform(map:LocalMap){return map.alignmentVersion===2?imageTransform(map.anchors,map.width,map.height):null;}
export function alignmentDraft(map:LocalMap):Anchor[]{
 const anchors=map.anchors.map(a=>({...a,game:{...a.game},image:a.image?{...a.image}:null}));
 if(map.alignmentVersion===2)return anchors;
 // Keep legacy point values, using the two most separated known places for the
 // new fit. The remaining place becomes an independent optional check.
 let pair=[0,1],span=-1;
 for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++)if(usable(anchors[i])&&usable(anchors[j])){
  const distance=Math.hypot(anchors[i].game.x-anchors[j].game.x,anchors[i].game.y-anchors[j].game.y);
  if(distance>span){span=distance;pair=[i,j];}
 }
 return [...pair.map(i=>anchors[i]),...anchors.filter((_,i)=>!pair.includes(i))];
}
export function applyTransform(m:Affine,p:Point):Point{return {x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f};}
export const svgTransform=(m:Affine)=>`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`;
export function pointInImage(client:Point,rect:{x:number;y:number;width:number;height:number},width:number,height:number):Point|null{
 const scale=Math.min(rect.width/width,rect.height/height),x=(client.x-rect.x-(rect.width-width*scale)/2)/(width*scale),y=(client.y-rect.y-(rect.height-height*scale)/2)/(height*scale);
 return Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1&&y>=0&&y<=1?{x,y}:null;
}
export function validLocalMap(value:unknown):value is LocalMap{
 if(!value||typeof value!=='object')return false;const m=value as LocalMap;
 return m.blob instanceof Blob&&['image/jpeg','image/png','image/webp'].includes(m.blob.type)&&m.blob.size>0&&m.blob.size<=15*1024*1024&&typeof m.name==='string'&&m.name.length<=260&&Number.isFinite(m.width)&&Number.isFinite(m.height)&&m.width>0&&m.height>0&&m.width*m.height<=30000000&&Number.isFinite(m.opacity)&&m.opacity>=.1&&m.opacity<=1&&typeof m.enabled==='boolean'&&(m.alignmentVersion===undefined||m.alignmentVersion===2)&&Array.isArray(m.anchors)&&m.anchors.length===3&&m.anchors.every(a=>a&&typeof a.id==='string'&&typeof a.name==='string'&&a.game&&[a.game.x,a.game.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=200000)&&(a.image===null||a.image&&[a.image.x,a.image.y].every(n=>Number.isFinite(n)&&n>=0&&n<=1)));
}
async function database(){return new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('leonida-local-map',1);r.onupgradeneeded=()=>r.result.createObjectStore('background');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('storage-blocked'));});}
export async function loadLocalMap():Promise<LocalMap|null>{const db=await database();try{return await new Promise((resolve,reject)=>{const r=db.transaction('background').objectStore('background').get('map');r.onsuccess=()=>resolve(validLocalMap(r.result)?r.result:null);r.onerror=()=>reject(r.error);});}finally{db.close();}}
export async function saveLocalMap(value:LocalMap|null){if(value&&!validLocalMap(value))throw new Error('invalid-local-map');const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('background','readwrite');if(value)tx.objectStore('background').put(value,'map');else tx.objectStore('background').delete('map');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export async function readImageFile(file:File):Promise<LocalMap>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024||file.size===0)throw new Error('image-format');
 const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();const result:LocalMap={blob:file,name:file.name.slice(0,260),width:image.naturalWidth,height:image.naturalHeight,anchors:defaultAnchors(),opacity:.7,enabled:true,alignmentVersion:2};if(!validLocalMap(result))throw new Error('image-size');return result;}finally{URL.revokeObjectURL(url);}
}
