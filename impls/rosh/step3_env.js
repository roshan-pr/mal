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
  MalNill,
} = require("./types");
const { Env } = require("./env");

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const arithmeticOperation = (cb, initialValue, ...args) => {
  if (initialValue === undefined) throw "Wrong arguments";

  return args.reduce(cb, initialValue);
};

const _env = {
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
    return env.get(ast);
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

  switch (ast.value[0].value) {
    case "def!":
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case "let*":
      const newEnv = new Env(env);

      const variables = ast.value[1].value;
      for (let index = 0; index < variables.length; index += 2) {
        const variable = variables[index];
        const value = variables[index + 1];
        newEnv.set(variable, EVAL(value, newEnv));
      }

      return EVAL(ast.value[2], newEnv);
  }
  const [fn, ...args] = eval_ast(ast, env).value;

  return fn.apply(null, args);
};

const PRINT = (malValue) => pr_str(malValue);

const env = new Env();
env.set(new MalSymbol("+"), (...args) =>
  arithmeticOperation((a, b) => a + b, ...args)
);
env.set(new MalSymbol("*"), (...args) =>
  arithmeticOperation((a, b) => a * b, ...args)
);
env.set(new MalSymbol("/"), (...args) =>
  arithmeticOperation((a, b) => a / b, ...args)
);
env.set(new MalSymbol("-"), (...args) =>
  arithmeticOperation((a, b) => a - b, ...args)
);

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
