# Leonida Transit

Inoffizieller React/TypeScript-PWA-Prototyp für GTA 6. Deutsche und englische Oberfläche, originale englische Haltestellennamen, gerichtete Verbindungssuche, Bus/Metro/Regionalzug, schematischer Netzplan und manuelle Fahrtbegleitung. Kräftige Farben in Pink, Türkis und Violett. Kein GPS, keine Verbindung zum Spiel und keine Ankunftsprognosen.

## Lizenz und Daten

Der eigene Programmcode steht unter der [MIT-Lizenz](LICENSE). Die verwendeten Fan-Daten, Sammlungen, Kartenreferenzen und Marken sind davon ausgenommen; siehe [DATA_SOURCES.md](DATA_SOURCES.md). Abhängigkeiten behalten ihre eigenen Lizenzen, siehe [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Eine allgemeine freie Lizenz an allen enthaltenen Daten oder eine Freigabe durch Rockstar wird nicht behauptet.

## Starten

Node.js 22.12+ (die automatische Prüfung verwendet Node.js 22):

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

Dann http://localhost:4173 öffnen. `npm run dev` startet die Entwicklungsversion ohne Offline-Worker. Installation und Offline-Cache benötigen den Produktions-Build über HTTPS oder localhost. `dist/` lässt sich statisch an der Domain-Wurzel hosten.

## Bedienung

- **DE / EN** wechselt die gesamte Bedienoberfläche; die Auswahl wird auf dem Gerät gespeichert. Eigene importierte Freitexte werden nicht automatisch übersetzt.
- Unter **Verbindung / Journey** Start und Ziel auswählen, Verkehrsmittel und wenige Umstiege oder wenige Haltestellen wählen.
- **Fahrt begleiten / Start journey companion** zeigt Einstieg, nächsten Halt, Ausstieg und Umstieg. Jeder Schritt wird selbst bestätigt. Fortschritt bleibt nach Neuladen erhalten.
- Der **Netzplan** startet mit allen 19 Linien. Die schematische Lage orientiert sich an den hinterlegten Spielkoordinaten, mit vergrößertem Stadtbereich und komprimierten Außenregionen. Linie, Richtung und regionale Ausschnitte sind auswählbar. Einzelne Linien zeigen jeden Besuch als eigenen nummerierten Aufruf, auch bei wiederholten Halten. Haltestellen lassen sich als Start oder Ziel übernehmen; Suche, Zoom und Verschieben sind möglich.
- **Daten & Offline** enthält Quellen, offene Fragen, Export, Import und einen Editor. Eine JSON-Datei muss nicht erst beschafft werden.

Tagline: „Weil du zu arm bist für eine richtige Karre.“ / “Because you are too poor to afford a real ride.”

## Recherchebasis vom 26.11.2026

Die vom Nutzer bestätigte Grundlage ist [GTAMap – GTA 6 Transit Lines](https://gtamap.io/gta-6-transit-lines/). Das Netz enthält daraus Haltestellennamen, Marker-Identitäten, Spielpositionen und gelistete Reihenfolgen; passende vereinfachte Liniengeometrien werden zusätzlich in der geografischen Ansicht verwendet. **19 Personenverkehrslinien, 25 Richtungen und 340 Haltestelleneinträge**, davon 299 benannte Einträge und 41 unmarkierte Unterstände. Bus: 15 Linien, Metro/People Mover: 3, Regionalzug: 1.

Namensabgleich mit [GTABase – Stationen](https://www.gtabase.com/gta-6/map/?feature=public-transport) und [GTABase – Bushaltestellen](https://www.gtabase.com/gta-6/map/?feature=bus-stop). 33 Einträge passen nach Stationsname bzw. nach Straße, Ort und Haltebuchstabe. Der strenge Abgleich lässt abweichende Ortsgranularität und uneindeutige Zuordnungen offen. **Das bestätigt weder unabhängige Vorquellen noch Linienfolgen oder die Spielgenauigkeit.** Alle Reihenfolgen bleiben vorläufig und nur einfach belegt.

Die Netzbelege umfassen vier Einträge einschließlich der öffentlichen Haltestellenpositionen. Gebiets- und Liniengeometrien werden zusätzlich in den Kartografiedateien dokumentiert. Frühere kleinere Fassungen nannten ergänzend GTA6Tracker und GTA6 GPS; diese sind nicht die Belegbasis des neuen vollständiger erfassten Datensatzes.

### Modellierungsentscheidungen

- Nur identische GTAMap-Marker werden zu einer gemeinsamen Haltestellen-ID und damit zu einem möglichen Umstieg. Benachbarte Halte und ähnliche Namen erhalten keine erfundenen Fußwege.
- Unmarkierte Unterstände bekommen je Linie, Richtung und Quellenposition eine eigene Identität. Ihre Quellenbeschriftung ist kein verifizierter Stationsname. Im Auswahlfeld ergänzt die App zur Unterscheidung eine Kontextkennung.
- Aufeinanderfolgende identische Marker bei MM und AM bilden eine Station. Bahnsteige und Einstiegsregeln bleiben ungeklärt. Die volle weitere gelistete Folge bleibt erhalten.
- Die öffentliche Transit-Datei bezeichnet alle 25 Personenverkehrsrichtungen ausdrücklich als geschlossene Umläufe; auch ihre Liniengeometrien sind geschlossen. Die früher fehlenden 13 Ringschlüsse wurden deshalb ergänzt. Gegenrichtungen werden weiterhin nicht erfunden. Ungeklärte Details und unbenannte Halte bleiben entsprechend gekennzeichnet.
- Freight Rail entfällt: kein nutzbarer Personenverkehrsablauf gelistet. N02 ist ein Stadtbus; daraus wird kein Nachtbetrieb abgeleitet. Es gibt keine Nachtbus-Kategorie.
- Queen Palm Ave wird bei GTAMap Southwind, bei GTABase Watson Bay zugeordnet. Der Widerspruch bleibt dokumentiert.
- Keine Übernahme von Quell-Längen, Fahr- oder Wartezeiten, Kartenbildern, fremden Layouts oder Seitenbeschreibungen. Physische Positionsdaten und vereinfachte geografische Linien-/Flächenreferenzen sind quellenbezogen dokumentiert; das schematische Layout und die Farbgestaltung sind eigene Darstellungen.

Quellenbelege, Positionsdaten und Hinweise sind in `src/research-network.json` und in der App enthalten. [GTAMap-Rechtehinweise](https://gtamap.io/disclaimer/) bleiben quellenabhängig; eine allgemeine Lizenz an fremden Sammlungen oder eine Rockstar-Freigabe wird nicht behauptet. Die App ruft diese Quellen nicht im Hintergrund ab.

Zusätzlich ist ein vollständig fiktives Demo-Netz mit 14 Haltestellen und vier Linien separat auswählbar. Es ist ausdrücklich als Demo gekennzeichnet.

## Linienprüfung und neuer Netzplan

Alle 25 Richtungen wurden mit einer frisch abgerufenen öffentlichen GTAMap-Transit-Datei abgeglichen. Haltestellenreihenfolge und IDs stimmen nach den bereits dokumentierten zwei direkt aufeinanderfolgenden Markerdopplungen überein. Die dort ausdrücklich gesetzte Umlaufkennzeichnung sowie die geschlossenen Quellengeometrien rechtfertigen 13 zuvor fehlende Ringschlüsse. Die Quellen stammen vom selben Anbieter; der Abgleich bestätigt die Spielgenauigkeit nicht unabhängig.

Route 420 hat 32 normalisierte Aufrufe. **NW 4th Ave, Little Cuba (Stop I)** wird als Aufruf 14 und 18 bedient. Dazwischen: Northbrook Dr B → Northbrook Dr C → Rialto Cswy A. Danach fährt die Folge über NW 4th Ave F weiter. Im neuen Plan werden diese Besuche getrennt nummeriert und leicht versetzt angezeigt. Suche und Fahrtbegleitung verwenden weiterhin dieselben physischen Haltestellen-IDs und den gerichteten Vorkommensgraphen. Eine Fahrt ohne erneuten Einstieg überspringt die nördliche Schleife nicht.

Der Gesamtnetzplan verwendet eine eigene Darstellung mit überwiegend horizontalen, vertikalen und 45-Grad-Abschnitten. Geografische Grundrichtungen bleiben erhalten, die dichte Stadt wird gegenüber den Außenregionen vergrößert. Der Hintergrund verwendet angepasste, vereinfachte Flächenreferenzen der Fan-Quelle und stellt keine genaue Küstenlinie dar. Keine Rockstar-Karte, Kartentextur oder fremdes Netzplan-Design wird ausgeliefert.

Die Gesamtansicht zeigt zunächst wichtige Halte und Ortsnamen; beim Zoomen und im Stadtausschnitt werden weitere Halte und Namen eingeblendet. Einzelne Linien zeigen alle Aufrufe mit Richtungspfeilen. Die Beschriftung behält Haltebuchstaben und Stadtteile. Eine reine Linienkreuzung erzeugt keinen Umstieg. Wiederholte Besuche sind über eine graue gestrichelte Klammer als derselbe Halt erkennbar. Ein Klick erläutert für jeden Aufruf den vorherigen und folgenden Halt. Zusätzlich lässt sich die vollständige nummerierte Haltefolge öffnen.

Die Linienführung des mitgelieferten Netzes wird vorab berechnet und über eine Prüfsumme an Haltepositionen und Topologie gebunden. Das beschleunigt den Start auf Mobilgeräten. Eigene Netze erhalten eine neue schematische Anordnung. Die physische Positionsdatei und die Luftlinienberechnung bleiben davon unabhängig.

Details: `LOGIKPRUEFUNG.md` und `src/route-audit.json`. In der App steht der Bericht unter Daten & Offline zum Download bereit. Ältere gültige Fahrten bleiben nach Validierung der geordneten Abschnitte erhalten.

## Umstiege und kurze Fußwege

Die Unterzeile lautet jetzt „Der billigste Weg hier weg.“ / “The cheapest way to get away.”

Unter **Linien → Umsteigen zwischen Linien** lassen sich zwei Linien auswählen. Gemeinsame Haltestellen werden mit allen dort bedienenden Linien und ihren verfügbaren Richtungen angezeigt. Das gilt für Bus, Metro und Regionalzug. Der Datensatz enthält 41 von mehreren Linien bediente Haltestelleneinträge. Ankunft ohne weiteren Einstieg in einer gelisteten Richtung wird gesondert gekennzeichnet. Auch in der Haltestellenliste und im Netzplan sind die weiteren Linien sichtbar.

**N02 ↔ 1618:** fünf gemeinsame Einträge: Catalan Blvd, Downtown (Stop G/H/I), Atlantic Ave, Washington Beach (Stop Q) und Vineyard Dr, Washington Island (Stop C). Ein Regressionstest berechnet eine Verbindung nur mit N02 und 1618 über einen gemeinsamen Halt, ohne Fußweg.

Die öffentliche [GTAMap-Transit-Datei](https://gtamap.io/data/transit/gta6.json?v=ae10a7b6) stellt Positionsdaten bereit. Die Haltestellenpositionen dienen der Luftlinienberechnung. Für die geografische Ansicht kommen zusätzlich separat dokumentierte Liniengeometrien hinzu; Zeitwerte und Kartenbilder werden nicht übernommen. Jeder der 340 Einträge hat ein separates `position`-Objekt mit Spielkoordinaten und Quellen-ID. Die bisherigen `x`/`y` bleiben reine Darstellungskoordinaten und werden niemals zur Entfernungsmessung benutzt.

**Mögliche Fußumstiege einbeziehen** ist zunächst ausgeschaltet. Bei Aktivierung sucht die App bis zu drei nächste, zusätzliche Einstiegsmöglichkeiten innerhalb von **150, 300 oder 500 m Luftlinie**; Standardgrenze 300 m. Die Entfernungen sind aus der Ebene der Quellenkoordinaten abgeleitete Näherungen. Weder Barrieren noch Bahnsteigzugänge, Straßenquerungen oder die tatsächlich zu laufende Strecke sind geprüft. Es wird keine Fußgängernavigation versprochen. Eine sichtbare geografische Hintergrundkarte ist für die Näheberechnung nicht nötig.

Fußwege erscheinen als eigener Abschnitt und in der manuellen Fahrtbegleitung mit „Fußweg beginnen“ und „Zielhaltestelle erreicht“. Sie werden nur als Weg zu einem folgenden Einstieg verwendet. Es gibt keine Ketten reiner Fußwege oder künstliche Endverbindung zu einem Ziel ohne anschließende Fahrt. Nach jedem Einstieg muss mindestens ein gelisteter Fahrabschnitt folgen. Bei gleicher Zahl von Einstiegen bevorzugt die Umstiegssuche weniger Luftlinie; bei der Haltestellensuche zählt je angefangenen 100 m Fußweg ein zusätzlicher Aufwand. Zeitwerte werden nicht erfunden.

Ohne Positionsdaten im eigenen Netz bleibt diese Funktion ohne zusätzliche Verbindungen; darauf weist die App hin. Ein zukünftiger verlässlicher Fußwegplaner benötigt begehbare Wege oder geprüfte Verbindungen aus dem Spiel.

## Suche und manuelle Fahrt

Dijkstra auf einem gerichteten Vorkommensgraphen. Jede Richtung ist separat; wiederholte Stationen werden nicht übersprungen. Geschlossene Ringe können über ihre Grenze hinweg ohne künstlichen Umstieg weiterfahren. Die UI vergleicht ausschließlich Haltestellenabschnitte und Umstiege. Für optionale Fußumstiege zeigt die App eine abgeleitete Luftlinie. Fahr-/Wartezeiten werden nicht angezeigt. Ältere Dateien mit Zeitwerten bleiben lesbar; der neue Export braucht diese Werte nicht.

Ein Netzwechsel beendet die aktive Fahrt. Alte mitgelieferte Teilnetze werden ohne gespeicherte Fahrt auf die neue Recherchebasis aktualisiert. Die vorige 340-Halte-Recherchebasis erhält die Positionsdaten automatisch; ihre weiterhin gültigen gespeicherten Fahrten bleiben erhalten. Eigene Netze und laufende Fahrten im früheren 29-Halte-Teilnetz werden erhalten; das neue Netz ist zusätzlich im Netzmenü auswählbar. Ältere Imports der entfernten Verkehrsmittelkategorie werden beim Laden gefiltert, ohne den ursprünglichen Speicherwert zu überschreiben.

## Ergänzen ohne JSON

Unter **Daten & Offline → Linie oder Richtung ergänzen** Kürzel, Namen, Verkehrsmittel und Richtung eintragen. Haltestellen in Reihenfolge hinzufügen, vorhandene Halte ausdrücklich wiederverwenden und einen öffentlichen Beleglink angeben. Die Reihenfolge lässt sich verschieben. Für einen Ring die vorhandene erste Haltestelle erneut auswählen. Eine Rückrichtung wird separat erfasst. Gleiche Namen werden nicht automatisch verbunden. Speichern erzeugt das Datenformat und legt es lokal ab; Export sichert eigene Ergänzungen.

## Importformat

`public/import.schema.json` beschreibt Schema 1. Optional ist je Halt `position: {"x":0,"y":0,"system":"game","sourceId":"source-id"}` mit einer vorhandenen Quellen-ID. Diese Daten bleiben beim Export erhalten und sind unabhängig von der schematischen Kartenlage. `minutes` ist optional und wird beim normalen Export weggelassen. Fehlt es, bleibt jede Abschnittszeit intern unbekannt. Numerische Zeitwerte und `null` aus älteren Dateien sind weiterhin lesbar. Belege, Quellen, Hinweise und `partial` bleiben beim Import/Export erhalten.

```json
{
  "schemaVersion": 1,
  "id": "my-network",
  "name": "Mein recherchiertes Netz",
  "status": "community",
  "source": {"name":"Meine Zusammenstellung","url":"https://example.org/source","license":"Quellenabhängige Rechteangabe","checkedAt":"2026-11-26"},
  "stops": [
    {"id":"a","name":"Demo Station A","x":150,"y":150},
    {"id":"b","name":"Demo Station B","x":500,"y":450}
  ],
  "lines": [{"id":"DEMO-1","name":"Demo Line","mode":"bus","color":"#ffc45e","patterns":[{"id":"out","headsign":"Demo Station B","stops":["a","b"],"partial":true}]}]
}
```

`mode`: `bus`, `metro`, `rail`. `status`: `demo`, `community`, `research`; ein importierter Status ist kein Verifizierungssiegel. Gleiche Start-/End-ID schließt einen Ring. Grenzen: 2 MB, 500 Haltestellen, 50 Linien, vier Richtungen je Linie, 300 Vorkommen je Richtung und insgesamt 3000 Vorkommen. Koordinaten: SVG-Raum 1000 × 800, x 30–970, y 30–770. IDs und Verweise müssen gültig sein. Ungültige Eingaben verändern das Netz nicht.

## Offline und Prüfung

App, Icons, Systemschriften, Netzdaten und Schema werden lokal bereitgestellt. Der Produktions-Build erzeugt ein versioniertes Offline-Paket; Updates werden unter Daten & Offline angeboten. Die letzten zwei Asset-Versionen bleiben verfügbar. Eigene Daten zur Sicherheit exportieren, da Browser lokale Speicherung löschen können.

59 automatisierte Tests und Produktions-Build erfolgreich. Deutsch/Englisch, mobile Ansicht, manuelle Fahrt, Richtungswahl und echter Neustart bei gestopptem App-Server praktisch geprüft. Echte Android-/iOS-Hardware und PWA-Installation sind nicht geprüft. Details in `PRUEFBERICHT.md`.

## Kartenoptionen und Entfernungen

Normale Haltepunkte sind in Linienfarbe gefüllt, Umstiege weiß. Symbole und Haltebeschriftungen behalten beim Zoomen ihre Bildschirmgröße. Unter der Karte lassen sich beliebige Linien einzeln ein- und ausblenden; die Suche nutzt weiterhin ihre eigene Verkehrsmittelauswahl. „Linie im Detail“ zeigt die geordnete Haltefolge. Direkt am gewählten Halt lassen sich Start und Ziel setzen.

Die Entfernungseinheiten (m/km oder ft/mi) werden auf dem Gerät gespeichert. Die optionale Fußumstiegsgrenze ist frei zwischen 1 m und 10 km einstellbar. Ein Einheitenwechsel rechnet denselben Wert um. Es bleiben höchstens drei zusätzliche nahe Einstiegshalte je Ausgangshalt; eine größere Grenze bestätigt keinen begehbaren Weg.

Im Export enthält jede Richtung `airDistancesMetres`: je ein Luftlinienwert in Metern zum nächsten Aufruf, einschließlich Ringschluss; `null`, wenn Positionen fehlen. Beim Import wird diese Liste aus den hinterlegten Spielpositionen neu berechnet. Die schematischen Kartenkoordinaten verändern keine Entfernungen. Diese Angaben sind keine tatsächlichen Straßen-, Schienen- oder Fußwegstrecken.

## Hintergrund und eigene Kartenbilder

Die Landschaftszeichnung nutzt angepasste und vereinfachte Flächenreferenzen aus der öffentlichen GTAMap-Gebietsdatei. Geografische Ansicht und Netzplan haben unterschiedliche Detailstufen: 151 Landflächen gegenüber 19 großen Landmassen. Draper Island und Vice Beach sind vom Festland getrennt. Unbenannte Lücken zwischen Gebietsreferenzen werden nicht als erfundene Seen gezeichnet. Lake Leonida und Lake Tallaloko bleiben in der geografischen Ansicht erhalten. Der Netzplan zeigt nur einen kompakten Lake Leonida, keine Stadt- oder Flughafenflächen und keine zusätzliche Flusszeichnung. Hamlet, Key Lento, Grayson und Draper Island sind beschriftet. Es werden keine fremden Kartenbilder oder Kacheln mitgeliefert; die Formen bleiben vereinfachte Fan-Referenzen, keine exakte Spielkarte.

„Geografisch“ verwendet eine gleichmäßige Projektion der vorhandenen Spielpositionen ohne Rasterverschiebung. Für die 25 mitgelieferten Richtungen werden passende Liniengeometrien der Fan-Quelle verwendet. Die vollständige Haltefolge und alle gespeicherten Positionen müssen mit der Referenz übereinstimmen. Bei geänderten Importen ohne passenden Verlauf erscheinen nur gestrichelte Halteverbindungen. Wartezeiten und Fahrzeiten werden nicht aus den Geometrien übernommen. Die gezeichneten Verläufe sind nicht unabhängig im Spiel bestätigt. Halte ohne Spielposition werden in diesem Modus nicht erfunden.

Unter „Eigenes Kartenbild“ kann der Nutzer selbst eine JPG-, PNG- oder WebP-Datei wählen (bis 15 MB / 30 Megapixel). Zwei weit auseinanderliegende Referenzorte richten das Bild mit einer proportionalen Transformation aus: Verschieben, Drehen und gleichmäßiges Skalieren in den tatsächlichen Bildpixeln. Scherung, Spiegelung und unterschiedliche Streckung der Achsen sind ausgeschlossen. Der optionale dritte Punkt zeigt nur eine Abweichung an und verändert die Ausrichtung nicht. Ortsmitten aus der öffentlichen GTAMap-Konfiguration vom 26.11.2026 sind ungefähre Hilfspunkte; exakt bekannte Haltestellen können stattdessen gewählt werden. Unterschiedliche Projektionen und vorläufige Fan-Koordinaten können weiterhin Abweichungen verursachen. Nach der Ausrichtung weitere Halte prüfen.

Bild, Ausrichtung, Deckkraft und Sichtbarkeit liegen nur in IndexedDB (`leonida-local-map`) auf diesem Gerät. Die App sendet diese Daten nicht an Server; sie erscheinen weder im Netzexport noch im Deployment. Kein automatischer Karten-Download. Bei Speicherfehlern ist das Bild nur für die Sitzung verfügbar; ein Hinweis erscheint. Browser können lokale Daten löschen. „Lokales Kartenbild entfernen“ löscht den Datensatz. Das lokale Laden ist keine Aussage über die Nutzungsrechte der selbst gewählten Datei.

### Zoom beim Ausrichten

Das lokale Ausrichtungsbild lässt sich bis 16-fach gegenüber der Gesamtansicht vergrößern: mit +/−, Mausrad oder zwei Fingern. Ziehen verschiebt den Ausschnitt; kurze Tipps setzen den gewählten Referenzpunkt. Eine Zieh- oder Zoomgeste setzt keinen Punkt. „Ganzes Bild“ setzt die Ansicht zurück, „Gewählten Punkt zeigen“ holt einen bereits gesetzten Punkt ins Bild. „Bildbereich vergrößern“ schafft mehr Höhe. Punktmarkierungen bleiben gleich groß auf dem Bildschirm. Tastatur: +/−, Pfeiltasten zum Verschieben und Pos1/Home für die Gesamtansicht. Die Bildansicht verändert keine gespeicherten Referenzkoordinaten.

### Proportionale Ausrichtung und Vorschau

Die Vorschau blendet erwartete Haltestellen in das unverformte Originalbild ein. Ein violettes Kreuz zeigt die erwartete Lage des freiwilligen Prüforts; eine gestrichelte Verbindung macht eine Abweichung sichtbar. Die beiden Ausrichtungsorte müssen mindestens 10 % der Bilddiagonale auseinanderliegen. Ein auffälliger Drehwinkel oder ein unpassender Prüfpunkt wird angezeigt. Die Fan-Positionen bleiben vorläufig; die App garantiert keine exakte Deckung verschiedener Karten.

Gespeicherte Bilder und Punkte aus der früheren Drei-Punkt-Ausrichtung bleiben erhalten. Ihre bisherige Ausrichtung wird nicht automatisch wieder angezeigt: Der Bildbereich öffnet sich mit einem Hinweis zur Prüfung. Erst „Ausrichtung übernehmen“ speichert `alignmentVersion: 2` und schaltet das Bild wieder ein. Es wird keine verzerrte Alttransformation weiterverwendet. „Punkte neu setzen“ beginnt eine neue Auswahl, ohne das Bild zu löschen.

## Geografieabgleich vom 26.11.2026

Referenzen: [GTAMap-Gebietsdatei](https://gtamap.io/data/areas/gta6.json?v=5007e3bb), [GTAMap-Transitdatei](https://gtamap.io/data/transit/gta6.json?v=ae10a7b6) und das vom Nutzer bereitgestellte Leonida-Poster als Sichtprüfung. [Quellen- und Rechtehinweise](https://gtamap.io/disclaimer/) bleiben quellenbezogen; es wird keine Rockstar-Freigabe oder allgemeine freie Lizenz für alle Bestandteile behauptet.

`src/geography-outlines.json` dokumentiert Datum, Quell-Hash und Verarbeitung: Gebietsflächen vereinigt, schmale Landfüllungen an Straßen-/Bahnquerungen für erkennbare Inseltrennung entfernt, Küsten mit 16 m bzw. 145 m Toleranz vereinfacht. Nicht als Gewässer identifizierte innere Gebiets-Lücken werden gefüllt. Die beiden erkennbaren Seen bleiben erhalten. `src/geographic-routes.json` enthält nur Referenz-Haltefolgen, Referenz-Positionen und um 4 m vereinfachte Linienkoordinaten; keine fremden Längen, Zeiten oder Güterverkehrs-Abzweige.

339 Haltepunkte liegen innerhalb der vereinfachten Landflächen. Der erfasste Haltepunkt Rialto Cswy / Oldby Island T liegt rund 9 m außerhalb der Flächenreferenz an einer Wasserquerung; er wird nicht künstlich verschoben. Grayson bleibt auf seiner Quellenposition (−5488, 6773). Die Beschriftung Mount Kalaga wurde von einer zu nördlichen Lage zum Gebietszentrum verlegt. Die Verbindungssuche und die gespeicherten Haltestellenpositionen bleiben unverändert.


## Handyansicht und Installation

Die Karte erlaubt 0,7- bis 32-fache Vergrößerung, Vergrößern am Mauszeiger, Doppelklick und Zwei-Finger-Zoom mit verschiebbarem Mittelpunkt. Marker und Schrift behalten ihre Bildschirmgröße. Unter „Kartenfarben“ stehen Gerät, Hell und Dunkel zur Wahl; die Auswahl bleibt lokal gespeichert. Eigene Bilder werden nicht invertiert.

Der Manifest-Link verwendet `crossorigin="use-credentials"`, damit der Browser die Anmeldung auch beim Laden einer geschützten Installationsbeschreibung mitsendet. Der Zugriffsschutz des bestehenden Sites-Hostings bleibt erhalten. Beim anonymen Abruf am 26.11.2026 antworteten Manifest, Symbole und Service Worker mit HTTP 401. Ein externer Installationsdienst ohne Browsersitzung kann daher weiterhin scheitern; eine erfolgreiche Installation auf Samsung ist damit noch nicht nachgewiesen. Die Browserhilfe unterscheidet Android/Samsung und iPhone, Offline-Speicherung und Installation. Ein angenommener Installationsdialog wird erst beim `appinstalled`-Ereignis als erfolgreich gemeldet.


## Ungefährer Standort und Samsung Internet

„Ich bin ungefähr hier“ wechselt zum Setzen in die geografische Ansicht. Ein Antippen (oder „Kartenmitte verwenden“) setzt einen manuellen Punkt in Spielkoordinaten. Bis zu drei Einstiegshalte innerhalb von 1 km werden nach tatsächlicher Koordinatenentfernung sortiert. Ohne passende Positionsdaten oder ohne Einstieg im Umkreis werden keine Halte erfunden. Die Vorschläge zeigen Luftlinien, keine geprüften Fußwege. Ein Halt kann ausdrücklich als Start gewählt werden. Der Punkt bleibt im laufenden Planungszustand erhalten, wird nicht exportiert oder übertragen und wird bei Neuladen oder Netzwechsel gelöscht. GPS wird nicht angefragt. Eigenes Kartenbild und Haltestellen verwenden dieselbe geografische Projektion.

Samsung Internet wird anhand seiner Browserkennung mit „eingeschränkte Unterstützung“ gekennzeichnet; der Hinweis empfiehlt Chrome und bietet das Kopieren des aktuellen Links an. Grundlage ist der berichtete Gerätetest: Chrome konnte installieren und die Farben richtig umschalten; Samsung Internet scheiterte weiterhin bei Installation und Farbtreue. Eine universelle Aussage über alle Samsung-Versionen oder ein erfolgreicher Samsung-Fix wird nicht behauptet. Der Installationsknopf wird dort nicht aktiv beworben. Haltestellennamen haben nun eine feste Kontrastfläche ohne Textumrandung; diese Umrandung kann vom erzwungenen Dunkelmodus getrennt umgefärbt werden.


## GitHub und öffentliche Website

Dieses Repository ist die portable Quellfassung. Es enthält weder die Identität des bisherigen privaten Hostings noch Zugangsdaten oder lokale Kartenbilder. Der Quellcode-Upload aktiviert noch keine neue öffentliche Website. Die bestehende private Test-App wird dadurch nicht umgestellt.

Die GitHub-Aktion „Test and build“ installiert mit `npm ci`, führt alle Tests aus und erzeugt `dist/` samt Offline-Paket. Der fertige Build liegt als „leonida-transit-dist“ im jeweiligen Actions-Lauf. `private: true` in package.json schützt vor versehentlichem npm-Publishing und hat keinen Einfluss auf die öffentliche Website oder Repository-Sichtbarkeit.

Für Cloudflare Pages: Repository `2fat4u/leonida-transit` verbinden, Produktionszweig `main`, Projektwurzel, Build-Befehl `npm test && npm run build`, Ausgabeverzeichnis `dist`, Node.js 22. Den Projektnamen `leonida-transit` verwenden, soweit verfügbar; eine eigene neutrale Domain kann später ergänzt werden. Die öffentliche Adresse soll keine persönlichen Namenszusätze enthalten. Es ist keine Anmeldung im App-Code eingebaut; ein öffentliches statisches Hosting benötigt die Anmeldung des bisherigen privaten Hosts nicht.

Die App setzt aktuell Hosting an der Domain-Wurzel voraus. Für eine GitHub-Pages-Projektadresse mit Unterpfad müssen Asset-Pfade, Manifest und Service Worker zuerst entsprechend angepasst werden. Diese GitHub-Aktion veröffentlicht deshalb keine GitHub-Pages-Website automatisch.

Vor der öffentlichen Nutzung den installierten Build auf dem Zielgerät prüfen: Chrome auf Android konnte beim berichteten Gerätetest installieren und die Kartenfarben korrekt umschalten. Samsung Internet bleibt als eingeschränkt unterstützt gekennzeichnet. Ein eigenes Kartenbild wird pro Gerät erneut gewählt. Beim ersten Besuch vollständig laden; Updates werden unter „Daten & Offline“ bewusst übernommen.

Haltestellenauswahl: „Als Start“ und „Als Ziel“ schließen das Kartenfenster und die Detailauswahl. Die Verbindungssuche bestätigt die übernommene Station. Manuell gesetzte ungefähre Standorte bleiben beim Planen erhalten, bis die Seite neu geladen oder das Netz gewechselt wird.
