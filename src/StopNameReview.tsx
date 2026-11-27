import {FileSearch,ExternalLink} from 'lucide-react';
import review from './stop-name-review.json';
import {t} from './i18n';

export function StopNameReview(){
 return <section className="data-card stop-name-review"><div className="section-icon"><FileSearch size={22}/></div>
  <h2>{t('Stationsnamen im Abgleich.')}</h2>
  <p>{t('Geprüft am {0}: Die importierten Namen stimmen mit den zugehörigen GTAMap-Markern überein. Das bestätigt noch nicht die Beschilderung im Spiel.',review.checkedAt)}</p>
  <p>{t('Offene Hinweise bleiben hier dokumentiert. Solange die Belege nicht ausreichen, bleiben Namen und Haltefolgen unverändert.')}</p>
  {review.issues.map(issue=><details key={issue.id}><summary>{t(issue.title)}</summary><p>{t(issue.description)}</p><p>{t(issue.decision)}</p></details>)}
  <details><summary>{t('Weitere abweichende Ortsangaben')} · {review.districtDifferences.length}</summary>
   <p>{t('Gleiche Straße und gleicher Buchstabe können unterschiedlich zugeordnet sein. Gröbere Regionsangaben sind kein Beleg für einen falschen Stationsnamen. Keine automatische Umbenennung oder Zusammenlegung.')}</p>
   <ul>{review.districtDifferences.map(row=><li key={row.stopId}><strong>{row.name}</strong><span>GTABase: {row.matches.flatMap(m=>m.districts).join(' / ')}</span></li>)}</ul>
  </details>
  <p className="muted">{t('GTABase listet dieselben Straßen und Stop-Buchstaben für 272 benannte Bushalte. Gemeinsame Vorarbeiten sind möglich; Linienfolgen und die B/C-Frage sind damit nicht unabhängig geprüft.')}</p>
  <div className="source-links"><a href="https://gtamap.io/gta-6-transit-lines/#line-1029" target="_blank" rel="noreferrer">GTAMap · 1029 <ExternalLink size={14}/></a><a href="https://www.gtabase.com/gta-6/map/?feature=bus-stop" target="_blank" rel="noreferrer">GTABase · {t('Bushaltestellen')} <ExternalLink size={14}/></a></div>
  <a href="/stop-name-review.json" download>{t('Namensabgleich herunterladen')}</a>
 </section>;
}
