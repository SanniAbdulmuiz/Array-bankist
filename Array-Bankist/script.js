const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map((name) => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
let arr = ['a', 'b', 'c', 'd', 'e'];

// //SLICE
// console.log(arr.slice(2));
// console.log(arr.slice(2, 4));
// console.log(arr); // it doesn't mutates the "arr" array but creates a new array
// console.log(arr.slice(-2));
// console.log(arr.slice(-1));
// console.log(arr.slice(1, -2));
//console.log(arr.slice());
// console.log([...arr]);

// //SPLICE
// //console.log(arr.splice(2)); // it mutates the "arr" array, like it edits the arr array
// arr.splice(-1);
// console.log(arr);
// arr.splice(1, 2);
//arr.splice();
//console.log(arr);

// //REVERSE
// arr = ['a', 'b', 'c', 'd', 'e'];
//const arr2 = ['j', 'i', 'h', 'g', 'f'];
//console.log(arr2.reverse());
//console.log(arr2); //it mutates!!

// //CONCAT
// const letters = arr.concat(arr2);
// console.log(letters);
//console.log([...arr, ...arr2]);

// //JOIN
// console.log(letters.join('-'));

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// // for (const movement of movements){
// for (const [i, movement] of movements.entries()) {
//   if (movement < 0) {
//     console.log(`Movement ${i + 1}: you deposited ${movement}`);
//   } else {
//     console.log(`Movement ${i + 1}: you withdrew ${Math.abs(movement)}`);
//   }
// }

// //The "continue and brake" statement do not work for the forEach loop!!!

// console.log('------FOR EACH------');
// //The names does not matter, what matters is the order
// //The first parameter (mov) = Current element
// //The Second parameter (i) = Current index
// //The last parameter (arr) = The entire array that we're looping over
// movements.forEach(function (mov, i, arr) {
//   if (mov < 0) {
//     console.log(`Movement ${i + 1}: you deposited ${mov}`);
//   } else {
//     console.log(`Movement ${i + 1}: you withdrew ${Math.abs(mov)}`);
//   }
// });

//MAPS
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach(function (value, key, map) {
//   console.log(`${key}: ${value}`);
// });

// //SETS
// //For sets, the "key" is not necessary, the value still serves as the key!
// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// console.log(currenciesUnique);
// currenciesUnique.forEach(function (value, _, map) {
//   console.log(`${value}: ${value}`);
// });

///////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into 
an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is 
an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following 
things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a 
shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate 
function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or 
a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
// const checkDogs = function (dogsJulia, dogsKate) {
//   const newJulia = [...dogsJulia];
//   newJulia.splice(0, 1);
//   newJulia.splice(-2);
//   //newJulia.splice(1, 3);

//   const newArray = [...newJulia, ...dogsKate];
//   newArray.forEach(function (mov, i) {
//     if (mov >= 3) {
//       console.log(`Dog number ${i + 1} is an adult, and is ${mov} years old`);
//     } else {
//       console.log(`Dog number ${i + 1} is still a puppy 🐶`);
//     }
//   });
// };
// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);

//The Map method
//The "map" method does not mutates the movement array unlike the "forEach" method of looping, it simply creates a new array.
//const euroToUsd = 1.1;
// const movementsUsd = movements.map(function (mov) {
//   return mov * euroToUsd;
// });

// const movementsUsdArr = movements.map((mov) => mov * euroToUsd);
// console.log(movements);
// console.log(movementsUsdArr);

// const movementsUsdFor = [];
// for (const mov of movements) {
//   movementsUsdFor.push(mov * euroToUsd);
// }

// console.log(movementsUsdFor);

// const movementsDescription = movements.map(
//   (mov, i) =>
//     `Movement ${i + 1}: you ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
//       mov
//     )}`
// );
// console.log(movementsDescription);

//The filter method. Used to filter out unwanted values
// const deposits = movements.filter(function (mov) {
//   return mov > 0; //Filters out numbers less than 0
// });
// console.log(deposits);

// const depositFor = [];
// for (const mov of movements) if (mov > 0) depositFor.push(mov);
// console.log(depositFor);

// const withdrawal = movements.filter(
//   (mov) => mov < 0 //Filters out numbers greater than 0
// );
// console.log(withdrawal);

//The reduce method
//console.log(movements);
//Accumulator is just like a snowball
// const balance = movements.reduce(function (acc, cur, i, arr) {
//   console.log(` Iteration ${i}: ${acc}`);
//   return acc + cur;
// }, 0);

// const balance = movements.reduce((acc, cur) => acc + cur, 0);
// console.log(balance);

// let balance2 = 0;
// for (const mov of movements) {
//   balance2 += mov;
// }
// console.log(balance2);

// //Maximum value
// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) return acc;
//   else return mov;
// }, 200);
// console.log(max);

///////////////////////////////////////
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate 
the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in 
order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. 
If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

// const calcAverageHumanAge = function (ages) {
//   const humanAge = ages.map(function (mov) {
//     if (mov <= 2) return 2 * mov;
//     else return 16 + mov * 4;
//   });
//   const filtered = humanAge.filter((mov) => mov > 18);
//   console.log(humanAge);
//   console.log(filtered);
//   const reduced = filtered.reduce(
//     (acc, mov, i, arr) => acc + mov / arr.length,
//     0
//   );
//   return reduced;
// };
// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

// console.log(avg1, avg2);

// const calcAverageHumanAges = (ages) =>
//   ages
//     .map((mov) => `${mov <= 2 ? 2 * mov : 16 + mov * 4}`)
//     .filter((mov) => mov > 18)
//     .reduce((acc, mov, i, arr) => acc + mov / arr.length, 0);
// const avg3 = calcAverageHumanAges([5, 2, 4, 1, 15, 8, 3]);
// const avg4 = calcAverageHumanAges([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg3, avg4);

// const euroToUsd = 1.1;
// console.log(movements);

// const totalDepositsusd = movements
//   .filter((mov) => mov > 0)
//   .map((mov, i, arr) => {
//     //console.log(arr);
//     return mov * euroToUsd;
//   })
//   //.map((mov) => mov * euroToUsd)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(totalDepositsusd);

//THE FIND METHOD
const firstWithdrawal = movements.find((mov) => mov < 0);
//console.log(movements);
//console.log(firstWithdrawal);
//The major difference between the "find" method and the "filter" method is
//1. the filter returns all the elements that match the condition, while the "find" method returns just the first one
//2. the filter returns a new array, while find returns the element alone and not an array
//Works like true/false statement
//console.log(accounts);
const account = accounts.find((acc) => acc.owner === 'Jessica Davis');
//console.log(account);

//Use the for and for each method!!
// for (const each of accounts) {
//   if (each.owner === 'Jessica Davis') console.log(each);
// }
// const method = accounts.forEach(
//   (mov) => `${mov.owner === 'Jessica Davis' ? console.log(mov) : ''}`
// );
// console.log(method);

//The some method
//console.log(movements);
// //Equality
// console.log(movements.includes(-130));

// //Condition
console.log(movements.some((mov) => mov === -130));

const anyDeposits = movements.some((mov) => mov > 1500);
console.log(anyDeposits);

// //The every method: logs every element if the condition is true?
console.log(movements.every((mov) => mov > 0));
console.log(account4.movements.every((mov) => mov > 0));

//Seperate callbacks
// const deposit = (mov) => mov > 0;
// console.log(movements.some(deposit));
// console.log(movements.every(deposit));
// console.log(movements.filter(deposit));

//The flat and flat map method
const arr3 = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr3.flat());

// const arrDeep = [
//   [
//     [1, 2, 3],
//     [4, 5, 6],
//   ],
//   7,
//   8,
// ];
// console.log(arrDeep.flat(2));

// //Flat
const overBalance = accounts
  .map((acc) => acc.movements)
  .flat() //Makes everything be in one array
  .reduce((acc, mov) => acc + mov, 0);
console.log(overBalance);

// //Flatmap
// const overBalance2 = accounts
//   .flatMap((acc) => acc.movements)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overBalance2);

// //Strings arrangement
// const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort()); //Arranges in ascending order
// console.log(owners);

// //Numbers
// console.log(movements);
//return < 0, if A, B (keep order)
//return > 0, if B, A (Switch order)

//Ascending
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });

