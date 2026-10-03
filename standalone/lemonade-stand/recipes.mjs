// One recipe per spread. The first spread preserves the player's current draft.
export function recipePages(current) {
 return [
  {name:'Your recipe',quantities:[...current]},
  {name:'Sour lemonade',quantities:[2,1,2]},
  {name:'Sweet lemonade',quantities:[1,2,2]},
  {name:'Ice-cold lemonade',quantities:[2,2,3]},
 ];
}
export function tasteLabels(quantities) {
 return {
  balance:quantities[1]-quantities[0],
  flavor:['Very sour','Sour','Balanced','Sweet','Very sweet'][quantities[1]-quantities[0]+2],
  ice:['Light ice','Regular ice','Ice cold'][quantities[2]-1],
 };
}
