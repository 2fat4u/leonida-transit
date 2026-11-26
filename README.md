# Leonida Transit

**The cheapest way to get away.**

An unofficial GTA VI transit planner for phones and browsers, built with React and TypeScript. English and German UI, original English stop names, and offline support.

[![Test and build](https://github.com/2fat4u/leonida-transit/actions/workflows/ci.yml/badge.svg)](https://github.com/2fat4u/leonida-transit/actions/workflows/ci.yml)

> The included fan network is provisional. No live tracking, game connection or arrival predictions are provided.

## Features

- Plan directed journeys by bus, metro and regional rail, including transfers and loop routes.
- Explore schematic and geographic maps with line filters, light/dark colours and zoom up to 32×. Select stops as your origin or destination.
- Follow journeys manually, or place an approximate position to find nearby boarding stops.
- Include optional walking transfers based on straight-line distance. Actual walking paths and barriers are unverified.
- Import, export and edit networks, or align your own background image. Custom data and images stay on your device.

## Run locally

Requires **Node.js 22.12+**. CI uses Node.js 22.

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

Open [localhost:4173](http://localhost:4173). Use `npm run dev` for development; installation and offline caching require the production build over HTTPS or localhost.

## Install and use

Open the deployed app online and choose your browser's **Install app** or **Add to Home Screen** option. Open the installed app online once and wait for its offline-ready indicator. Updates are available under **Data & offline**.

Choose **EN** or **DE**, select your journey, and confirm each stop yourself in the journey companion. Selecting an origin or destination on the map closes the selection and confirms the chosen stop.

**Chrome on Android** worked in the reported device test. **Samsung Internet has limited support** for installation and map colours. Other devices, including iOS hardware, have not been fully verified.

## Data and license

The app includes a researched fan network and a separate fictional demo. Sources include GTAMap and GTABase; the documented data check is dated **26 November 2026**.

Project-authored code uses the [MIT License](LICENSE). Fan data, map references and game-related rights are covered separately in [DATA_SOURCES.md](DATA_SOURCES.md). Dependency licenses are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

This is an independent fan project, not affiliated with Rockstar Games or Take-Two Interactive.

## Deployment

For **Cloudflare Pages**, connect this repository and use:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | Repository root |
| Node.js version | `22` |
| Build command | `npm test && npm run build` |
| Output directory | `dist` |

Choose `leonida-transit` as the project name if available, or another neutral name. Uploading the code does not activate a public app address.

The app currently expects hosting at the **domain root**. GitHub Pages project URLs with a repository subpath need path adjustments first.

See the [technical reference](docs/TECHNICAL_DETAILS.md) for import examples, map alignment and implementation details.
