import { useEffect, useState } from "react";
import { ColorValue, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions, withAlpha } from "../../core";
import { triggerHaptic } from "../../functions";
import { useErrorShakeAnimation } from "../../utils/hooks/useErrorShakeAnimation";
import { HStack } from "../layout";

export type CodeInputStatus = "default" | "error";

type CodeInputProps = {
  length: number;
  onValidate: (value: string) => boolean;
  onValueChange: (value: string) => void;
  value: string;
  variant?: "contrast" | "neutral";
};

const styles = StyleSheet.create({
  dotShape: {
    width: IODimensions.size.codeInput.dot,
    height: IODimensions.size.codeInput.dot,
    borderRadius: IODimensions.size.codeInput.dot / 2,
    borderWidth: IODimensions.stroke.codeInput.dot
  }
});

const EmptyDot = ({ color: borderColor }: { color: ColorValue }) => (
  <View
    style={[
      styles.dotShape,
      {
        borderColor,
        backgroundColor: withAlpha(borderColor, 0)
      }
    ]}
  />
);

const FilledDot = ({ color: backgroundColor }: { color: ColorValue }) => (
  <View
    style={[styles.dotShape, { backgroundColor, borderColor: backgroundColor }]}
  />
);

export const CodeInput = ({
  length,
  value,
  onValueChange,
  variant = "contrast",
  onValidate
}: CodeInputProps) => {
  const [status, setStatus] = useState<CodeInputStatus>("default");
  const codeInputColors = useIOColors().component.codeInput[variant];

  const { translate, animatedStyle, shakeAnimation } = useErrorShakeAnimation();

  const emptyDotColor = codeInputColors.border;
  const filledDotColor = codeInputColors.foreground[status];

  useEffect(() => {
    if (value.length === length) {
      const isValid = onValidate(value);

      if (!isValid) {
        setStatus("error");
        triggerHaptic("notificationError");

        translate.value = shakeAnimation();

        const timer = setTimeout(() => {
          setStatus("default");
          onValueChange("");
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    return;
  }, [value, onValidate, length, onValueChange, translate, shakeAnimation]);

  return (
    <Animated.View
      style={[
        { flexDirection: "row", justifyContent: "center" },
        animatedStyle
      ]}
    >
      <HStack space={IODimensions.gap.codeInput.items}>
        {[...Array(length)].map((_, i) =>
          value[i] ? (
            <FilledDot color={filledDotColor} key={i} />
          ) : (
            <EmptyDot color={emptyDotColor} key={i} />
          )
        )}
      </HStack>
    </Animated.View>
  );
};
