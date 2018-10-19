import * as React from "react";
import {
  Capture,
  defaultRules,
  Parser,
  ReactOutput,
  SingleASTNode,
  State
} from "simple-markdown";

import MarkdownDemo from "../MarkdownDemo";

const rule = {
  order: defaultRules.blockQuote.order,

  // First we check whether a string matches
  match: (source: string) => {
    return /^\[demo\]([\s\S]+?)\[\/demo\]\s*\n{2,}/.exec(source);
  },

  // Then parse this string into a syntax node
  parse: (capture: Capture, parse: Parser, state: State) => {
    return {
      content: parse(`${capture[1]}\n\n`, state)
    };
  },

  // Finally transform this syntax node into a
  // React element
  react_native: (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    return React.createElement(
      MarkdownDemo,
      {
        key: state.key
      },
      output(node.content, state)
    );
  }
};

export default rule;
