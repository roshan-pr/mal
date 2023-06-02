const { isDeepStrictEqual } = require("util");
const { Env } = require("./env");
const {
  MalSymbol,
  MalList,
  MalVector,
  MalBool,
  MalNill,
  MalValue,
  MalString,
} = require("./types");

const arithmeticOperation = (cb, initialValue, ...args) => {
  if (initialValue === undefined) throw "Wrong arguments";

  return args.reduce(cb, initialValue);
};

const isIterable = (a) => {
  return a instanceof MalList || a instanceof MalVector;
};

const deepStrictEqual = (a, b) => {
  console.log(a);
  console.log(b);
  if (isIterable(a) && isIterable(b) && a.value.length === b.value.length) {
    return a.value.every((a, i) => a === b.value[i]);
  }
  if (a instanceof MalValue && b instanceof MalValue)
    return a.value === b.value;

  return a === b;
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

env.set(
  new MalSymbol(">="),
  (...args) => new MalBool(arithmeticOperation((a, b) => a >= b, ...args))
);

env.set(
  new MalSymbol("<="),
  (...args) => new MalBool(arithmeticOperation((a, b) => a <= b, ...args))
);

env.set(
  new MalSymbol("="),
  (...args) =>
    new MalBool(arithmeticOperation((a, b) => deepStrictEqual(a, b), ...args))
);

env.set(
  new MalSymbol(">"),
  (...args) => new MalBool(arithmeticOperation((a, b) => a > b, ...args))
);

env.set(
  new MalSymbol("<"),
  (...args) => new MalBool(arithmeticOperation((a, b) => a < b, ...args))
);

env.set(new MalSymbol("not"), (arg) =>
  arg instanceof MalValue ? !arg.value : !arg
);

env.set(new MalSymbol("count"), (arg) => arg.value.length);
env.set(new MalSymbol("list"), (...args) => new MalList(args));
env.set(new MalSymbol("vector"), (...args) => new MalVector(args));
env.set(new MalSymbol("empty?"), (arg) => new MalBool(arg.value.length === 0));

env.set(new MalSymbol("str"), (...args) => {
  const stringValues = args.map((a) => (a instanceof MalValue ? a.value : a));

  return '"' + stringValues.join("") + '"';
});

env.set(new MalSymbol("list?"), (arg) => {
  return arg instanceof MalList;
});

env.set(new MalSymbol("prn"), (...args) => {
  const consolidatedString = args.map((a) =>
    a instanceof MalValue ? a.pr_str() : a
  );

  console.log(...consolidatedString);
  return new MalNill();
});

env.set(new MalSymbol("println"), (...args) => {
  const consolidatedString = args.map((a) =>
    a instanceof MalValue ? a.value : a
  );

  console.log(...consolidatedString);
  return new MalNill();
});

module.exports = { env };
