// Fruit orders are independent of sour/sweet/cold taste preferences.
export const drinks={lemonade:{name:'Lemonade',fruit:null},pink:{name:'Pink lemonade',fruit:'strawberry'},watermelon:{name:'Watermelon lemonade',fruit:'watermelon'}};
export const fruitIngredients=['strawberry','watermelon'];
export function chooseDrink(random){const roll=random();return roll<.6?'lemonade':roll<.8?'pink':'watermelon'}
export function matchesDrink(drink,order='lemonade'){
 const expected=drinks[order];if(!expected)return false;
 return fruitIngredients.every(id=>(drink.fruit?.[id]??0)===(expected.fruit===id?1:0));
}
