# Technical reference

This document covers advanced network imports, routing and map behaviour. For setup and everyday use, see the [README](../README.md).

### Minimal fictional example

```json
{
  "schemaVersion": 1,
  "id": "example-network",
  "name": "Fictional example network",
  "status": "demo",
  "source": {
    "name": "Fictional example",
    "url": "https://example.org/source",
    "license": "Fictional example only",
    "checkedAt": "2026-11-26"
  },
  "stops": [
    {"id": "a", "name": "Demo Station A", "x": 150, "y": 150},
    {"id": "b", "name": "Demo Station B", "x": 500, "y": 450}
  ],
  "lines": [{
    "id": "DEMO-1",
    "name": "Demo Line",
    "mode": "bus",
    "color": "#ffc45e",
    "patterns": [{
      "id": "out",
      "headsign": "Demo Station B",
      "stops": ["a", "b"],
      "partial": true
    }]
  }]
}
```

- Modes: `bus`, `metro`, `rail`. Status values: `demo`, `community`, `research`.
- Import limits: 2 MB, 500 stops, 50 lines, four directions per line, 300 calls per direction and 3,000 calls in total.
- Diagram coordinates use a 1000 × 800 SVG space: x from 30–970, y from 30–770.
- Physical positions are separate: `position: {"x": 0, "y": 0, "system": "game", "sourceId": "source-id"}`. The source ID must reference an entry in the network's `sources` list.
- Travel times are optional. Missing times remain unknown and are omitted from normal exports. Legacy files with time values remain readable.
- `airDistancesMetres` contains the derived straight-line distance to the next call, including loop closure where applicable, or `null` when positions are missing. Imports recalculate these values from physical positions.
- Invalid input does not replace the current network.

### Routing and geometry

Routing uses Dijkstra's algorithm on a directed occurrence graph. Repeated calls remain distinct; staying on the same vehicle does not skip intervening visits. Explicitly closed loops can cross their boundary without an artificial transfer. The UI compares stop segments and transfers rather than displaying unsupported travel or waiting times.

Optional walking transfers are off by default. Their distance limit can be set from 1 m to 10 km, with a default of 300 m. Each starting stop contributes at most three nearby boarding candidates. Walking segments must lead to a subsequent ride; the graph does not chain unverified walks or add a final walk with no following service.

The bundled schematic layout is precomputed and bound to stop positions and network topology by a signature. Imported networks receive their own schematic layout. Geographic route shapes are used only when the complete stop sequence and all physical positions match the stored reference; otherwise the map draws dashed stop connections.

The geographic background contains 151 simplified land features; the schematic background keeps 19 major land masses and a compact Lake Leonida. Draper Island and Vice Beach are separate from the mainland. The source and processing hashes are stored in `src/geography-outlines.json` and `src/geographic-routes.json`. No source map tiles or downloaded Rockstar poster are bundled.

Images use a proportional alignment: translation, rotation and uniform scaling. The optional third control point reports an error rather than changing the transformation. Images saved with the earlier alignment format remain available for review and must be explicitly realigned before display.

## Map controls and local images

Stop symbols and labels keep their screen size while zooming. Use pinch gestures, the zoom buttons, double-click, or Ctrl/Cmd with the mouse wheel. Drag to pan. The schematic map simplifies geographic positions; the geographic map uses game coordinates. Crossing lines do not create an interchange without a shared stop marker.

Under **Your own map image**, choose a JPG, PNG or WebP file up to 15 MB and 30 megapixels. Set two recognisable places far apart. An optional third point checks the fit without stretching the image. The alignment preview supports 16× zoom; the main map supports 32× zoom. Different projections and provisional fan positions can still produce alignment errors.

Images, alignment points, opacity and visibility remain in IndexedDB on the current device. They are not uploaded or included in network exports. Choose the image again on another device. Export custom networks as a backup because browsers can clear local storage.

## Manual position and journey state

**I'm approximately here** switches to geographic placement. Tap a point or use the map centre. Up to three boardable stops within 1 km are sorted by physical straight-line distance and can be selected as an origin. The point remains while planning and is cleared on reload or network change. No GPS is requested.

The journey companion requires manual confirmation of boarding, stops, transfers and arrival. Valid saved progress can resume after a reload. Switching networks ends the active journey. Imported data is validated before replacing the network; legacy files remain readable where supported.

## Installation and hosting details

The development server does not register the service worker. Installation and offline caching use the production build over HTTPS or localhost. An offline-ready indicator confirms cached content rather than a successful installation. Updates are explicitly offered under **Data & offline**; the worker retains two previous asset versions.

On iOS, installation is offered through Safari's share menu. iOS hardware has not been verified. Chrome on Android successfully installed the app in the reported device test. Samsung Internet remains limited for installation and map colours, with a targeted notice in the app.

Private hosting may protect the manifest, icons and service worker behind sign-in. The manifest link requests browser credentials, but an installation service without that browser session may still be unable to fetch protected files. A public static host does not require the previous private host's authentication; the portable app itself contains no sign-in system.

`private: true` in package.json prevents accidental npm publishing; it does not control repository visibility or website access. The CI workflow tests and builds the app, and uploads `dist/` as the **leonida-transit-dist** artifact. It does not automatically enable a GitHub Pages website. Hosting at a repository subpath requires coordinated asset, manifest and worker-path changes first.

## Sources and audits

The researched network has 19 passenger lines, 25 directions and 340 stop entries, including 41 unnamed shelters. GTAMap supplies the main route and geometry references; GTABase provides a limited name comparison. Source matching does not establish independent upstream data or in-game accuracy. N02 is treated as a regular bus; freight routes are excluded.

For provenance and licensing distinctions, see [DATA_SOURCES.md](../DATA_SOURCES.md). Additional audit notes are in [LOGIKPRUEFUNG.md](../LOGIKPRUEFUNG.md) and [PRUEFBERICHT.md](../PRUEFBERICHT.md), currently in German.
