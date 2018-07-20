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
    return React.createElement(
      Text,
      {
        key: state.key,
        link: true,
        onPress: () => Linking.openURL(node.target).catch(_ => undefined)
      },
      output(node.content, state)
    );
  };
}

export default makeReactNativeRule(rule());
