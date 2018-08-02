import { Button, Text } from "native-base";
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
    const text = React.createElement(Text, {}, output(node.content, newState));

    return React.createElement(
      Button,
      {
        key: state.key,
        primary: true,
        small: true,
        style: {
          height: 26
        },
        onPress: () => Linking.openURL(node.target).catch(_ => undefined)
      },
      text
    );
  };
}

export default makeReactNativeRule(rule());
