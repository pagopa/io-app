import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import MarkdownBr from "../MarkdownBr";
import { makeReactNativeRule } from "./utils";

/**
 * A simple rule that render `br` as a new line
 */
function rule() {
  return (_: SingleASTNode, __: ReactOutput, state: State): React.ReactNode => {
    return React.createElement(
      MarkdownBr,
      {
        key: state.key
      },
      "\n"
    );
  };
}

export default makeReactNativeRule(rule());
