const targetEndpointMock = (id, time) => new Promise(res => setTimeout(() => res(`Resource ${id}`), time));

async function processConcurrentFetches() {
    // Parallel execution matching challenge patterns
    const batchResults = await Promise.all([
        targetEndpointMock('A', 500),
        targetEndpointMock('B', 800),
        targetEndpointMock('C', 300)
    ]);
    console.log("Day 5 Promise.all batch output values:", batchResults);
}
processConcurrentFetches();
