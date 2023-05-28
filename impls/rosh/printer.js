const { MalValue } = require("./types");

const pr_str = (malValue) =>
  malValue instanceof MalValue === true ? malValue.pr_str() : malValue;

module.exports = { pr_str };
