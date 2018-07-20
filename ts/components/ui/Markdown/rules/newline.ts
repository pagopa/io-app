import { Text } from "native-base";
import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import { makeReactNativeRule } from ".";

function rule() {
  return (_: SingleASTNode, __: ReactOutput, state: State): React.ReactNode => {
    return React.createElement(
      Text,
      {
        key: state.key
      },
      "\n"
    );
  };
}

export default makeReactNativeRule(rule());
