class MalValue {
  constructor(value) {
    this.value = value;
  }
  pr_str() {
    return this.value.toString();
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }
  pr_str() {
    return (
      "(" +
      this.value
        .map((value) =>
          value instanceof MalValue === true ? value.pr_str() : value
        )
        .join(" ") +
      ")"
    );
  }
  isEmpty() {
    return this.value.length === 0;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }
  pr_str() {
    return (
      "[" +
      this.value
        .map((x) => (x instanceof MalValue ? x.pr_str() : x))
        .join(" ") +
      "]"
    );
  }
}

class MalHashMap extends MalValue {
  constructor(value) {
    super(value);
  }
  pr_str() {
    return (
      "{" +
      this.value
        .map((x) => (x instanceof MalValue ? x.pr_str() : x))
        .join(" ") +
      "}"
    );
  }
}

class MalBool extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  // pr_str() {
  //   return '"' + this.value + '"';
  // }
  pr_str(print_readably = true) {
    if (print_readably) {
      return (
        '"' +
        this.value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n") +
        '"'
      );
    }
    return this.value;
  }
}

class MalNill extends MalValue {
  constructor() {
    super(null);
  }
  pr_str() {
    return "nil";
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
  }
  pr_str() {
    return "#<function>";
  }
  apply(contx, args) {
    return this.fn.apply(null, args);
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "(atom " + this.value + ")";
  }

  deref() {
    return this.value;
  }
  reset(value) {
    this.value = value;
    return this.value;
  }
  swap(fn, args) {
    let actualFn = fn;
    if (fn instanceof MalFunction) {
      actualFn = fn.fn;
    }
    console.log(args);
    this.value = actualFn.apply(null, [this.deref(), ...args]);
    return this.value;
  }
}

module.exports = {
  MalSymbol,
  MalValue,
  MalList,
  MalVector,
  MalHashMap,
  MalNill,
  MalBool,
  MalString,
  MalFunction,
  MalAtom,
};
