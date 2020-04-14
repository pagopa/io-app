import { NativeBase, Switch as NBSwitch } from "native-base";
import * as React from "react";
import { Platform } from "react-native";

import { fromPredicate } from "fp-ts/lib/Option";
import variables from "../../theme/variables";

const maybeDisabled = fromPredicate(
  (isDisabled: boolean | undefined = undefined) => isDisabled === true
);
/**
 * NativeBase Switch component styled with the app's brand primary color
 */
export default class Switch extends React.Component<NativeBase.Switch> {
  public render() {
    const thumbColor: string = maybeDisabled(this.props.disabled)
      .map(_ => variables.brandPrimaryLight)
      .getOrElse(variables.contentPrimaryBackground);

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
              ? thumbColor
              : variables.brandLightGray
            : "default"
        }
        {...this.props}
      />
    );
  }
}
