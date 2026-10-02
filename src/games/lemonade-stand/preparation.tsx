"use client";
import { useState } from "react";
// 金额使用整数美分，避免预算计算出现浮点误差；价格暂用网页预览值。
const supplies = [{ name: "Cups", icon: "🥤", cost: 10 }, { name: "Lemons", icon: "🍋", cost: 20 }, { name: "Sugar", icon: "🍬", cost: 10 }, { name: "Ice", icon: "🧊", cost: 5 }];
const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;
export function LemonadePreparation() {
 const [quantities, setQuantities] = useState([0, 0, 0, 0]);
 const [price, setPrice] = useState("1.50");
 // 当前仅计算采购计划，不扣款或模拟营业；后续在独立引擎中接入 lab 规则。
 const total = quantities.reduce((sum, quantity, index) => sum + quantity * supplies[index].cost, 0);
 // 默认每杯消耗各一份原料，因此最少的原料决定可制作杯数。
 const cups = Math.min(...quantities);
 return <><div className="stats-row"><div><span>DAY</span><strong>01</strong></div><div><span>STARTING CASH</span><strong>$20.00</strong></div><div><span>DEFAULT RECIPE</span><strong>1 of each / cup</strong></div></div><div className="preparation-grid"><section className="panel"><h2>Supplies</h2><div className="supply-list">{supplies.map((supply, index) => <label key={supply.name} className="supply"><span className="supply-icon">{supply.icon}</span><span>{supply.name} — {dollars(supply.cost)} each</span><input aria-label={`${supply.name} quantity`} type="number" min="0" max="1000" step="1" value={quantities[index]} onChange={event => { const value = Math.min(1000, Math.max(0, Math.trunc(Number(event.target.value) || 0))); setQuantities(previous => previous.map((quantity, i) => i === index ? value : quantity)); }} /></label>)}</div><div className="total-line"><span>Planned supply cost</span><strong>{dollars(total)}</strong></div>{total > 2000 && <p className="error" role="alert">Over budget</p>}</section><section className="panel stand-panel"><h2>Stand</h2><div className="stand-picture" aria-hidden="true">🍋<span>LEMONADE</span></div><label className="price-label">Price per cup <input type="number" min="0.01" max="100" step="0.05" value={price} onChange={event => setPrice(event.target.value)} /></label><div className="total-line"><span>Potential cups</span><strong>{cups}</strong></div><div className="total-line"><span>Cash after planned purchase</span><strong>{dollars(2000 - total)}</strong></div><div className="preview-status">Preview</div></section></div></>;
}
