import { memo, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useIOTheme } from "../../context";
import { hexToRgba, IOColors } from "../../core/IOColors";
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
    borderRadius: 8,
    borderCurve: "continuous"
  }
});

const SecretValue = () => {
  const theme = useIOTheme();
  return (
    <IOText
      accessible={false}
      color={theme["textHeading-default"]}
      font="FiraCode"
      lineHeight={33}
      size={22}
      weight="Semibold"
    >
      {"•"}
    </IOText>
  );
};

export const BoxedInput = memo(({ status, value, secret }: Props) => {
  const theme = useIOTheme();

  const statusStyle: Record<Props["status"], ViewStyle> = useMemo(
    () => ({
      error: {
        borderWidth: 1,
        borderColor: IOColors[theme["otpInputBorder-error"]],
        backgroundColor: hexToRgba(
          IOColors[theme["otpInputBorder-error"]],
          0.15
        )
      },
      focus: {
        borderWidth: 2,
        borderColor: IOColors[theme["interactiveElem-default"]]
      },
      default: {
        borderWidth: 1,
        borderColor: IOColors[theme["otpInputBorder-default"]]
      }
    }),
    [theme]
  );

  return (
    <View accessible={false} style={styles.boxWrapper}>
      <View style={[styles.baseBox, statusStyle[status]]}>
        {value &&
          (secret ? <SecretValue /> : <H6 accessible={false}>{value}</H6>)}
      </View>
    </View>
  );
});
