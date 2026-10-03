// Weather selects preference probabilities; targets remain fixed. All monetary values remain integer cents.
export const preferences = [
 { id: 'sour', balance: -1, ice: 2 },
 { id: 'sweet', balance: 1, ice: 2 },
 { id: 'cool', balance: 0, ice: 3 },
];
export function evaluateTaste(recipe, preference, price) {
 const balance = recipe[1] - recipe[0];
 const balanceDifference = balance - preference.balance;
 const iceDifference = recipe[2] - preference.ice;
 const difference = Math.abs(balanceDifference) + Math.abs(iceDifference);
 const rating = difference === 0 ? 'delighted' : difference === 1 ? 'okay' : 'unhappy';
 const tip = Math.round(price * (rating === 'delighted' ? 20 : rating === 'okay' ? 10 : 0) / 100);
 let feedback = rating === 'delighted' ? 'Just right!' : 'Okay';
 if (rating === 'unhappy') {
  // On ties, use the aspect this customer cares about most.
  const iceFirst = Math.abs(iceDifference) > Math.abs(balanceDifference)
   || (Math.abs(iceDifference) === Math.abs(balanceDifference) && preference.id === 'cool');
  feedback = iceFirst ? (iceDifference < 0 ? 'Not cold enough' : 'Too icy')
   : (balanceDifference < 0 ? 'Too sour' : 'Too sweet');
 }
 return { difference, rating, feedback, tip };
}
