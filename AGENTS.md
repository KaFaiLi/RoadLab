# Working on RoadLab

RoadLab is a static React + strict TypeScript application using Vite, Tailwind CSS and original SVG scenes. Keep frontend dependencies and the npm lockfile in sync. Use Node 22.12 or newer.

## Architecture

- src/content separates inventory, questions, source metadata, scene configurations, schemas and hand-written UI translations. Use stable IDs. Attempts refer to question and option IDs.
- src/lib/game.ts owns sampling, locale selection, score and mistake calculations, plus versioned browser storage.
- src/features contains screen components. src/components contains illustrations, common controls, source references and statistics. src/App.tsx owns navigation and the current progress snapshot.
- public/assets/signs contains credited crops from the official MLIT inventory. Keep all image dependencies local.

## Editorial gate

Read the official source and the relevant passage before setting a rule or question to verified. Record its URL through the source registry, precise section, date checked, region, vehicle class, and conditions in the explanation. Distinguish a driving obligation from advice and sign information. Add all three translations together. Preserve official Japanese sign names. Update docs/content-coverage.md for each publication. Use pending status until questions, options, artwork and source support agree. Scored sessions only draw from verified content.

## Release gate

Run the local commands in README.md. Check unique IDs, option and scene references, locale completeness, source metadata and artwork credits. Review each sign image against the source. Exercise locale switching, learning, assessment, error review, progress after reload and the production subpath on desktop and mobile. Confirm keyboard operation, visible focus and readable narrow-screen layouts. Keep GitHub Pages deployment gated by the quality job on main.
