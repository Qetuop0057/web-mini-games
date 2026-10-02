export const names = ["Cups", "Lemons", "Sugar", "Ice"];
export const money = cents => `$${(cents / 100).toFixed(2)}`;
export function newGame() { return { day: 1, cash: 2000, inventory: [0, 0, 0, 0] }; }
export function weather(random = Math.random) {
  const temperature = 60 + Math.floor(random() * 31);
  const customers = temperature >= 85 ? 15 + Math.floor(random() * 11) : temperature >= 75 ? 8 + Math.floor(random() * 11) : 3 + Math.floor(random() * 8);
  return { temperature, customers, prices: [10, 20, 10, 5].map(base => base + Math.floor(random() * 3) * 5) };
}
// 所有钱以整数美分计算；先验证全部输入，再一次性采购，防止部分扣款。
export function runDay(state, conditions, order, recipe, price, random = Math.random) {
  if (order.length !== 4 || order.some(n => !Number.isInteger(n) || n < 0 || n > 1000)) throw Error("Choose whole supply quantities from 0 to 1000.");
  if (recipe.length !== 3 || recipe.some(n => !Number.isInteger(n) || n < 1 || n > 10)) throw Error("Recipe quantities must be whole numbers from 1 to 10.");
  if (!Number.isInteger(price) || price < 1 || price > 10000) throw Error("Set a price between $0.01 and $100.");
  const cost = order.reduce((sum, n, i) => sum + n * conditions.prices[i], 0);
  if (cost > state.cash) throw Error("Not enough cash for these supplies.");
  const inventory = state.inventory.map((n, i) => n + order[i]);
  const usage = [1, ...recipe]; let sold = 0, rejected = 0, missed = 0; const events = [];
  for (let i = 0; i < conditions.customers; i++) {
    // 天气提高顾客预算，配方和售价共同影响接受程度。
    const budget = 65 + (conditions.temperature - 60) * 3 + recipe[0] * 10 + Math.floor(random() * 100);
    if (price > budget) { rejected++; events.push("The price was too high."); }
    else if (inventory.some((n, j) => n < usage[j])) { missed++; events.push("Not enough supplies."); }
    else { usage.forEach((n, j) => inventory[j] -= n); sold++; events.push("Bought a cup!"); }
  }
  const revenue = sold * price;
  return { state: { ...state, cash: state.cash - cost + revenue, inventory }, summary: { sold, rejected, missed, cost, revenue, profit: revenue - cost, events } };
}
