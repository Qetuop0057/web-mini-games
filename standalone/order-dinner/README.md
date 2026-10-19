# 今晚吃什么 · Order Dinner

A dinner-ordering site for two, styled like a small home restaurant. It deploys on its own to https://order-dinner.mini-arcade-hub.workers.dev and does not depend on the hub.

| Path | What it holds |
| --- | --- |
| `src/menu.ts` | The preset dishes, flavor options, removable ingredients and per-serving amounts |
| `src/shopping.ts` | Pure logic for the shopping list and order descriptions (tested) |
| `src/local-store.ts` | Standalone mode: orders kept in this browser only (tested) |
| `src/ui/` | React screens and the site's own stylesheet in `src/style.css` |
| `worker/index.ts` | `/api/dinner/*`, protected by the `ORDER_PASSCODE` secret |
| `migrations/` | D1 schema, applied by `npm run deploy:dinner` |

Commands run from the repository root: `npm run dev:dinner`, `npm test`, `npm run deploy:dinner`.
