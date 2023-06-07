const {
  MalList,
  MalSymbol,
  MalVector,
  MalHashMap,
  MalNill,
  MalBool,
  MalString,
} = require("./types");

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }
  peek() {
    return this.tokens[this.position];
  }
  next() {
    const token = this.peek();
    this.position++;
    return token;
  }
}

const tokenize = (str) => {
  const regex =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(regex)].map((x) => x[1]).slice(0, -1);
};

const createString = (token) => {
  let str = token.slice(1, -1).replace(/\\(.)/g, (_, c) => {
    return c === "n" ? "\n" : c;
  });

  return new MalString(str);
};

const read_seq = (reader, closingSymbol) => {
  reader.next();
  const ast = []; // abstract syntax tree

  while (reader.peek() != closingSymbol) {
    if (reader.peek() === undefined) throw "unbalanced";

    ast.push(read_form(reader));
  }
  reader.next();
  return ast;
};

const read_list = (reader) => {
  const ast = read_seq(reader, ")");
  return new MalList(ast);
};

const read_vector = (reader) => {
  const ast = read_seq(reader, "]");
  return new MalVector(ast);
};

const read_hash_map = (reader) => {
  const ast = read_seq(reader, "}");

  if (ast.length % 2 !== 0) throw "unbalanced";

  return new MalHashMap(ast);
};

const parseString = (str) => str.slice(1, -1);

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^"/)) return createString(token);
  if (token.match(/^-?[0-9]+$/)) return parseInt(token);

  if (token === "true") return new MalBool(true);
  if (token === "false") return new MalBool(false);
  if (token === "nil") return new MalNill();

  if (token.match(/^:/)) return token;

  return new MalSymbol(token);
};

const prependSymbol = (reader, symbolStr) => {
  reader.next();
  const symbol = new MalSymbol(symbolStr);
  const newAst = read_form(reader);
  return new MalList([symbol, newAst]);
};

const read_form = (reader) => {
  const token = reader.peek();
  switch (token) {
    case "(":
      return read_list(reader);
    case "[":
      return read_vector(reader);
    case "{":
      return read_hash_map(reader);
    case ";":
      reader.next();
      return new MalNill();
    case "@":
      return prependSymbol(reader, "deref");
    case "'":
      return prependSymbol(reader, "quote");
    case "`":
      return prependSymbol(reader, "quasiquote");
    case "~@":
      return prependSymbol(reader, "splice-unquote");
    case "~":
      return prependSymbol(reader, "unquote");
    default:
      return read_atom(reader);
  }
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };
