import { NativeSwitch as DSNativeSwitch } from "@pagopa/io-app-design-system";
import React from "react";
import { Platform, Switch, SwitchProps } from "react-native";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { IOColors } from "../../variables/IOColors";
import { IOSwitchVisualParams } from "../../variables/IOStyles";

type OwnProps = Pick<SwitchProps, "onValueChange" | "value">;

const bgLegacyTrackColorAndroid =
  Platform.OS === "android" ? IOColors["grey-300"] : IOColors.greyUltraLight;

/**
 * This component provides a switch toggle that uses the native platform switch component.
 * It can be integrated into other composite components.
 * Currently if the Design System is enabled, the component returns the NativeSwitch of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {boolean} value - The current value of the switch toggle (true for "on", false for "off").
 * @param {function} onValueChange - The function to be called when the switch value changes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the NativeSwitch of the @pagopa/io-app-design-system library.
 *
 */
export const NativeSwitch = ({ onValueChange, value }: OwnProps) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return isDesignSystemEnabled ? (
    <DSNativeSwitch onValueChange={onValueChange} value={value} />
  ) : (
    <Switch
      trackColor={{
        false: bgLegacyTrackColorAndroid,
        true: IOColors.blue
      }}
      thumbColor={IOColors[IOSwitchVisualParams.bgCircle]}
      ios_backgroundColor={bgLegacyTrackColorAndroid}
      onValueChange={onValueChange}
      value={value}
    />
  );
};
