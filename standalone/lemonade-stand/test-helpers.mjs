export function openStand(game,stock=[10,10,10,10],price=100){game.buySupplies(stock);game.open(price)}
export function fillCup(game,recipe=[1,1,1]){if(!game.activeCustomer()||!game.drink||game.making)return;recipe.forEach((n,i)=>{while(game.drink.ingredients[i]<n&&game.addIngredient(i)){} })}
export function tick(game,seconds,serve=false){for(let i=0;i<seconds*20;i++){if(serve){fillCup(game);game.serve()}game.tick(.05)}}
