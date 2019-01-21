import { NativeBase, Switch as NBSwitch } from "native-base";
import * as React from "react";

import variables from "../../theme/variables";

/**
 * NativeBase Switch component styled with the app's brand primary color
 */
export default class Switch extends React.Component<NativeBase.Switch> {
  public render() {
    return (
      <NBSwitch
        trackColor={{
          false: "#eee",
          true: this.props.disabled
            ? variables.brandPrimaryLight
            : variables.brandPrimary
        }}
        {...this.props}
      />
    );
  }
}
