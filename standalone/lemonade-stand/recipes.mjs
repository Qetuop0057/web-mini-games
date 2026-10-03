// Reference recipes only: every actual drink is mixed at the counter.
export function recipePages() {
 return [
  {name:'Balanced lemonade',quantities:[1,1,2]},
  {name:'Sour lemonade',quantities:[2,1,2]},
  {name:'Sweet lemonade',quantities:[1,2,2]},
  {name:'Ice-cold lemonade',quantities:[2,2,3]},
  {name:'Pink lemonade',quantities:[1,1,2],fruit:'strawberry'},
  {name:'Watermelon lemonade',quantities:[1,1,2],fruit:'watermelon'},
 ];
}
export function tasteLabels(quantities) {
 return {
  balance:quantities[1]-quantities[0],
  flavor:['Very sour','Sour','Balanced','Sweet','Very sweet'][quantities[1]-quantities[0]+2],
  ice:['Light ice','Regular ice','Ice cold'][quantities[2]-1],
 };
}
