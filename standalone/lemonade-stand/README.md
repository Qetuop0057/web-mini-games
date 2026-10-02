# Lemonade Stand

Standalone Canvas 2D game, no external runtime dependencies.

Start with $20. Buy supplies, set a recipe and price, then open for a 75-second day. Customers walk into a four-place queue. Click the play area or press Space to mix one drink (1.25 seconds). Each completed drink earns its price and uses one cup plus the recipe ingredients.

Customers reject expensive drinks, leave a full queue, lose patience or leave when the stand sells out. Pause/Resume stops the clock, movement and cooking. Changing tabs pauses automatically. Sound is optional.

After closing, finish the queue, review the summary and continue to the next day. Inventory carries over. Refreshing starts a new session.

## Run

`python3 -m http.server 3001` from this directory, then open http://localhost:3001.

## Check and build

`node --test engine.test.mjs simulation.test.mjs`

`node build.mjs` creates a clean `out/` for Sites hosting.

`simulation.mjs` owns customer state, movement, queue ownership and transactions. `art.mjs` renders the scene. `app.mjs` connects controls, audio and HUD. `engine.mjs` contains lab-derived economy helpers and the original batch rule retained for regression tests.

Asset licenses and sources are recorded in `assets/credits.md`. No researched third-party game code was copied.