// movements.sort((a, b) => a - b);
// console.log(movements);

//Descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });

// movements.sort((a, b) => b - a);
// console.log(movements);

// const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// console.log(new Array(1, 2, 3, 4, 5, 6, 7, 8, 9));

//Empty arrays + fill method
// const x = new Array(7);
// console.log(x);
//console.log(x.map(() => 5));
// x.fill(1, 3, 5); // logs "1" from position 3 to 5
// x.fill(1);
// console.log(x);

// arr.fill(23, 2, 6);
// console.log(arr);

//Array From
// const y = Array.from({ length: 7 }, () => 1);
// console.log(y);

// const z = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(z);

/////////////////////////////
//Array method practice
//1.
// const bankDepositSum = accounts
//   .flatMap((acc) => acc.movements)
//   .filter((mov) => mov > 0)
//   .reduce((sum, cur) => sum + cur, 0);
// console.log(bankDepositSum);

//2.
// const numDeposits1000 = accounts
//   .flatMap((acc) => acc.movements)
//   .filter((mov) => mov >= 1000).length;

// const numDeposits1000 = accounts
//   .flatMap((acc) => acc.movements)
//   .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
// console.log(numDeposits1000);

//The prefixed ++ operator
// let a = 10;
// console.log(++a);
// console.log(a);

