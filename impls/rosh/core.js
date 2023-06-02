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
  if (isIterable(a) && isIterable(b) && a.value.length === b.value.length) {
    return a.value.every((a, i) => a === b.value[i]);
  }
  if (a instanceof MalValue && b instanceof MalValue)
    return a.value === b.value;

  return a === b;
};

const ns = {
  "+": (...args) => arithmeticOperation((a, b) => a + b, ...args),
  "*": (...args) => arithmeticOperation((a, b) => a * b, ...args),
  "/": (...args) => arithmeticOperation((a, b) => a / b, ...args),
  "-": (...args) => arithmeticOperation((a, b) => a - b, ...args),
  ">=": (...args) =>
    new MalBool(arithmeticOperation((a, b) => a >= b, ...args)),
  "<=": (...args) =>
    new MalBool(arithmeticOperation((a, b) => a <= b, ...args)),
  "=": (...args) =>
    new MalBool(arithmeticOperation((a, b) => deepStrictEqual(a, b), ...args)),
  ">": (...args) => new MalBool(arithmeticOperation((a, b) => a > b, ...args)),
  "<": (...args) => new MalBool(arithmeticOperation((a, b) => a < b, ...args)),
  not: (arg) => (arg instanceof MalValue ? !arg.value : !arg),
  count: (arg) => arg.value.length,
  list: (...args) => new MalList(args),
  vector: (...args) => new MalVector(args),
  "empty?": (arg) => new MalBool(arg.value.length === 0),
  str: (...args) => {
    const stringValues = args.map((a) => (a instanceof MalValue ? a.value : a));
    return '"' + stringValues.join("") + '"';
  },
  "list?": (arg) => arg instanceof MalList,
  prn: (...args) => {
    const consolidatedString = args.map((a) =>
      a instanceof MalValue ? a.pr_str() : a
    );
    console.log(...consolidatedString);
    return new MalNill();
  },
  println: (...args) => {
    const consolidatedString = args.map((a) =>
      a instanceof MalValue ? a.value : a
    );
    console.log(...consolidatedString);
    return new MalNill();
  },
};

module.exports = { ns };
