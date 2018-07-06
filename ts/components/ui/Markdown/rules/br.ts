import { Text } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

/**
 * A simple rule that render `br` as a new line
 */
function rule() {
  return (_: SingleASTNode, __: ReactOutput, state: State): React.ReactNode => {
    return React.createElement(
      Text,
      {
        key: state.key
      },
      "\n\n"
    );
  };
}

export default makeReactNativeRule(rule());