//3
// const { deposits, withdrawal } = accounts
//   .flatMap((acc) => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       // cur > 0 ? (sums.deposits += cur) : (sums.withdrawal += cur)
//       sums[cur > 0 ? 'depodits' : 'withdrawal'];
//       return sums;
//     },
//     { deposits: 0, withdrawal: 0 }
//   );
// console.log(deposits, withdrawal);

//4
//this is a nice tittle = This Is a Nice Tittle

// const convertTittleCase = function (title) {
//   const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

//   const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'with', 'in'];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map((word) => (exceptions.includes(word) ? word : capitalize(word)))
//     .join(' ');
//   return capitalize(titleCase);
// };

// console.log(convertTittleCase('this is a nice title'));
// console.log(convertTittleCase('this is a LONG title, but not too long'));
// console.log(convertTittleCase('and here is another title, with an EXAMPLE'));

///////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is 
the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended
 portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to 
the object as a new property. Do NOT create a new array, simply loop over the array. 
Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple
 owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of 
dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too 
much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that 
  the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended
 portion means: current > (recommended * 0.90) && current < (recommended * 1.10). 
 Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀
*/

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

//1.
const dogsRecommended = dogs.forEach(
  (dog) => (dog.recommended = Math.trunc(dog.weight ** 0.75 * 28))
);
console.log(dogs);

//2.
const dogSarah = dogs.find((dog) => dog.owners.includes('Sarah'));
console.log(
  `Sarah's dog is eating too ${
    dogSarah.curFood > dogSarah.recommended ? 'much' : 'little'
  }`
);

//3.
const ownersEatTooMuch = dogs
  .filter((dog) => dog.curFood > dog.recommended)
  .flatMap((own) => own.owners);
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter((dog) => dog.curFood < dog.recommended)
  .flatMap((own) => own.owners);
console.log(ownersEatTooLittle);

//4
console.log(`
  ${ownersEatTooMuch.join(' and ')}'s dogs eats too much`);
console.log(`
  ${ownersEatTooLittle.join(' and ')}'s dogs eats too little`);

//5
console.log(dogs.some((dog) => dog.recommended === dog.curFood));

//6
const dogOkay = (dog) =>
  dog.curFood > dog.recommended * 0.9 && dog.curFood < dog.recommended * 1.1;
console.log(dogs.some(dogOkay));

//7
console.log(dogs.filter(dogOkay));
/*
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1.
dogs.forEach((dog) => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));

// 2.
const dogSarah = dogs.find((dog) => dog.owners.includes('Sarah'));
console.log(dogSarah);
console.log(
  `Sarah's dog is eating too ${
    dogSarah.curFood > dogSarah.recFood ? 'much' : 'little'
  } `
);

// 3.
const ownersEatTooMuch = dogs
  .filter((dog) => dog.curFood > dog.recFood)
  .flatMap((dog) => dog.owners);
// .flat();
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter((dog) => dog.curFood < dog.recFood)
  .flatMap((dog) => dog.owners);
console.log(ownersEatTooLittle);

// 4.
// "Matilda and Alice and Bob's dogs eat too much!"
//  "Sarah and John and Michael's dogs eat too little!"
console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`);

// 5.
console.log(dogs.some((dog) => dog.curFood === dog.recFood));

// 6.
// current > (recommended * 0.90) && current < (recommended * 1.10)
const checkEatingOkay = (dog) =>
  dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;

console.log(dogs.some(checkEatingOkay));

// 7.
console.log(dogs.filter(checkEatingOkay));

// 8.
// sort it by recommended food portion in an ascending order [1,2,3]
const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
console.log(dogsSorted);
*/
