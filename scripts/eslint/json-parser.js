"use strict";

const getLoc = text => {
  const lines = text.split(/\r\n|\r|\n/);
  const lastLine = lines.at(-1) ?? "";

  return {
    start: { line: 1, column: 0 },
    end: { line: lines.length, column: lastLine.length }
  };
};

module.exports = {
  meta: {
    name: "io-json-parser"
  },
  parseForESLint(text) {
    return {
      ast: {
        type: "Program",
        body: [],
        comments: [],
        loc: getLoc(text),
        range: [0, text.length],
        sourceType: "script",
        tokens: []
      },
      visitorKeys: {
        Program: []
      }
    };
  }
};
