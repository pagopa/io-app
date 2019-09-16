import { NativeBase, Switch as NBSwitch } from "native-base";
import * as React from "react";
import { Platform } from "react-native";

import variables from "../../theme/variables";

/**
 * NativeBase Switch component styled with the app's brand primary color
 */
export default class Switch extends React.Component<NativeBase.Switch> {
  public render() {
    return (
      <NBSwitch
        // Stick
        trackColor={{
          false: "default",
          true:
            Platform.OS === "android"
              ? variables.brandLightGray
              : variables.contentPrimaryBackground
        }}
        // Circle
        thumbColor={
          Platform.OS === "android"
            ? this.props.value
              ? variables.contentPrimaryBackground
              : "default"
            : "default"
        }
        {...this.props}
      />
    );
  }
}
