import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { WithTestID } from "../../types/WithTestID";
import { makeFontStyleObject } from "./fonts";
import { IOColors } from "./variables/IOColors";
import { IOBadgeRadius } from "./variables/IOShapes";
import { IOBadgeHSpacing, IOBadgeVSpacing } from "./variables/IOSpacing";

export type Badge = WithTestID<{
  text: string;
  variant:
    | "default"
    | "info"
    | "warning"
    | "error"
    | "success"
    | "purple"
    | "lightBlue"
    | "blue"
    | "turquoise"
    | "contrast";
}>;

type VariantProps = {
  foreground: IOColors;
  background: IOColors;
};

const mapVariants: Record<NonNullable<Badge["variant"]>, VariantProps> = {
  default: {
    foreground: "grey-700",
    background: "grey-50"
  },
  info: {
    foreground: "info-850",
    background: "info-100"
  },
  warning: {
    foreground: "warning-850",
    background: "warning-100"
  },
  success: {
    foreground: "success-850",
    background: "success-100"
  },
  error: {
    foreground: "error-850",
    background: "error-100"
  },
  purple: {
    foreground: "hanPurple-850",
    background: "hanPurple-100"
  },
  lightBlue: {
    foreground: "blueIO-850",
    background: "blueIO-50"
  },
  blue: {
    foreground: "white",
    background: "blueIO-500"
  },
  turquoise: {
    foreground: "turquoise-850",
    background: "turquoise-50"
  },
  contrast: {
    foreground: "grey-700",
    background: "white"
  }
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    }),
    borderRadius: IOBadgeRadius,
    paddingHorizontal: IOBadgeHSpacing,
    paddingVertical: IOBadgeVSpacing
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    alignSelf: "center",
    textTransform: "uppercase",
    flexShrink: 1,
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  }
});

/**
 * Official badge component
 */
export const Badge = ({ text, variant, testID }: Badge) => (
  <View
    testID={testID}
    style={[
      styles.badge,
      { backgroundColor: IOColors[mapVariants[variant].background] }
    ]}
  >
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[
        styles.label,
        { color: IOColors[mapVariants[variant].foreground] }
      ]}
    >
      {text}
    </Text>
  </View>
);
