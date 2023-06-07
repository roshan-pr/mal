const { MalValue } = require("./types");

const pr_str = (value) =>
  value instanceof MalValue ? value.pr_str(true) : value;

module.exports = { pr_str };
