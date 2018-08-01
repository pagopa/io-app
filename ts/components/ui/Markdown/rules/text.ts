import { Text } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

function rule() {
  return (node: SingleASTNode, _: ReactOutput, __: State): React.ReactNode => {
    const words = node.content.split(" ");

    const texts = words.map((word: any, i: number) => {
      const text = i !== words.length - 1 ? `${word} ` : word;
      return React.createElement(
        Text,
        {
          key: i
        },
        text
      );
    });

    return texts;
  };
}

export default makeReactNativeRule(rule());
