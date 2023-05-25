const { stdout, stdin } = require("process");

const READ = (x) => x;

const EVAL = (x) => x;

const PRINT = (x) => x;

const rep = (x) => PRINT(EVAL(READ(x)));

process.stdin.setEncoding("utf-8");

const main = (x) => {
  const prompt = "user> ";
  stdout.write(prompt);
  stdin.on("data", (chunk) => {
    stdout.write(rep(chunk));
    stdout.write(prompt);
  });
};

main();
