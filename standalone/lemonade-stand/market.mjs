// Product storage stays separate from the four existing live-lemonade supplies.
export const products=[
 {id:'lemons',name:'Lemons',stall:'fruit',inventoryIndex:1},
 {id:'watermelon',name:'Watermelon',stall:'fruit',price:80},
 {id:'strawberry',name:'Strawberries',stall:'fruit',price:50},
 {id:'orange',name:'Oranges',stall:'fruit',price:40},
 {id:'sugar',name:'Sugar',stall:'dry',inventoryIndex:2},
 {id:'milk',name:'Milk',stall:'dry',price:60},
 {id:'ice',name:'Ice',stall:'dry',inventoryIndex:3},
 {id:'cups',name:'Paper cups',stall:'dry',inventoryIndex:0},
];
export const marketStalls=[
 {id:'fruit',name:'Fruit stall',bounds:[30,30,122,230]},
 {id:'dry',name:'Dry goods',bounds:[186,30,122,230]},
 // A selectable entrance only; product/transaction support can be added here later.
 {id:'vending',name:'Vending machine',bounds:[354,78,84,182],comingSoon:true},
];
export function getStall(id){const stall=marketStalls.find(stall=>stall.id===id);if(!stall)throw Error('Unknown market stall.');return stall}
export const stallProducts=id=>products.filter(product=>product.stall===id);
export const productPrice=(product,conditions)=>product.inventoryIndex===undefined?product.price:conditions.prices[product.inventoryIndex];
export const owned=(state,product)=>product.inventoryIndex===undefined?state.pantry[product.id]:state.inventory[product.inventoryIndex];
export function marketQuote(stallId,order,conditions){
 const stall=getStall(stallId);if(stall.comingSoon)throw Error('The vending machine is not open yet.');
 if(!order||typeof order!=='object'||Array.isArray(order))throw Error('Choose supply quantities.');
 const allowed=stallProducts(stallId);
 if(Object.keys(order).some(id=>!allowed.some(product=>product.id===id)))throw Error('This product is not sold at this stall.');
 return allowed.reduce((total,product)=>{const count=order[product.id]??0;if(!Number.isInteger(count)||count<0||count>1000)throw Error('Choose whole quantities from 0 to 1000.');return total+count*productPrice(product,conditions)},0);
}
