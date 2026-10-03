// This is in-game weather, generated once per day. Forecasts never use real-world data.
export const weatherTypes = [
 { id:'sunny', label:'Sunny', icon:'☀', min:70, max:86, traffic:1, budget:0, description:'Steady foot traffic' },
 { id:'cloudy', label:'Cloudy', icon:'☁', min:60, max:78, traffic:.85, budget:-10, description:'Fewer people outside' },
 { id:'rainy', label:'Rainy', icon:'☂', min:60, max:74, traffic:.55, budget:-25, description:'Quiet streets, lower demand' },
 { id:'heatwave', label:'Heatwave', icon:'☀', min:85, max:90, traffic:1.25, budget:15, description:'Busy streets, more thirsty customers' },
];
export function generateWeather(random=Math.random) {
 const roll=random();const type=weatherTypes[roll<.4?0:roll<.7?1:roll<.9?2:3];
 const temperature=type.min+Math.floor(random()*(type.max-type.min+1));
 return {...type,temperature,prices:[10,20,10,5].map(base=>base+Math.floor(random()*3)*5)};
}
export function arrivalInterval(conditions,random=Math.random) {
 const base=2.8+random()*2.5-(conditions.temperature-60)*.035;
 return Math.max(1,base/conditions.traffic);
}
export function customerBudget(conditions,lemons,random=Math.random) {
 return 85+(conditions.temperature-60)*3+lemons*10+Math.floor(random()*100)+conditions.budget;
}
export function coolPreferenceChance(conditions) {
 if(conditions.id==='rainy')return .2;
 return conditions.temperature>=85?.5:1/3;
}
