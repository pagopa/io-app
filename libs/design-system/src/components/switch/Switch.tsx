import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from "react-native";

import { useIOTheme } from "../../context";
import { IOColorsLegacy } from "../../core/IOColors";

type OwnProps = Pick<
  RNSwitchProps,
  | "accessibilityElementsHidden"
  | "accessibilityLabel"
  | "accessible"
  | "disabled"
  | "importantForAccessibility"
  | "onValueChange"
  | "testID"
  | "value"
>;

export const Switch = ({
  onValueChange,
  value,
  ...accessibility
}: OwnProps) => {
  const theme = useIOTheme();

  const trackColor = {
    false: IOColorsLegacy[theme["switch-background-off"]],
    true: IOColorsLegacy[theme["switch-background-on"]]
  };

  return (
    <RNSwitch
      {...accessibility}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: accessibility.disabled }}
      ios_backgroundColor={IOColorsLegacy[theme["switch-background-off"]]}
      onValueChange={onValueChange}
      thumbColor={IOColorsLegacy[theme["switch-thumb-color"]]}
      trackColor={trackColor}
      value={value}
    />
  );
};
