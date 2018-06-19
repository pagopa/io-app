import { H1, H2, H3 } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    // tslint:disable-next-line no-let
    let ComponentType = null;
    switch (node.level) {
      case 1:
        ComponentType = H1;
        break;
      case 2:
        ComponentType = H2;
        break;
      case 3:
        ComponentType = H3;
        break;
    }
    if (ComponentType) {
      state = { ...state, withinHeading: true };
      return React.createElement(
        ComponentType,
        {
          key: state.key
        },
        output(node.content, state)
      );
    }
    return null;
  };
}

export default makeReactNativeRule(rule());
