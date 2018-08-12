import { Text } from "native-base";
import * as React from "react";
import { Linking } from "react-native";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    const newState = { ...state, withinLink: true };

    // Create the Text element that must go inside <Button>
    return React.createElement(
      Text,
      {
        key: state.key,
        markdown: true,
        link: true,
        onPress: () => Linking.openURL(node.target).catch(_ => undefined)
      },
      output(node.content, newState)
    );
  };
}

export default makeReactNativeRule(rule());
