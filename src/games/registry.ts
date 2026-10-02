export type Game = {
  slug: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  status: "ready" | "coming-soon";
  about: string;
  instructions: string[];
  playUrl?: string;
  previews: { src: string; alt: string; caption: string }[];
};

// 首页、游戏列表和独立游戏路由共用这份注册表；新增游戏从这里开始。
export const games: Game[] = [
  { slug: "lemonade-stand", title: "Lemonade Stand", category: "BUSINESS SIM", description: "A little stand. A big idea. Buy supplies, mix your recipe, and build your lemonade business.", icon: "🍋", color: "lemon", status: "ready", about: "Start with $20 and run your own lemonade stand. Buy cups, lemons, sugar, and ice, then choose a recipe and price. Weather changes daily, customers decide whether the price is right, and each sale uses your supplies. Keep an eye on costs and cash as you grow your business.", instructions: ["Check the weather and choose supplies within your budget.", "Set your recipe and price, then open the stand.", "Review sales and leftover inventory, and start the next day."], playUrl: "https://qetuop-lemonade-stand.yuanz1.chatgpt.site", previews: [{src: "/previews/lemonade-planning.png", alt: "Lemonade Stand supply planner and recipe controls", caption: "Plan your supplies, recipe, and price."}, {src: "/previews/lemonade-summary.png", alt: "Lemonade Stand end-of-day sales and cash summary", caption: "Review your sales and daily cash change."}] },
  { slug: "snake", title: "Snake", category: "ARCADE", description: "One more bite. One more turn. A classic arcade challenge is on its way.", icon: "🐍", color: "mint", status: "coming-soon", about: "A classic snake game is coming to the arcade. Guide your snake, collect food, and see how long you can survive.", instructions: ["Gameplay and controls will be available when the game launches."], previews: [] },
  { slug: "memory-match", title: "Memory Match", category: "PUZZLE", description: "Flip, remember, repeat. Find the pairs in a colorful little brain break.", icon: "🃏", color: "pink", status: "coming-soon", about: "A memory puzzle is coming to the arcade. Reveal cards, remember their positions, and find matching pairs.", instructions: ["Gameplay and controls will be available when the game launches."], previews: [] },
];
export function getGame(slug: string) { return games.find((game) => game.slug === slug); }
