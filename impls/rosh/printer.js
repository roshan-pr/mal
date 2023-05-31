const { MalValue } = require("./types");

const pr_str = (value) =>
  value instanceof MalValue === true ? value.pr_str() : value;

module.exports = { pr_str };
