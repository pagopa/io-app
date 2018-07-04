import { Text } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

/**
 * A rule that render `strong` elements using a Text component with the `bold` property
 */
function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    return React.createElement(
      Text,
      {
        key: state.key,
        bold: true
      },
      output(node.content, state)
    );
  };
}

export default makeReactNativeRule(rule());
