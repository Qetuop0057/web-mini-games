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
  { slug: "lemonade-stand", title: "Lemonade Stand", category: "BUSINESS SIM", description: "A little stand. A big idea. Buy supplies, mix your recipe, and build your lemonade business.", icon: "🍋", color: "lemon", status: "ready", about: "Start with $15 and free supplies, then mix each lemonade to order. Add strawberries for Pink lemonade or watermelon for Watermelon lemonade. Check the forecast on your home TV, shop at the market, and unlock the park, commercial street and night market as your business grows.", instructions: ["Check the weather and choose supplies within your budget.", "Set your price, then mix drinks to match each customer’s order.", "Review sales and leftover inventory, and start the next day."], playUrl: "https://lemonade-stand.mini-arcade-hub.workers.dev", previews: [{"src": "/previews/lemonade-home-v2.png", "alt": "Player home with recipe book and map sign", "caption": ""}, {"src": "/previews/lemonade-orders-v2.png", "alt": "Customers ordering strawberry and watermelon lemonade", "caption": ""}, {"src": "/previews/lemonade-market-v2.png", "alt": "Fruit stall, dry goods stall and vending machine", "caption": ""}, {"src": "/previews/lemonade-night-v2.png", "alt": "Lemonade stand under the night market lanterns", "caption": ""}] },
  { slug: "snake", title: "Snake", category: "ARCADE", description: "One more bite. One more turn. A classic arcade challenge is on its way.", icon: "🐍", color: "mint", status: "coming-soon", about: "A classic snake game is coming to the arcade. Guide your snake, collect food, and see how long you can survive.", instructions: ["Gameplay and controls will be available when the game launches."], previews: [] },
  { slug: "memory-match", title: "Memory Match", category: "PUZZLE", description: "Flip, remember, repeat. Find the pairs in a colorful little brain break.", icon: "🃏", color: "pink", status: "coming-soon", about: "A memory puzzle is coming to the arcade. Reveal cards, remember their positions, and find matching pairs.", instructions: ["Gameplay and controls will be available when the game launches."], previews: [] },
];
export function getGame(slug: string) { return games.find((game) => game.slug === slug); }
