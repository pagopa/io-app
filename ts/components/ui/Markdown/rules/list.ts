import { Text, View } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from "./utils";

function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    const items = node.items.map((item: any, i: number) => {
      const bullet = node.ordered
        ? React.createElement(Text, { key: state.key }, `${i + 1}. `)
        : React.createElement(Text, { key: state.key }, "\u2022 ");

      const listItemText = React.createElement(
        Text,
        { key: (state.key as number) + 1 },
        output(item, state)
      );

      return React.createElement(
        View,
        {
          key: i,
          style: {
            flexDirection: "row"
          }
        },
        [bullet, listItemText]
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
