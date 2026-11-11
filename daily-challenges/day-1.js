const delayPromise = new Promise((resolve) => {
    setTimeout(() => resolve("Day 1 Promise fully resolved after 2 seconds!"), 2000);
});
delayPromise.then(msg => console.log(msg));
