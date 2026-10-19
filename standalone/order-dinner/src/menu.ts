import type { Dish, OptionGroup } from "./types";

// 预设菜单。增删菜品只改这里，然后重新部署。
// ingredients 的用量按一份计算；staple 是家里常备的调料，不进买菜清单。
const spice: OptionGroup = {
  id: "spice", name: "辣度", defaultChoice: "mild",
  choices: [{ id: "none", label: "不辣" }, { id: "mild", label: "微辣" }, { id: "hot", label: "中辣" }, { id: "extra", label: "特辣" }],
};

export const categories = ["家常菜", "肉菜", "素菜", "主食"];

export const dishes: Dish[] = [
  {
    id: "tomato-egg", name: "番茄炒蛋", category: "家常菜",
    ingredients: [
      { name: "番茄", amount: 2, unit: "个" },
      { name: "鸡蛋", amount: 3, unit: "个" },
      { name: "葱", removable: true },
      { name: "糖", staple: true, removable: true },
      { name: "盐", staple: true },
    ],
    options: [
      { id: "style", name: "做法", defaultChoice: "saucy", choices: [{ id: "saucy", label: "多汁拌饭" }, { id: "dry", label: "收干一点" }] },
      { id: "sweet", name: "甜度", defaultChoice: "normal", choices: [{ id: "less", label: "少糖" }, { id: "normal", label: "正常" }, { id: "more", label: "多糖" }] },
    ],
  },
  {
    id: "kung-pao", name: "宫保鸡丁", category: "肉菜",
    ingredients: [
      { name: "鸡腿肉", amount: 300, unit: "克" },
      { name: "花生米", amount: 50, unit: "克", removable: true },
      { name: "黄瓜", amount: 1, unit: "根", removable: true },
      { name: "干辣椒", removable: true },
      { name: "葱", removable: true },
      { name: "酱油", staple: true },
    ],
    options: [spice],
  },
  {
    id: "braised-pork", name: "红烧肉", category: "肉菜",
    ingredients: [
      { name: "五花肉", amount: 500, unit: "克" },
      { name: "冰糖", staple: true },
      { name: "姜", removable: true },
      { name: "八角", removable: true },
      { name: "酱油", staple: true },
    ],
    options: [
      { id: "texture", name: "口感", defaultChoice: "soft", choices: [{ id: "soft", label: "软烂" }, { id: "firm", label: "有嚼劲" }] },
      {
        id: "extra", name: "加料", multiple: true,
        choices: [
          { id: "egg", label: "卤蛋", adds: [{ name: "鸡蛋", amount: 2, unit: "个" }] },
          { id: "potato", label: "土豆", adds: [{ name: "土豆", amount: 1, unit: "个" }] },
        ],
      },
    ],
  },
  {
    id: "potato-shreds", name: "酸辣土豆丝", category: "素菜",
    ingredients: [
      { name: "土豆", amount: 2, unit: "个" },
      { name: "青椒", amount: 1, unit: "个", removable: true },
      { name: "干辣椒", removable: true },
      { name: "醋", staple: true },
    ],
    options: [spice, { id: "sour", name: "酸度", defaultChoice: "normal", choices: [{ id: "less", label: "少醋" }, { id: "normal", label: "正常" }, { id: "more", label: "多醋" }] }],
  },
  {
    id: "mapo-tofu", name: "麻婆豆腐", category: "素菜",
    ingredients: [
      { name: "嫩豆腐", amount: 1, unit: "盒" },
      { name: "牛肉末", amount: 100, unit: "克", removable: true },
      { name: "豆瓣酱", staple: true },
      { name: "花椒", removable: true },
      { name: "葱", removable: true },
    ],
    options: [spice],
  },
  {
    id: "fried-rice", name: "蛋炒饭", category: "主食",
    ingredients: [
      { name: "米饭", amount: 1, unit: "碗" },
      { name: "鸡蛋", amount: 2, unit: "个" },
      { name: "葱", removable: true },
    ],
    options: [
      {
        id: "extra", name: "加料", multiple: true,
        choices: [
          { id: "ham", label: "火腿", adds: [{ name: "火腿", amount: 1, unit: "根" }] },
          { id: "shrimp", label: "虾仁", adds: [{ name: "虾仁", amount: 100, unit: "克" }] },
          { id: "corn", label: "玉米粒", adds: [{ name: "玉米粒", amount: 50, unit: "克" }] },
        ],
      },
    ],
  },
];

export const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));
