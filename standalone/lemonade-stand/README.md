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

`node --test engine.test.mjs simulation.test.mjs taste.test.mjs weather.test.mjs locations.test.mjs`

`node build.mjs` creates a clean `out/` for Sites hosting.

`simulation.mjs` owns customer state, movement, queue ownership and transactions. `art.mjs` renders the scene. `app.mjs` connects controls, audio and HUD. `engine.mjs` contains lab-derived economy helpers and the original batch rule retained for regression tests.

Asset licenses and sources are recorded in `assets/credits.md`. No researched third-party game code was copied.

## Home screen

Each day begins at the player's house, with the stored stand in a fenced yard on the right. Choose an unlocked selling destination on the map to open the supply/price preparation panel; Home cancels preparation without spending money. The clickable open-book icon above the yard stand shows current draft quantities and taste balance. It replaces the footer Recipe button and supports keyboard and touch input. Looking at the recipe, returning home and preparing do not advance time, generate customers or reroll the forecast. Finishing a day and choosing Next day returns home with carried-over cash and inventory. Only Open stand buys supplies and starts the day.

The day number is drawn on a wooden board to the left of the house. House and yard are raised to leave room for a lower crossroads. Click the MAP sign (or focus it with Tab and press Enter) to view a map of Home and Street stand, with future Park and Market areas marked Coming soon. The map is informational at this stage; it does not select or unlock locations. Opening or closing it does not change the day, money or forecast.

## Paged recipe book

The recipe icon opens a large two-leaf book. Each spread contains one recipe: the current draft, sour lemonade [2,1,2], sweet lemonade [1,2,2], and ice-cold lemonade [2,2,3]. Ingredient quantities and all five sour/sweet levels and three ice levels are listed, with the current recipe's levels highlighted. Bottom left/right arrows turn pages; keyboard Left/Right also work. First/last page arrows disable at the ends. Escape or the close button returns home. Browsing never applies a recipe or spends supplies.

Click the stored lemonade stand in the home yard to inspect remaining cups, lemons, sugar and ice, plus drink capacity using the current draft recipe. This is a read-only view of owned stock; unpurchased quantities in the preparation form are not included. Back home or Escape closes it. The stand remains a serving control during actual street gameplay.

## Town destinations and unlocks

The enlarged map has Market, Lemon Lane (starting street), Willow Park, Commercial Street and Night Market. Market and Lemon Lane are open initially. Park unlocks at 20 lifetime cups sold, Commercial Street at 50, and Night Market at 100. Only completed sales count; totals carry across days and reset with a new game/refresh. Locked destinations show progress and cannot be selected, with the simulation checking eligibility independently of disabled map buttons.

Market purchases add owned supplies and deduct cash immediately without starting the day. Market costs are included in that day's supply expenses and net cash change. Preparing a stand still allows buying extra stock. Choosing an unlocked selling location opens preparation, and that destination is fixed during the day. Park has benches, Commercial Street has buildings, and Night Market has lit stalls. Customer economy rules currently remain shared across selling locations; location-specific traffic/prices/fees can be added later.

### Home television
Click the TV in the left house window to watch two channels: today/tomorrow weather from the game forecast, and town news showing open destinations and the next sales milestone. The lower-right arrow changes to the previous channel; Escape closes the TV. Watching television does not advance time or spend money.

Stand preparation uses existing inventory only: choose a recipe and price, then open. Supply purchases are made in the Market.
