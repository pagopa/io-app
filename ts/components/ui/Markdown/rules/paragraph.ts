import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import MarkdownParagraph from "../MarkdownParagraph";
import { makeReactNativeRule } from "./utils";

// tslint:disable-next-line:cognitive-complexity
function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    return React.createElement(
      MarkdownParagraph,
      {
        key: state.key
      },
      output(node.content, state)
    );
  };
}

export default makeReactNativeRule(rule());
