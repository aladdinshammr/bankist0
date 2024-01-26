"use strict";

// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2024-01-20T17:01:17.194Z",
    "2024-01-24T23:36:17.929Z",
    "2024-01-25T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// TODO: selecting elements

// 1- input fields

const inputLoginUser = document.querySelector(".userName");
const inputLoginPIN = document.querySelector(".pin");
const inputTransferTo = document.getElementById("transfer-to");
const inputTransferAmount = document.getElementById("transfer-amount");
const inputLoanAmount = document.getElementById("loan-amount");
const inputConfirmUser = document.getElementById("confirm-user");
const inputConfirmPIN = document.getElementById("confirm-pin");

// 2- btns
const btnLogin = document.querySelector(".login-btn");
const btnTransfer = document.querySelector(".btn--transfer");
const btnLoan = document.querySelector(".btn--loan");
const btnDelete = document.querySelector(".btn--delete");
const btnSort = document.querySelector(".btn--sort");

// 3- labels
const labelWelcome = document.querySelector(".welcome-msg");
const labelDate = document.querySelector(".update-date span");
const labelCurrentBalance = document.querySelector(".current-balance-value");
const labelSummaryIn = document.querySelector(".summary--in");
const labelSummaryOut = document.querySelector(".summary--out");
const labelSummaryInterest = document.querySelector(".summary--interest");
const labelTimerValue = document.querySelector(".timer-value");

// 4- others
const containerApp = document.querySelector(".app");
const containerMoves = document.querySelector(".movement-box");

// NOTE: global variables:
let currentAccount, timer;
let sort = false;

// TODO: functions

const formatDate = function (
  date = new Date(),
  {
    year = "numeric",
    month = "numeric",
    day = "numeric",
    hour = undefined,
    minute = undefined,
  } = {}
) {
  return new Intl.DateTimeFormat(currentAccount.locale, {
    year,
    month,
    day,
    hour,
    minute,
  }).format(date);
};

const calcPassedDays = function (date) {
  const passedDays = Math.round(
    Math.abs(new Date() - date) / (24 * 60 * 60 * 1000)
  );
  if (passedDays < 1) return "Today";
  else if (passedDays < 2) return "Yesterday";
  else if (passedDays <= 7) return `${passedDays} days ago`;
  return formatDate(date);
};

const formatCurrency = function (
  value,
  { locale = "en-US", currency = "USD" }
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value
  );
};

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, value) => acc + value, 0);
  labelCurrentBalance.textContent = formatCurrency(account.balance, {
    locale: account.locale,
    currency: account.currency,
  });
};

const calcDisplayMoves = function (account, sort = false) {
  const moves = account.movements.slice();
  sort && moves.sort((a, b) => a - b);
  containerMoves.innerHTML = "";
  moves.forEach((value, index) => {
    const moveType = value > 0 ? "deposit" : "withdrawl";
    const html = `
    <div class="movement-row">
        <div class="movement-label movement-label--${moveType}"><span class="num">${
      index + 1
    }</span>
          <p class="movement-type">${moveType}</p>
        </div>
        <p class="movement-date">${calcPassedDays(
          new Date(account.movementsDates[index])
        )}</p>
        <p class="movement-amount">${formatCurrency(value, {
          locale: account.locale,
          currency: account.currency,
        })}</p>

      </div>
    `;
    containerMoves.insertAdjacentHTML("afterbegin", html);
    clearInterval(timer);
    timer = setTimer();
  });
};

const calcDisplaySum = function (account) {
  labelSummaryIn.textContent = formatCurrency(
    account.movements
      .filter((move) => move > 0)
      .reduce((acc, deposit) => acc + deposit, 0),
    { locale: account.locale, currency: account.currency }
  );

  labelSummaryOut.textContent = formatCurrency(
    Math.abs(
      account.movements
        .filter((move) => move < 0)
        .reduce((acc, withdrawl) => acc + withdrawl, 0)
    ),
    { locale: account.locale, currency: account.currency }
  );

  labelSummaryInterest.textContent = formatCurrency(
    account.movements
      .filter((move) => move > 0)
      .map((deposit) => (deposit * account.interestRate) / 100)
      .reduce((acc, interest) => (interest > 1 ? interest + acc : acc), 0),
    { locale: account.locale, currency: account.currency }
  );
};

const logOut = function () {
  containerApp.style.opacity = 0;
  labelWelcome.textContent = "Log in to get started";
  timer && clearInterval(timer);
};

const setTimer = function () {
  let timeOut = 60;
  const timer = setInterval(timerCallBack, 1000);

  function timerCallBack() {
    const minutes = String(Math.trunc(timeOut / 60)).padStart(2, 0);
    const seconds = String(timeOut % 60).padStart(2, 0);
    labelTimerValue.textContent = `${minutes}:${seconds}`;
    if (timeOut <= 0) {
      logOut();
    } else {
      timeOut--;
    }
  }
  timerCallBack();
  return timer;
};

const updateUI = function (account) {
  calcDisplayBalance(account);
  calcDisplayMoves(account);
  calcDisplaySum(account);
};

accounts.forEach(
  (account) =>
    (account.userName = account.owner
      .toLowerCase()
      .split(" ")
      .map((word) => word[0])
      .join(""))
);

// Fake log in
// currentAccount = account1;
// containerApp.style.opacity = 100;
// updateUI(currentAccount);

// TODO: Handlers
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    (account) => account.userName === inputLoginUser.value
  );
  if (currentAccount?.pin == inputLoginPIN.value) {
    containerApp.style.opacity = 100;
    inputLoginUser.value = inputLoginPIN.value = "";
    inputLoginPIN.blur();

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

    labelDate.textContent = formatDate(new Date(), {
      hour: "numeric",
      minute: "numeric",
    });
    if (timer) {
      clearTimeout(timer);
    }
    updateUI(currentAccount);
  }
});

btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  sort = !sort;
  calcDisplayMoves(currentAccount, sort);
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  // const receiver = inputTransferTo.value;
  const amount = +inputTransferAmount.value;

  const receiver = accounts.find(
    (account) => account.userName == inputTransferTo.value
  );

  if (
    amount > 0 &&
    currentAccount.balance > amount &&
    receiver &&
    receiver.userName !== currentAccount.userName
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiver.movements.push(amount);
    receiver.movementsDates.push(new Date().toISOString());

    inputTransferTo.value = "";
    inputTransferAmount.value = "";

    // Stimulate a delay
    setTimeout(() => {
      updateUI(currentAccount);
    }, 1000);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputLoanAmount.value;

  if (currentAccount.movements.some((v) => v > amount * 0.1) && amount > 0) {
    inputLoanAmount.value = "";
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    setTimeout(() => {
      updateUI(currentAccount);
    }, 1000);
  }
});

btnDelete.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputConfirmUser.value == currentAccount.userName &&
    inputConfirmPIN.value == currentAccount.pin
  ) {
    const accountIndex = accounts.findIndex(
      (account) =>
        (account.userName =
          inputConfirmUser.value && account.pin == inputConfirmPIN.value)
    );
    inputConfirmUser.value = inputConfirmPIN.value = "";
    accounts.splice(accountIndex, 1);
    logOut();
  }
});
