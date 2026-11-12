import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions, IOTokenColor } from "../../core";
import { H6, IOText } from "../typography";

const MAX_WIDTH = 48;
const MAX_HEIGHT = 64;

type Props = {
  secret?: boolean;
  status: "default" | "error" | "focus";
  value?: string;
};

const styles = StyleSheet.create({
  boxWrapper: {
    flex: 1,
    maxWidth: MAX_WIDTH,
    maxHeight: MAX_HEIGHT,
    aspectRatio: MAX_WIDTH / MAX_HEIGHT
  },
  baseBox: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: IODimensions.radius.otpInput,
    borderCurve: "continuous"
  }
});

const borderWidths: Record<Props["status"], number> = {
  error: IODimensions.stroke.otpInput.default,
  focus: IODimensions.stroke.otpInput.focused,
  default: IODimensions.stroke.otpInput.default
};

const SecretValue = ({ color }: { color: IOTokenColor }) => (
  <IOText
    accessible={false}
    color={color}
    font="FiraCode"
    lineHeight={33}
    size={22}
    weight="Semibold"
  >
    {"•"}
  </IOText>
);

export const BoxedInput = memo(({ status, value, secret }: Props) => {
  const otpInputColors = useIOColors().component.otpInput;
  const boxColors = otpInputColors.box[status];
  const valueColor = otpInputColors.foreground;

  return (
    <View accessible={false} style={styles.boxWrapper}>
      <View
        style={[
          styles.baseBox,
          {
            borderWidth: borderWidths[status],
            borderColor: boxColors.border,
            ...("background" in boxColors && {
              backgroundColor: boxColors.background
            })
          }
        ]}
      >
        {value &&
          (secret ? (
            <SecretValue color={valueColor} />
          ) : (
            <H6 accessible={false} color={valueColor}>
              {value}
            </H6>
          ))}
      </View>
    </View>
  );
});
