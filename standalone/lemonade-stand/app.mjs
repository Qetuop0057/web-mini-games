import { names, money, newGame, weather, runDay } from "./engine.mjs";
let state = newGame(), conditions = weather();
const $ = id => document.getElementById(id);
const recipe = () => ["lemons", "sugar", "ice"].map(id => Number($(id).value));
const order = () => names.map((_, i) => Number($("order" + i).value));
function updatePlan() {
  const amounts = order();
  $("cost").textContent = money(amounts.reduce((sum, n, i) => sum + n * conditions.prices[i], 0));
  const usage = [1, ...recipe()];
  const capacities = amounts.map((n, i) => Math.floor((state.inventory[i] + n) / usage[i]));
  $("capacity").textContent = capacities.every(Number.isFinite) ? Math.max(0, Math.min(...capacities)) : "—";
}
function prepare() {
  $("setup").hidden = false; $("result").hidden = true; $("error").textContent = "";
  $("day").textContent = state.day; $("cash").textContent = money(state.cash); $("temperature").textContent = `${conditions.temperature}°F`;
  $("supplies").replaceChildren();
  names.forEach((name, i) => {
    const label = document.createElement("label"); label.className = "supply";
    const text = document.createElement("span"); text.textContent = `${["🥤", "🍋", "🍬", "🧊"][i]} ${name}`;
    const detail = document.createElement("small"); detail.textContent = `${money(conditions.prices[i])} each · ${state.inventory[i]} in stock`; text.append(detail);
    const input = document.createElement("input"); Object.assign(input, { id: "order" + i, type: "number", min: "0", max: "1000", step: "1", value: "0" }); input.setAttribute("aria-label", `${name} to buy`); input.addEventListener("input", updatePlan);
    label.append(text, input); $("supplies").append(label);
  }); updatePlan();
}
$("open").addEventListener("click", () => {
  try {
    const result = runDay(state, conditions, order(), recipe(), Math.round(Number($("price").value) * 100)); state = result.state;
    const s = result.summary; $("setup").hidden = true; $("result").hidden = false; $("cash").textContent = money(state.cash);
    $("sold").textContent = s.sold; $("revenue").textContent = money(s.revenue); $("spent").textContent = money(s.cost); $("profit").textContent = money(s.profit);
    $("customers").textContent = `${conditions.customers} visitors · ${s.rejected} declined the price · ${s.missed} missed due to supplies`;
    $("events").replaceChildren(...s.events.map(message => { const li = document.createElement("li"); li.textContent = message; return li; }));
    $("left").replaceChildren(...names.map((name, i) => { const span = document.createElement("span"); span.textContent = `${name}: ${state.inventory[i]}`; return span; }));
  } catch(error) { $("error").textContent = error.message; }
});
$("next").addEventListener("click", () => { state.day++; conditions = weather(); prepare(); });
$("restart").addEventListener("click", () => { state = newGame(); conditions = weather(); ["lemons", "sugar", "ice"].forEach(id => $(id).value = "1"); $("price").value = "1.50"; prepare(); });
["lemons", "sugar", "ice"].forEach(id => $(id).addEventListener("input", updatePlan));
prepare();
