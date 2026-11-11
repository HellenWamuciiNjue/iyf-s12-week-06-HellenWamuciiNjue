// ============================================
// LESSON 11 — CLASSWORK EXERCISE
// Callbacks  ->  Promises + chaining  ->  Async/await
// Week 6 · Run with:  node async-practice.js
//
// ONE scenario, THREE styles. You are GIVEN working callback code (Part A).
// Your job: rewrite the SAME flow with Promises (Part B), then async/await (Part C).
// Answer key: lesson-11-solution.js  (try first, peek last).
// ============================================


// ============================================
// PART A — GIVEN (runs as-is). Read it, run it, notice the nesting = "callback hell".
// Three async steps: get a user, then their orders, then the total spend.
// ============================================
const nameFor = (id) => ({ 1: "Amina", 2: "Brian" }[id] || "Unknown");

function getUserCb(userId, cb) {
  setTimeout(() => {
    if (!userId) return cb(new Error("Missing userId"));
    cb(null, { id: userId, name: nameFor(userId) });
  }, 400);
}

function getOrdersCb(user, cb) {
  setTimeout(() => {
    cb(null, [
      { id: 101, amount: 20 },
      { id: 102, amount: 35 },
    ]);
  }, 400);
}

function getOrderTotalCb(orders, cb) {
  setTimeout(() => {
    const total = orders.reduce((sum, o) => sum + o.amount, 0);
    cb(null, total);
  }, 400);
}

// Caller — callback version (this nesting is what we're about to fix)
getUserCb(1, (err, user) => {
  if (err) return console.error("A error:", err.message);
  getOrdersCb(user, (err, orders) => {
    if (err) return console.error("A error:", err.message);
    getOrderTotalCb(orders, (err, total) => {
      if (err) return console.error("A error:", err.message);
      console.log(`A: ${user.name} spent ${total}`);
    });
  });
});


// ============================================
// PART B — SOLUTIONS: convert each step to a Promise, then CHAIN them.
// ============================================

// TODO B1: rewrite each function to RETURN a Promise
function getUser(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) return reject(new Error("Missing userId"));
      resolve({ id: userId, name: nameFor(userId) });
    }, 400);
  });
}

function getOrders(user) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, amount: 20 },
        { id: 102, amount: 35 },
      ]);
    }, 400);
  });
}

function getOrderTotal(orders) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = orders.reduce((sum, o) => sum + o.amount, 0);
      resolve(total);
    }, 400);
  });
}

// TODO B2: chain the three with .then()
// We pass an object down the chain to keep 'user' in scope for the final message.
getUser(1)
  .then((user) => {
    return getOrders(user).then((orders) => {
      return { user, orders };
    });
  })
  .then((context) => {
    return getOrderTotal(context.orders).then((total) => {
      console.log(`B: ${context.user.name} spent ${total}`);
    });
  })
  .catch((err) => console.error("B error:", err.message));


// ============================================
// PART C — SOLUTIONS: refactor the SAME flow to async/await.
// ============================================

// TODO C1: write async function checkout(userId)
async function checkout(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user);
    const total = await getOrderTotal(orders);
    
    console.log(`C: ${user.name} spent ${total}`);
  } catch (err) {
    console.error("C error:", err.message);
  }
}

// TODO C2: call checkout(1)
checkout(1);


// ============================================
// BONUS — SOLUTION: run two INDEPENDENT lookups in parallel with Promise.all
// ============================================
Promise.all([getUser(1), getUser(2)])
  .then((users) => {
    console.log(`Bonus: Fetched parallel profiles for ${users[0].name} and ${users[1].name}`);
  })
  .catch((err) => console.error("Bonus error:", err.message));
