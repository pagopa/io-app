module.exports = {
  trailingComma: "none",
  arrowParens: "avoid",
  parser: "typescript",
  overrides: [
    {
      files: "*.json",
      options: {
        parser: "json"
      }
    }
  ]
};
