import {useState} from 'react';
import {t} from './i18n';
export const isSamsungBrowser=(agent:string)=>/SamsungBrowser\//i.test(agent);
export const samsungNotice='Samsung Internet: eingeschränkte Unterstützung. Installation und Kartenfarben können fehlschlagen. Für diese App empfehlen wir Chrome auf Android.';
export function BrowserCompatibility(){
 const [copied,setCopied]=useState(false),[failed,setFailed]=useState(false);
 if(typeof navigator==='undefined'||!isSamsungBrowser(navigator.userAgent))return null;
 return <aside className="browser-compatibility" aria-label={t('Browserhinweis')}>
  <p>{t(samsungNotice)}</p>
  <button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);setFailed(false);}catch{setFailed(true);}}}>{t(copied?'Link kopiert':'Link kopieren')}</button>
  {failed&&<span role="status">{t('Bitte den Link aus der Adressleiste kopieren und in Chrome öffnen.')}</span>}
 </aside>;
}
