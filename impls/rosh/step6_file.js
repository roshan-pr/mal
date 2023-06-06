const readline = require("readline");
const { pr_str } = require("./printer");
const { read_str } = require("./reader");
const {
  MalSymbol,
  MalList,
  MalVector,
  MalHashMap,
  MalFunction,
  MalNill,
} = require("./types");
const { Env } = require("./env");
const { ns } = require("./core");

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

const evalDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const evalLet = (ast, env) => {
  const newEnv = new Env(env);
  const bindings = ast.value[1].value;

  for (let index = 0; index < bindings.length; index += 2) {
    newEnv.set(bindings[index], EVAL(bindings[index + 1], newEnv));
  }
  return [ast.value[2], newEnv];
};

const evalIf = (ast, env) => {
  const [predicate, if_block, else_block] = ast.value.slice(1);
  const result = EVAL(predicate, env).value;

  if (result !== false && result !== null) return if_block;

  if (else_block !== undefined) return else_block;

  return new MalNill();
};

const evalDo = (ast, env) => {
  const [...forms] = ast.value.slice(1);
  forms.slice(0, -1).forEach((form) => EVAL(form, env));
  return forms.slice(-1)[0];
};

const evalFn = (ast, env) => {
  const [params, ...fnBody] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol("do"), ...fnBody]);

  // return new MalFunction(doForms, params.value, env);
  const fn = (...args) => {
    const newEnv = new Env(env, params.value, args);
    return EVAL(ast.value[2], newEnv);
  };
  return new MalFunction(doForms, params.value, env, fn);
};

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) return eval_ast(ast, env);
    if (ast.isEmpty()) return ast;

    switch (ast.value[0].value) {
      case "def!":
        return evalDef(ast, env);

      case "let*":
        [ast, env] = evalLet(ast, env);
        break;

      case "if":
        ast = evalIf(ast, env);
        break;

      case "do":
        ast = evalDo(ast, env);
        break;

      case "fn*":
        ast = evalFn(ast, env);
        break;

      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFunction) {
          const binds = fn.binds;
          const oldEnv = fn.env;
          env = new Env(oldEnv, binds, args);
          ast = fn.value;
        } else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = (malValue) => pr_str(malValue);

const env = new Env();

const initEnv = (ns) => {
  env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));

  for (const symbol in ns) {
    env.set(new MalSymbol(symbol), ns[symbol]);
  }
  return env;
};

const repeat = (str) => PRINT(EVAL(READ(str), initEnv(ns)));

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

repeat(
  '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

if (process.argv.length >= 3) {
  repeat('(load-file "' + process.argv[2] + '")');
  readline.close();
} else {
  repl();
}
