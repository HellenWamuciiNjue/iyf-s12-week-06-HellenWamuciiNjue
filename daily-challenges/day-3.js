Promise.resolve("Initiating operations...")
    .then(() => { throw new Error("Simulated anomaly caught in Step 3."); })
    .catch(error => console.warn(`Safely intercepted error node: ${error.message}`));
