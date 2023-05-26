const readline = require("readline");
const { pr_str } = require("./printer");
const { read_str } = require("./reader");

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = (str) => read_str(str);
const EVAL = (str) => str;
const PRINT = (malValue) => pr_str(malValue);

const rep = (str) => PRINT(EVAL(READ(str)));

const repl = () => {
  readLine.question("user> ", (line) => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(error);
    }
    repl();
  });
};

repl();
