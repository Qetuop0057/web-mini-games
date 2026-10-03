# Lemonade Stand

Standalone Canvas 2D game, no external runtime dependencies.

Start with $20. Buy supplies, set a recipe and price, then open for a 75-second day. Customers walk into a four-place queue. Click the play area or press Space to mix one drink (1.25 seconds). Each completed drink earns its price and uses one cup plus the recipe ingredients.

Customers reject expensive drinks, leave a full queue, lose patience or leave when the stand sells out. Pause/Resume stops the clock, movement and cooking. Changing tabs pauses automatically. Sound is optional.

After closing, finish the queue, review the summary and continue to the next day. Inventory carries over. Refreshing starts a new session.

Customers have sour, sweet or cool preferences. Cool preference chance is 20% in rain, 50% at 85°F or hotter, and one third otherwise; sour and sweet split the remainder. Balance is sugar minus lemons; ideal balance/ice pairs are (-1,2), (1,2) and (0,3). Manhattan distance 0 gives a 20% tip, distance 1 gives 10%, and distance 2 or more gives no tip. Tips round to cents and arrive with the completed sale. Order bubbles show a lemon, sugar cube or ice cube; feedback appears after tasting. Sales revenue and tips are separate in the daily summary; net cash change includes both. No end-of-day advice is shown.

## In-game weather and forecast

Setup shows today's weather/temperature and tomorrow's forecast. Forecasts are exact in this version: the next day consumes the previously generated forecast rather than rerolling it. No real-world weather API is used. Weather stays fixed during each day.

Sunny: 40%, 70–86°F, traffic ×1, budget +0 cents. Cloudy: 30%, 60–78°F, traffic ×0.85, budget −10 cents. Rainy: 20%, 60–74°F, traffic ×0.55, budget −25 cents. Heatwave: 10%, 85–90°F, traffic ×1.25, budget +15 cents.

Temperature still speeds arrivals and raises customer budgets. Weather additionally modifies arrival intervals and budgets. Hot days attract more ice-loving customers without changing the taste/tip thresholds. Rain shades the scene and adds animated raindrops; 60% of rainy-day customers carry one of three colored pixel umbrellas for their entire visit. Umbrellas follow walking, queuing and leaving, and bob only while moving. They have no gameplay effect; clouds dim it; heat adds a warm tint. Pause freezes these effects too.

## Run

`python3 -m http.server 3001` from this directory, then open http://localhost:3001.

## Check and build

`node --test engine.test.mjs simulation.test.mjs taste.test.mjs weather.test.mjs`

`node build.mjs` creates a clean `out/` for Sites hosting.

`simulation.mjs` owns customer state, movement, queue ownership and transactions. `art.mjs` renders the scene. `app.mjs` connects controls, audio and HUD. `engine.mjs` contains lab-derived economy helpers and the original batch rule retained for regression tests.

Asset licenses and sources are recorded in `assets/credits.md`. No researched third-party game code was copied.
