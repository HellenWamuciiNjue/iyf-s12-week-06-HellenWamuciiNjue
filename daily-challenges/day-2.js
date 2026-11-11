const step1 = () => Promise.resolve("Chain Link 1");
const step2 = (prev) => Promise.resolve(`${prev} -> Link 2`);
const step3 = (prev) => Promise.resolve(`${prev} -> Link 3 Complete!`);

step1().then(step2).then(step3).then(finalResult => console.log(finalResult));
