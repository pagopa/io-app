import { Text, View } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import MarkdownList from "../MarkdownList";
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
        : React.createElement(
            Text,
            { key: state.key, style: { marginTop: 2 } },
            "\u2022 "
          );

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
            flexDirection: "row",
            alignItems: "flex-start"
          }
        },
        [bullet, listItemText]
      );
    });

    return React.createElement(
      MarkdownList,
      {
        key: state.key
      },
      items
    );
  };
}

export default makeReactNativeRule(rule());
