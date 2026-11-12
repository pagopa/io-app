import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from "react-native";

import { useIOColors } from "../../context";

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
  const switchColors = useIOColors().component.switch;

  const trackColor = {
    false: switchColors.track.off,
    true: switchColors.track.on
  };

  return (
    <RNSwitch
      {...accessibility}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: accessibility.disabled }}
      ios_backgroundColor={switchColors.track.off}
      onValueChange={onValueChange}
      thumbColor={switchColors.thumb}
      trackColor={trackColor}
      value={value}
    />
  );
};
