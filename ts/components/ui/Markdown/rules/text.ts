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
    // If we are inside a heading return the plain content
    if (state.withinHeading || state.withinLink) {
      return node.content;
    }

    const words = node.content.split(/[ \n]/);

    return words.map((word: any, i: number) => {
      const text = i !== words.length - 1 ? `${word} ` : word;
      return React.createElement(
        Text,
        {
          key: i,
          markdown: true
        },
        text
      );
    });
  };
}

export default makeReactNativeRule(rule());
