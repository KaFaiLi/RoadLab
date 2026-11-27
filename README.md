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

## First-person driving

Choose **3D Driving School** on the dashboard or open `#/drive`. Drive a right-hand-drive car through a 150 m Japanese town course. Follow the left lane, stop before the marked line, let the pedestrian cross and reach the green finish gate. Hold the arrow keys or WASD to steer, accelerate and brake. The on-screen controls support simultaneous steering and pedal input. Pause with Escape or the Pause button. Losing window focus pauses the simulation.

The town uses original polygon meshes, a moving perspective camera and a Canvas 2D rasterizer. Shadows, traffic and handling are simplified for this introductory course. A completed or failed drive can be replayed and does not affect quiz scores.

### Urban intersections

Use the driving route selector to choose **Market street** (left turn across a pedestrian crossing), **Station road** (right turn across opposing through traffic), or **Civic avenue** (both conflicts in one right turn). Approach, steer through the actual junction and stay on the left of the exit street until the green destination gate. Hold Q or E, or the look buttons, to check the sides. The signal strip identifies the approach, opposing and pedestrian aspects. Traffic and pedestrians move on the simulation clock while the player waits. Pausing freezes the entire scene. Civic avenue continues to a second intersection with a stop sign after the turn. Changing routes while paused starts a fresh attempt.

### Driving lessons and progress

Nine routes are available in the cockpit. New lessons cover a blocked station exit, a shopper emerging behind a delivery van, a cyclist approaching in the left mirror, a designated right-turn lane with a protected arrow, and braking behind a lead vehicle on snow. Civic Avenue offers three fixed, replayable encounter schedules. Select one before starting, repeat the same encounter, or choose the next variation from the result screen.

The decision review shows timed observations, waits and the outcome. The Progress screen counts demonstrated driving skills separately from quiz accuracy. Driving summaries share the existing local export, import and reset controls. Earlier exports remain compatible.
