# RoadLab

RoadLab is an independent, mobile-first field guide and practice game for driving in Japan. It includes 20 source-checked questions, 11 illustrated sign entries and seven interactive road scenes. The interface, questions, answers and explanations are available in Traditional Chinese, English and Japanese. Official Japanese sign names are retained.

## Play locally

Use Node.js 22.12+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, including the case-sensitive `/RoadLab/` path. The dashboard links to instant-feedback sign learning, a configurable randomised assessment and scenario challenges. Progress shows category accuracy and offers mistake practice, export, import and confirmed reset. Progress is local to each browser profile. Each answer is saved immediately. Reloading an unfinished session returns to session setup.

## Verify a production build

```sh
npm run lint
npm run format
npm run typecheck
npm run content
npm test
npm run build
npx playwright install --with-deps chromium webkit
WEBKIT=1 npm run e2e
npm run preview
```

The browser suite serves the production build and exercises Chromium desktop, Android-sized Chromium and iPhone-sized WebKit. For a preinstalled Chromium binary, set `CHROMIUM_PATH` to its executable. WebKit tests are enabled by `WEBKIT=1`. Hash routes survive refresh on static hosting.

## GitHub Pages setup

1. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
2. Enable GitHub Actions for the repository. Merge the implementation pull request into `main`.
3. In **Actions → Quality and Pages**, check that both `quality` and `deploy` succeed. For a previously merged change, use **Run workflow** on `main`.
4. Open the deployment link on the successful `github-pages` environment and refresh the catalogue route. The deployment workflow determines the asset base from the actual repository name.

## Content and assets

The app ships all content and artwork locally. Each published item links to its source. The scenic illustrations are original RoadLab SVG drawings. The sign images were cropped from MLIT’s official inventory under Japan's Public Data License 1.0. Attribution and outstanding coverage are recorded in [content coverage](docs/content-coverage.md). The [implementation plan](docs/implementation-plan.md), [roadmap](docs/roadmap.md) and [contributor guide](AGENTS.md) describe the code and editorial process.
