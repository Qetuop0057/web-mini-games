export type Game = {
  slug: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  status: "development" | "coming-soon";
};

// 首页、游戏列表和独立游戏路由共用这份注册表；新增游戏从这里开始。
export const games: Game[] = [
  { slug: "lemonade-stand", title: "Lemonade Stand", category: "BUSINESS SIM", description: "A little stand. A big idea. Buy supplies, mix your recipe, and build your lemonade business.", icon: "🍋", color: "lemon", status: "development" },
  { slug: "snake", title: "Snake", category: "ARCADE", description: "One more bite. One more turn. A classic arcade challenge is on its way.", icon: "🐍", color: "mint", status: "coming-soon" },
  { slug: "memory-match", title: "Memory Match", category: "PUZZLE", description: "Flip, remember, repeat. Find the pairs in a colorful little brain break.", icon: "🃏", color: "pink", status: "coming-soon" },
];
export function getGame(slug: string) { return games.find((game) => game.slug === slug); }
