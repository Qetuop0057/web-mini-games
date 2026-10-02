# Web Mini Games

A browser mini-game arcade built with Next.js App Router, TypeScript, and Tailwind CSS. No backend, authentication, or database.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Routes

- `/`: arcade homepage
- `/games`: game collection
- `/games/lemonade-stand`: Lemonade Stand preparation preview
- `/games/snake` and `/games/memory-match`: Coming Soon pages
- Unknown game slugs return a 404.

## Add a game

1. Add its metadata to `src/games/registry.ts`.
2. Place game components and rules in `src/games/<slug>/`.
3. Connect its component in `src/app/games/[slug]/page.tsx`.

Cards and route metadata use the shared registry. Every game has its own URL and a link back to the collection.

## Current scope

The website framework and responsive navigation are ready. Lemonade Stand includes an interactive shopping planner with a $20 budget; this preview does not execute purchases or simulate sales. Its supply prices are draft browser-game values. Next: port the lab rules into a standalone engine, add recipe editing, customer decisions, and daily summaries.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```
