import { H1, H2, H3 } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

type ComponentTypes = {
  [key: number]: React.ComponentType;
};

const COMPONENT_TYPES: ComponentTypes = {
  1: H1,
  2: H2,
  3: H3
};

function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    const ComponentType =
      node.level in COMPONENT_TYPES ? COMPONENT_TYPES[node.level] : null;
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
