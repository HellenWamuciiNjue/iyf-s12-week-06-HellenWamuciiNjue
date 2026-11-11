const fetchUserDataLegacy = (cb) => setTimeout(() => cb("Data Object Payload"), 1000);

// Refactored implementation leveraging modern structural wrapping rules
const getUserDataAsync = () => new Promise(resolve => fetchUserDataLegacy(resolve));

async function runDay4() {
    const result = await getUserDataAsync();
    console.log(`Day 4 async/await resolution result: ${result}`);
}
runDay4();
