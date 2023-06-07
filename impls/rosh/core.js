const { isDeepStrictEqual } = require("util");
const { Env } = require("./env");
const fs = require("fs");
const {
  MalSymbol,
  MalList,
  MalVector,
  MalBool,
  MalNill,
  MalValue,
  MalString,
  MalAtom,
} = require("./types");
const { read_str } = require("./reader");

const arithmeticOperation = (cb, initialValue, ...args) => {
  if (initialValue === undefined) throw "Wrong arguments";

  return args.reduce(cb, initialValue);
};

const isIterable = (a) => {
  return a instanceof MalList || a instanceof MalVector;
};

const _deepStrictEqual = (a, b) => {
  if (isIterable(a) && isIterable(b) && a.value.length === b.value.length) {
    return a.value.every((a, i) => a === b.value[i]);
  }
  if (a instanceof MalValue && b instanceof MalValue)
    return a.value === b.value;

  if (a instanceof MalQuote && b instanceof MalQuote)
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
    new MalBool(
      arithmeticOperation((a, b) => isDeepStrictEqual(a, b), ...args)
    ),
  ">": (...args) => new MalBool(arithmeticOperation((a, b) => a > b, ...args)),
  "<": (...args) => new MalBool(arithmeticOperation((a, b) => a < b, ...args)),
  not: (arg) => (arg instanceof MalValue ? !arg.value : !arg),
  count: (arg) => arg.value.length,
  list: (...args) => new MalList(args),
  vec: (args) => new MalVector([...args.value]),
  vector: (args) => new MalVector([args]),
  "empty?": (arg) => new MalBool(arg.value.length === 0),
  str: (...args) => {
    const stringValues = args.map((a) => (a instanceof MalValue ? a.value : a));
    // return '"' + stringValues.join("") + '"';
    return new MalString(stringValues.join(""));
  },
  "list?": (arg) => arg instanceof MalList,
  prn: (...args) => {
    const consolidatedString = args.map((a) =>
      a instanceof MalValue ? a.pr_str(true) : a
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
  "read-string": (string) => read_str(string.value),
  slurp: (filename) => new MalString(fs.readFileSync(filename.value, "utf-8")),
  atom: (value) => new MalAtom(value),
  "atom?": (value) => value instanceof MalAtom,
  deref: (atom) => atom.deref(),
  "reset!": (atom, value) => atom.reset(value),
  "swap!": (atom, fn, ...values) => atom.swap(fn, values),
  cons: (value, list) => new MalList([value, ...list.value]),
  concat: (...lists) => new MalList(lists.flatMap((x) => x.value)),
};

module.exports = { ns };
