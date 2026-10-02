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
- `/games/lemonade-stand`: introduction, actual gameplay screenshots, and a link to the independent game website
- `/games/snake` and `/games/memory-match`: Coming Soon pages
- Unknown game slugs return a 404.

## Add a game

1. Add its metadata to `src/games/registry.ts`.
2. Add its introduction, instructions, preview screenshots, and `playUrl` to the registry.
3. Build and deploy its standalone website. The portal renders all game introduction pages from the registry.

Cards and route metadata use the shared registry. Every game has its own URL and a link back to the collection.

## Current scope

The main website is a portal: cards lead to introduction pages, and Start game leads to a separate game origin in the same tab. Coming-soon games have no launch link or fabricated screenshots.

Lemonade Stand runs independently at https://qetuop-lemonade-stand.yuanz1.chatgpt.site. Its source is in `standalone/lemonade-stand/`: a static browser game with a $20 start, weather, supplies, recipe editing, price-sensitive customers, daily summaries, and inventory carryover. Supply prices are adjusted from the lab for browser play. Refreshing resets the session; persistent saves are not implemented yet.

Preview PNGs in `public/previews/` are actual screenshots of the game. Refresh them when the game UI changes.

Run the standalone game locally with `python3 -m http.server 3001 --directory standalone/lemonade-stand`, and test its rules with `node --test standalone/lemonade-stand/engine.test.mjs`.


## Checks

```sh
npm run lint
npm run typecheck
npm run build
```
