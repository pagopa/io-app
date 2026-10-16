import { Switch, SwitchProps } from "react-native";

import { useIOTheme } from "../../context";
import { IOColors } from "../../core/IOColors";

type OwnProps = Pick<
  SwitchProps,
  | "accessibilityElementsHidden"
  | "accessibilityLabel"
  | "accessible"
  | "disabled"
  | "importantForAccessibility"
  | "onValueChange"
  | "testID"
  | "value"
>;

export const NativeSwitch = ({
  onValueChange,
  value,
  ...accessibility
}: OwnProps) => {
  const theme = useIOTheme();

  const trackColor = {
    false: IOColors[theme["switch-background-off"]],
    true: IOColors[theme["switch-background-on"]]
  };

  return (
    <Switch
      {...accessibility}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: accessibility.disabled }}
      ios_backgroundColor={IOColors[theme["switch-background-off"]]}
      onValueChange={onValueChange}
      thumbColor={IOColors[theme["switch-thumb-color"]]}
      trackColor={trackColor}
      value={value}
    />
  );
};
