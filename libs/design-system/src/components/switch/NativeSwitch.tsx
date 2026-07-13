import { Switch, SwitchProps } from "react-native";
import { useIOTheme } from "../../context";
import { IOColors } from "../../core/IOColors";

type OwnProps = Pick<
  SwitchProps,
  | "onValueChange"
  | "value"
  | "accessible"
  | "accessibilityLabel"
  | "testID"
  | "disabled"
  | "accessibilityElementsHidden"
  | "importantForAccessibility"
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
      trackColor={trackColor}
      thumbColor={IOColors[theme["switch-thumb-color"]]}
      ios_backgroundColor={IOColors[theme["switch-background-off"]]}
      onValueChange={onValueChange}
      value={value}
    />
  );
};
