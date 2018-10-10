import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import MarkdownBlockQuote from "../MarkdownBlockQuote";
import { makeReactNativeRule } from "./utils";

function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    return React.createElement(
      MarkdownBlockQuote,
      {
        key: state.key
      },
      output(node.content, state)
    );
  };
}

export default makeReactNativeRule(rule());
