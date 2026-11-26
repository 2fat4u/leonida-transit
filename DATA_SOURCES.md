# Fan data and map references

The MIT license in LICENSE applies to the project-authored application code and original fictional demo content. It does not relicense the externally sourced transit facts, collections, annotations, geometry, game names, trademarks, or third-party dependencies listed here.

## Files containing source-dependent data

- src/research-network.json: stop names, marker identities, stop sequences, game positions, source records and their project-specific normalisation.
- src/geographic-routes.json: reference stop sequences and positions, and simplified passenger route shapes from GTAMap.
- src/geography-outlines.json: merged, adjusted and simplified area outlines from GTAMap, plus processing and provenance records.
- src/route-audit.json and public/line-audit.txt: comparison and audit results referring to the same fan sources.
- src/schematic-cache.json: a generated schematic layout derived from the researched network. The generation code is project-authored; generated content does not gain a blanket new license over its source data.

These files are provided with source and uncertainty notices. No blanket MIT or other uniform open-data license is claimed for the underlying collections or annotations. A source being publicly reachable does not itself establish permission to relicense it. No Rockstar or Take-Two approval is claimed.

## Sources and adaptations

Checked on 2026-11-26:

- GTAMap Transit Lines: https://gtamap.io/gta-6-transit-lines/
- GTAMap transit data: https://gtamap.io/data/transit/gta6.json?v=ae10a7b6
- GTAMap area data: https://gtamap.io/data/areas/gta6.json?v=5007e3bb
- GTAMap source and rights notice: https://gtamap.io/disclaimer/
- GTABase station-name comparison: https://www.gtabase.com/gta-6/map/?feature=public-transport
- GTABase bus-stop name comparison: https://www.gtabase.com/gta-6/map/?feature=bus-stop

GTAMap identifies some GTADB.ORG community map and landmark layers as CC BY 4.0. This project does not assume that statement licenses every GTAMap transit annotation, area file or collection. Where those identified layers apply, attribution belongs to GTADB.ORG and its contributors, with source https://map.gtadb.org and license https://creativecommons.org/licenses/by/4.0/ . GTAMap's notices also identify original annotations as its own. These source-specific distinctions are preserved rather than replaced by a blanket license claim.

Project adaptations include normalising directly consecutive duplicate markers, preserving directed calls and repeated visits, excluding freight routes, auditing explicit loop closures, simplifying passenger route traces with a four-metre tolerance, and merging/simplifying area references for two map detail levels. Wait times and source distance values are not imported. Physical stop positions are not adjusted to make the background fit. Matching geometry is used only when the complete stop sequence and positions match its reference.

All network information remains provisional fan work. Independent in-game accuracy, playable access, station transfers and walking paths are not guaranteed.

No downloaded Rockstar poster, source map tiles, game screenshots or source website artwork are included. User-supplied map images remain on the user's device and are not part of this repository or exported networks.

Grand Theft Auto, GTA, the game world and related marks belong to their respective rights holders, including Rockstar Games and Take-Two Interactive. Leonida Transit is an independent fan project.
