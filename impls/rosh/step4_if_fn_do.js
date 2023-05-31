const readline = require("readline");
const { pr_str } = require("./printer");
const { read_str } = require("./reader");
const { MalSymbol, MalList, MalVector, MalHashMap } = require("./types");
const { Env } = require("./env");
const { env } = require("./initEnv");
const { MalNill } = require("./types");

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

const eval_def_form = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const eval_let_form = (ast, env) => {
  const newEnv = new Env(env);
  const bindings = ast.value[1].value;

  for (let index = 0; index < bindings.length; index += 2) {
    newEnv.set(bindings[index], EVAL(bindings[index + 1], newEnv));
  }
  return EVAL(ast.value[2], newEnv);
};

const eval_if_form = (ast, env) => {
  const [predicate, if_block, else_block] = ast.value.slice(1);
  const result = EVAL(predicate, env).value;

  if (result !== false && result !== null) return EVAL(if_block, env);

  if (else_block !== undefined) return EVAL(else_block, env);

  return new MalNill();
};

const eval_do_form = (ast, env) => {
  const [...forms] = ast.value.slice(1);
  forms.slice(0, -1).forEach((form) => EVAL(form, env));
  return EVAL(...forms.slice(-1), env);
};

const eval_fn_form = (ast, env) => {
  const [bindings, expression] = ast.value.slice(1);

  return (...args) => {
    const fnEnv = new Env(env);
    for (let index = 0; index < bindings.value.length; index++) {
      fnEnv.set(bindings.value[index], EVAL(args[index], fnEnv));
    }

    return EVAL(expression, fnEnv);
  };
};

const READ = (str) => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  if (ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case "def!":
      return eval_def_form(ast, env);

    case "let*":
      return eval_let_form(ast, env);

    case "if":
      return eval_if_form(ast, env);

    case "do":
      return eval_do_form(ast, env);

    case "fn*":
      return eval_fn_form(ast, env);
  }
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
