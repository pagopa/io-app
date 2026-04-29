module.exports = {
  trailingComma: "none",
  arrowParens: "avoid",
  overrides: [
    {
      files: "*.json",
      options: {
        parser: "json"
      }
    }
  ]
};
