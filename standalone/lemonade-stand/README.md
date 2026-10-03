# Lemonade Stand

Standalone Canvas 2D game, no external runtime dependencies.

Start with $15 and 10 free cups, lemons, sugar and ice each, plus 5 strawberries and 5 watermelon portions. Set the price and open immediately, or buy extra supplies in the Market before opening for a 75-second day. Customers walk into a four-place queue. The counter automatically prepares one paper cup when the first customer reaches the stand. Click Lemon, Sugar and Ice to add individual portions (one to three of each), then Mix & serve to stir for 1.25 seconds and hand over this specific drink. There is no day-wide recipe selector.

Customers reject expensive drinks, leave a full queue, lose patience or leave when the stand sells out. Pause/Resume stops the clock, movement and cooking. Changing tabs pauses automatically. Sound is optional.

When the timer runs out, finish the queue and review the summary. End day closes immediately, including while paused: completed sales and tips remain, the unfinished cup is counted as waste, and queued customers leave without new charges or revenue. Continue to the next day from the summary. Inventory carries over. Refreshing starts a new session.

Customers have sour, sweet or cool preferences. Cool preference chance is 20% in rain, 50% at 85°F or hotter, and one third otherwise; sour and sweet split the remainder. Balance is sugar minus lemons; ideal balance/ice pairs are (-1,2), (1,2) and (0,3). Manhattan distance 0 gives a 20% tip, distance 1 gives 10%, and distance 2 or more gives no tip. Tips round to cents and arrive with the completed sale. Order bubbles show a lemon, sugar cube or ice cube; feedback appears after tasting. Sales revenue and tips are separate in the daily summary; net cash change includes both. No end-of-day advice is shown.

## In-game weather and forecast

Setup shows today's weather/temperature and tomorrow's forecast. Forecasts are exact in this version: the next day consumes the previously generated forecast rather than rerolling it. No real-world weather API is used. Weather stays fixed during each day.

Sunny: 40%, 70–86°F, traffic ×1, budget +0 cents. Cloudy: 30%, 60–78°F, traffic ×0.85, budget −10 cents. Rainy: 20%, 60–74°F, traffic ×0.55, budget −25 cents. Heatwave: 10%, 85–90°F, traffic ×1.25, budget +15 cents.

Temperature still speeds arrivals and raises customer budgets. Weather additionally modifies arrival intervals and budgets. Hot days attract more ice-loving customers without changing the taste/tip thresholds. Rain shades the scene and adds animated raindrops; 60% of rainy-day customers carry one of three colored pixel umbrellas for their entire visit. Umbrellas follow walking, queuing and leaving, and bob only while moving. They have no gameplay effect; clouds dim it; heat adds a warm tint. Pause freezes these effects too.

## Run

`python3 -m http.server 3001` from this directory, then open http://localhost:3001.

## Check and build

`node --test *.test.mjs`

`node build.mjs` creates a clean `out/` for Sites hosting.

`simulation.mjs` owns customer state, movement, queue ownership and transactions. `art.mjs` renders the street/home; `mixing-art.mjs` renders ingredient icons, the live cup, falling ingredients, stirring and delivery. `app.mjs` connects controls, audio and HUD. `engine.mjs` contains lab-derived economy helpers and the original batch rule retained for regression tests.

Asset licenses and sources are recorded in `assets/credits.md`. No researched third-party game code was copied.

## Home screen

Each day begins at the player's house, with the stored stand in a fenced yard on the right. Choose an unlocked selling destination on the map to open the inventory/price preparation panel; Home cancels preparation without spending money. The clickable open-book icon above the yard stand shows reference recipes and their taste balance. It replaces the footer Recipe button and supports keyboard and touch input. Looking at the recipe, returning home and preparing do not advance time, generate customers or reroll the forecast. Finishing a day and choosing Next day returns home with carried-over cash and inventory. Only the Market buys supplies. Open stand starts the day without a purchase.

The day number is drawn on a wooden board to the left of the house. House and yard are raised to leave room for a lower crossroads. Click the MAP sign (or focus it with Tab and press Enter) to view a map of Home and Street stand, with future Park and Market areas marked Coming soon. The map is informational at this stage; it does not select or unlock locations. Opening or closing it does not change the day, money or forecast.

## Paged recipe book

The recipe icon opens a large two-leaf book. Each spread contains one recipe: balanced lemonade [1,1,2], sour lemonade [2,1,2], sweet lemonade [1,2,2], and ice-cold lemonade [2,2,3]. Ingredient quantities and all five sour/sweet levels and three ice levels are listed, with the current recipe's levels highlighted. Bottom left/right arrows turn pages; keyboard Left/Right also work. First/last page arrows disable at the ends. Escape or the close button returns home. Browsing never applies a recipe or spends supplies.

Click the stored lemonade stand in the home yard to inspect remaining cups, lemons, sugar and ice, plus maximum drink capacity using at least one of each ingredient. This is a read-only view of owned stock. Back home or Escape closes it. During gameplay, the counter material buttons and Mix & serve control handle drink preparation.

