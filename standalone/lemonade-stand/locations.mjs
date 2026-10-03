export const locations=[
 {id:'market',name:'Market',kind:'shop',required:0,x:16,y:30},
 {id:'lemon-lane',name:'Lemon Lane',kind:'stand',required:0,x:39,y:70},
 {id:'park',name:'Willow Park',kind:'stand',required:20,x:53,y:25},
 {id:'commercial',name:'Commercial Street',kind:'stand',required:50,budgetMultiplier:1.35,patienceMultiplier:.7,x:78,y:42},
 {id:'night-market',name:'Night Market',kind:'stand',required:100,stallFee:5000,trafficMultiplier:2,x:78,y:78},
];
export const unlocked=(location,totalSold)=>totalSold>=location.required;
export function getLocation(id){const location=locations.find(l=>l.id===id);if(!location)throw Error('Unknown destination.');return location}

// Location modifiers layer on top of the same daily weather.
export const locationBudget=(id,budget)=>Math.round(budget*(getLocation(id).budgetMultiplier??1));
export const locationArrivalInterval=(id,interval)=>interval/(getLocation(id).trafficMultiplier??1);
