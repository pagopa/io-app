import { View } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    const listLevel: number = state.listLevel || 0;
    const position: number = node.start || 0;
    const items = node.items.map((item: any, i: number) => {
      state = {
        ...state,
        listLevel: listLevel + 1,
        withinList: true,
        listOrdered: node.ordered,
        position: position + i
      };
      return React.createElement(
        View,
        {
          key: i
        },
        output(item, state)
      );
    });

    return React.createElement(
      View,
      {
        key: state.key
      },
      items
    );
  };
}

export default makeReactNativeRule(rule());