## Town destinations and unlocks

The enlarged map has Market, Lemon Lane (starting street), Willow Park, Commercial Street and Night Market. Market and Lemon Lane are open initially. Park unlocks at 20 lifetime cups sold, Commercial Street at 50, and Night Market at 100. Only completed sales count; totals carry across days and reset with a new game/refresh. Locked destinations show progress and cannot be selected, with the simulation checking eligibility independently of disabled map buttons.

Market purchases add owned supplies and deduct cash immediately without starting the day. Market costs are included in that day's supply expenses and net cash change. Preparing a stand shows owned inventory and the price setting; extra stock must be purchased in the Market. Choosing an unlocked selling location opens preparation, and that destination is fixed during the day. Park has benches, Commercial Street has buildings, and Night Market has lit stalls. Customer economy rules currently remain shared across selling locations; location-specific traffic/prices/fees can be added later.

### Home television
Click the TV in the left house window to watch two channels: today/tomorrow weather from the game forecast, and town news showing open destinations and the next sales milestone. The lower-right arrow changes to the previous channel; Escape closes the TV. Watching television does not advance time or spend money.

Stand preparation uses existing inventory only: choose a price, then open. Supply purchases are made in the Market.

## Mixing at the counter

Small ingredient icons occupy a shelf on the left of the street, with numeric stock and portion counts. Ingredient names remain available to screen readers. A compact bottom counter holds the cup, mixing/discard controls, Pause and End day.

Paper cups and portions are charged to inventory immediately. Each customer asks for sour, sweet or cold lemonade; taste feedback and the existing 20%/10%/0% tipping rules use the actual cup contents. Customers continue to lose patience while the player adds ingredients, but the customer being served waits during stirring. Ingredient additions and discarding are blocked during mixing and pause. Completed sales never debit materials a second time, even when the current cup uses the final inventory portions.

If a customer leaves, the unfinished cup stays for the next customer. Discard cup wastes it without a refund. An unfinished cup is also discarded at day end, and wasted cups are counted in the summary. Budget decisions use a fixed base lemonade before tasting, rather than a recipe chosen before opening. The top CUPS counter reports paper cups remaining; the home inventory panel shows the maximum possible drinks using one of each ingredient.

Keyboard: 1 = lemon, 2 = sugar, 3 = ice; Space mixes/serves when not focused on a button. Buttons also work with Tab and Enter/Space. Escape pauses. Changing tabs pauses automatically.

## Market scene

The market is static: one fruit stall, one dry-goods stall and a vending machine entrance. Clicking a stall or its wooden sign opens only that stall's purchase dialog. Fruit: lemons, watermelon, strawberries and oranges. Dry goods: sugar, milk, ice and paper cups. The vending machine opens a Coming soon panel and cannot charge money. Escape or the close button returns to the market.

Prices for lemons, sugar, ice and paper cups retain the existing daily market prices. New fruit/milk prices are fixed for now: watermelon $0.80, strawberries $0.50, oranges $0.40, milk $0.60 per unit. Purchases validate all quantities and cash before changing any stock, and count toward daily supply expenses. The new fruit and milk are carried in a separate pantry and shown in the home inventory panel; strawberry and watermelon are live ingredients for Pink lemonade and Watermelon lemonade; oranges and milk remain reserved for later drinks. New sessions reset the pantry to starter fruit quantities; next-day transitions retain it.

Original market PNGs, complete credit/source notices and CC BY-SA 3.0 license are included in assets; the Market screen links to the credits. Background arrangement and crops remain shared under CC BY-SA 3.0. No market characters or shopping animations are rendered.

## Shared game frame

Home, Market, the selling scene and all dialogs share one viewport-sized game frame. The HUD row is fixed and the scene fills the remaining space. Market navigation and the mixing counter are positioned inside the frame, so changing views or opening/closing the stand cannot change its outer size.

## Fruit lemonade orders

Customers independently request classic lemonade (60%), Pink lemonade (20%) or Watermelon lemonade (20%). Pink/watermelon orders show a strawberry/watermelon icon in their speech bubble. All drinks use the selected lemon/sugar/ice portions; Pink requires exactly one strawberry and no watermelon, and Watermelon requires exactly one watermelon and no strawberry. Classic lemonade must contain neither fruit. Fruit comes from Market pantry stock and debits immediately when added, capped at one of each per cup. Keys 4/5 add strawberry/watermelon; the left shelf offers all five ingredient icons.

After mixing, a wrong drink is consumed and counted once as waste and a wrong order. That customer leaves without payment, tips, a sale or unlock progress. Correct drinks use the existing price and sour/sweet/cold tip rules. Discard, pause and early closing also preserve spent fruit without refunds. Fruit stock carries across days; new-game resets restore 5 strawberries and 5 watermelon portions. The recipe book includes both drinks, and the glass becomes pink or watermelon red when fruit is added.
