# Prüfstand für die GitHub-Übernahme

Der lokale Test- und Buildlauf der portablen Fassung wird vor dem Upload erneut durchgeführt. Den jeweils aktuellen Stand zeigt zusätzlich die Aktion „Test and build“ im Repository; eine feste alte Testanzahl wird hier nicht als laufend aktuell ausgegeben.

Die Tests prüfen gerichtete Routensuche, Umstiege, Ringfolgen, manuelle Fahrtzustände, Import/Export, Fehlerspeicherfälle, Sprachen, Luftlinien, Bildausrichtung, Kartengeometrien, Kartenkamera, Farbkontraste, manuelle Standortmarkierungen, Samsung-Hinweise und Service-Worker-Caches.

In den bisherigen Browserprüfungen wurden Desktop sowie 320 und 390 Pixel Breite, beide Kartenmodi und Farbvarianten, Zoom bis 32-fach, Haltestellenauswahl als Start und Ziel, das Schließen der Auswahl, manuelle Standortmarkierungen, nahe Einstiegshalte, Netzwechsel, Fahrtbegleitung und das Wiederladen bei abgeschaltetem App-Server geprüft. Das ist keine vollständige Prüfung aller Endgeräte oder aller Fußwege.

Der Nutzer konnte die App auf seinem Samsung-Handy in Chrome installieren und die Kartenfarben korrekt umschalten. In Samsung Internet scheiterten Installation und Farbtreue weiter. Dafür steht ein gezielter Hinweis in der App. Die gesamte Internetverbindung des Prüfrechners wurde beim Offline-Smoke-Test nicht abgeschaltet; geprüft wurde der Ausfall des App-Ursprungs, zusätzlich zu automatisierten Worker-Tests ohne Netzwerk.

Alle recherchierten Netz- und Geografiedaten bleiben vorläufige Fan-Referenzen. Hinweise zu den Quellen und Lizenzen stehen in DATA_SOURCES.md.
