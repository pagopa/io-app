import { NativeBase, Switch as NBSwitch } from "native-base";
import * as React from "react";
import { Platform } from "react-native";

import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { IOColors } from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
import variables from "../../theme/variables";

const maybeDisabled = O.fromPredicate(
  (isDisabled: boolean | undefined = undefined) => isDisabled === true
);
/**
 * NativeBase Switch component styled with the app's brand primary color
 *
 * @deprecated This `Switch` component uses the NativeBase switch at its core. Use `NativeSwitch`
 * from `io-app-design-system` instead.
 */
export default class Switch extends React.Component<NativeBase.Switch> {
  public render() {
    const thumbColor: string = pipe(
      maybeDisabled(this.props.disabled),
      O.map(_ => IOColors.blueUltraLight),
      O.getOrElse(() => variables.contentPrimaryBackground)
    );

    return (
      <NBSwitch
        accessible={true}
        accessibilityLabel={
          this.props.accessibilityLabel ??
          I18n.t("global.accessibility.switchLabel")
        }
        // Stick
        trackColor={{
          false: "default",
          true:
            Platform.OS === "android"
              ? IOColors.greyLight
              : variables.contentPrimaryBackground
        }}
        // Circle
        thumbColor={
          Platform.OS === "android"
            ? this.props.value
              ? thumbColor
              : IOColors.greyLight
            : "default"
        }
        {...this.props}
      />
    );
  }
}
