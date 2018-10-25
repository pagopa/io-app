import { Text } from "native-base";
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
  parse: (capture: Capture, _: Parser, __: State) => {
    return {
      content: `${capture[1]}`
    };
  },

  // Finally transform this syntax node into a
  // React element
  react_native: (
    node: SingleASTNode,
    _: ReactOutput,
    state: State
  ): React.ReactNode => {
    const demoText = React.createElement(
      Text,
      {
        bold: true,
        markdown: true,
        style: {
          lineHeight: 21
        }
      },
      node.content
    );

    return React.createElement(
      MarkdownDemo,
      {
        key: state.key
      },
      demoText
    );
  }
};

export default rule;
