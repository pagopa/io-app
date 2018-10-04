import { H1, H2, H3 } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from "./utils";

import H4 from "../../H4";
import H5 from "../../H5";
import H6 from "../../H6";

type ComponentTypes = {
  [key: number]: React.ComponentType;
};

const COMPONENT_TYPES: ComponentTypes = {
  1: H1,
  2: H2,
  3: H3,
  4: H4,
  5: H5,
  6: H6
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
      const newState = { ...state, withinHeading: true };
      return React.createElement(
        ComponentType,
        {
          key: state.key,
          inMessage: state.screen === "MESSAGE_DETAIL" ? true : false
        },
        output(node.content, newState)
      );
    }
    return null;
  };
}

export default makeReactNativeRule(rule());
