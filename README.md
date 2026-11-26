# Leonida Transit

**The cheapest way out.**

An unofficial GTA VI transit planner for phones and browsers, built with React and TypeScript. English and German UI, original English stop names, and offline support.

[![Test and build](https://github.com/2fat4u/leonida-transit/actions/workflows/ci.yml/badge.svg)](https://github.com/2fat4u/leonida-transit/actions/workflows/ci.yml)

> The included fan network is provisional. No live tracking, game connection or arrival predictions are provided.

## Features

- Plan directed journeys by bus, metro and regional rail, including transfers and loop routes.
- Explore schematic and geographic maps with line filters, light/dark colours and zoom up to 32×. Select stops as your origin or destination.
- Follow journeys manually, or place an approximate position to find nearby boarding stops.
- Include optional walking transfers based on straight-line distance. Actual walking paths and barriers are unverified.
- Import, export and edit networks, or align your own background image. Custom data and images stay on your device.

## Get the app on your phone

1. Open [Leonida Transit](https://leonida-transit.pages.dev/) on your phone in Chrome on Android.
2. In Chrome's menu, choose **Install app** or **Add to Home Screen** and confirm installation.
3. Open the installed app online once and wait for the offline-ready indicator.

**Samsung Internet has limited support** for installation and map colours. Chrome on Android worked in the reported device test. Updates are offered under **Data & offline**.

Choose **EN** or **DE**, select a journey and confirm each stop yourself in the journey companion.

## Run locally for development

<details>
<summary>Developer setup</summary>

Install **Node.js 22.12+**, download or clone this repository, and open a terminal in the project folder. Then run:

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

While the preview server is running, open `http://localhost:4173` on the same computer. On a phone, `localhost` refers to the phone itself; use the published website address instead.

Use `npm run dev` for development. Installation and offline caching require the production build over HTTPS or localhost.

</details>

## Data and license

The app includes a researched fan network and a separate fictional demo. Sources include GTAMap and GTABase; the documented data check is dated **26 November 2026**.

Project-authored code uses the [MIT License](LICENSE). Fan data, map references and game-related rights are covered separately in [DATA_SOURCES.md](DATA_SOURCES.md). Dependency licenses are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

This is an independent fan project, not affiliated with Rockstar Games or Take-Two Interactive.

## Publishing and further details

The [publishing guide](docs/DEPLOYMENT.md) covers Cloudflare account setup, GitHub access, build settings, obtaining your app link and phone installation. It also explains updates and common errors.

The app currently expects hosting at the **domain root**. GitHub Pages project URLs with a repository subpath need path adjustments first.

See the [technical reference](docs/TECHNICAL_DETAILS.md) for import examples, map alignment and implementation details.
