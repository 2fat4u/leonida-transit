import {t} from './i18n';
import {isSamsungBrowser,samsungNotice} from './BrowserCompatibility';
export function InstallHelp({available,installed,busy,onInstall}:{available:boolean;installed:boolean;busy:boolean;onInstall:()=>void}){
 const agent=typeof navigator==='undefined'?'':navigator.userAgent,samsung=isSamsungBrowser(agent),ios=/iPhone|iPad|iPod/i.test(agent);
 return <div className="install-help">{samsung&&<p>{t(samsungNotice)}</p>}
  {installed?<p role="status">{t('Die App ist in diesem Fenster bereits installiert geöffnet.')}</p>:<>
   {available&&!samsung&&<button className="secondary" disabled={busy} onClick={onInstall}>{t(busy?'Installation wird geöffnet…':'App installieren')}</button>}
   {samsung?<p>{t('Samsung Internet wird für Installation und Kartenfarben derzeit nur eingeschränkt unterstützt. Öffne diese Seite in Chrome und installiere die App dort. Bereits installierte Apps findest du durch Hochwischen in deiner App-Liste.')}</p>:ios?<p>{t('iPhone: In Safari „Teilen“, dann „Zum Home-Bildschirm“ und „Hinzufügen“ wählen.')}</p>:<p>{t('Android: Im Browser-Menü „App installieren“ oder „Installieren und Verknüpfung erstellen“ wählen. Die Bezeichnung hängt vom Browser ab.')}</p>}
   <details><summary>{t('Installation klappt nicht?')}</summary><p>{t('Du kannst die App weiter im Browser nutzen. Bei Websites mit Anmeldung können geschützte Installationsdateien die Installation verhindern. „Offline bereit“ bestätigt den gespeicherten Inhalt und ist keine Bestätigung einer App-Installation.')}</p><p>{t('Ein Lesezeichen im Browser bleibt als direkter Zugang nutzbar.')}</p></details>
  </>}
 </div>;
}
