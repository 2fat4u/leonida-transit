import {renderServiceWorker} from './service-worker.mjs';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())files.push(...await walk(path));else files.push(path);}return files;}
const files=(await walk('dist')).filter(f=>!f.endsWith('/sw.js')).sort();
const hash=createHash('sha256');hash.update(await readFile(new URL('./service-worker.mjs',import.meta.url)));for(const f of files){hash.update(f);hash.update(await readFile(f));}
const version=hash.digest('hex').slice(0,16);const assets=['/',...files.map(f=>'/'+f.slice(5))];
await writeFile('dist/sw.js',renderServiceWorker(version,assets));
console.log(`Offline package: ${assets.length} files, vct-shell-${version}`);
