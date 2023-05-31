const { Env } = require("./env");
const { MalSymbol, MalList, MalVector, MalBool, MalNill } = require("./types");

const arithmeticOperation = (cb, initialValue, ...args) => {
  if (initialValue === undefined) throw "Wrong arguments";

  return args.reduce(cb, initialValue);
};

const env = new Env(); //// Environment Declaration;

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

env.set(new MalSymbol(">="), (a, b) => new MalBool(a >= b));
env.set(new MalSymbol(">="), (a, b) => new MalBool(a >= b));
env.set(new MalSymbol("="), (a, b) => new MalBool(a === b));
env.set(new MalSymbol(">"), (a, b) => new MalBool(a > b));
env.set(new MalSymbol("<"), (a, b) => new MalBool(a < b));
env.set(new MalSymbol("str"), (...args) => args.join(""));
env.set(new MalSymbol("count"), (arg) => arg.value.length);
env.set(new MalSymbol("list"), (...args) => new MalList(args));
env.set(new MalSymbol("vector"), (...args) => new MalVector(args));
env.set(new MalSymbol("empty?"), (arg) => new MalBool(arg.value.length === 0));

env.set(new MalSymbol("list?"), (arg) => {
  return arg instanceof MalList;
});

env.set(new MalSymbol("prn"), (...args) => {
  console.log(...args);
  return new MalNill();
});

env.set(new MalSymbol("println"), (...args) => {
  process.stdout.setEncoding("utf-8");
  process.stdout.write(args.join(" ").toString() + "\n");
  return new MalNill();
});

module.exports = { env };
