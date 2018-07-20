import { Text } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

function rule() {
  return (
    node: SingleASTNode,
    _: ReactOutput,
    state: State
  ): React.ReactNode => {
    // If we are inside a heading just return the plain content
    if (state.withinHeading) {
      return node.content;
    }
    // If we are inside a list add proper indentation and numbers/bullets
    if (state.withinList) {
      const listLevel = state.listLevel || 0;
      const symbol = state.listOrdered ? `${state.position}.` : "*";
      const content = `${" ".repeat(listLevel * 2)}${symbol} ${node.content}`;
      return React.createElement(
        Text,
        {
          key: state.key
        },
        content
      );
    }
    return React.createElement(
      Text,
      {
        key: state.key
      },
      node.content
    );
  };
}

export default makeReactNativeRule(rule());
