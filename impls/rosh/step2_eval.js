const readline = require("readline");
const { pr_str } = require("./printer");
const { read_str } = require("./reader");
const {
  MalSymbol,
  MalList,
  MalValue,
  MalBool,
  MalVector,
  MalHashMap,
} = require("./types");

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const arithmeticOperation = (cb, initialValue, ...args) => {
  if (initialValue === undefined) throw "Wrong arguments";

  return args.reduce(cb, initialValue);
};

const env = {
  "+": (...args) => arithmeticOperation((a, b) => a + b, ...args),
  "*": (...args) => arithmeticOperation((a, b) => a * b, ...args),
  "/": (...args) => arithmeticOperation((a, b) => a / b, ...args),
  "-": (initialValue, ...args) => {
    if (args.length === 0) return -initialValue;
    return arithmeticOperation((a, b) => a - b, initialValue, ...args);
  },
  // "=": (a, b) => new MalBool(a === b),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env[ast.value];
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalVector(newAst);
  }

  if (ast instanceof MalHashMap) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalHashMap(newAst);
  }

  return ast;
};

const READ = (str) => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  if (ast.isEmpty()) return ast;

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};
const PRINT = (malValue) => pr_str(malValue);

const repeat = (str) => PRINT(EVAL(READ(str), env));

const repl = () => {
  readLine.question("user> ", (line) => {
    try {
      console.log(repeat(line));
    } catch (error) {
      console.log(error);
    }
    repl();
  });
};

repl();
