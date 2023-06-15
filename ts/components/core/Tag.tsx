import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { WithTestID } from "../../types/WithTestID";
import { makeFontStyleObject } from "./fonts";
import { IOColors } from "./variables/IOColors";
import { IOIconSizeScale, IOIcons, Icon } from "./icons";
import { IOTagRadius } from "./variables/IOShapes";
import {
  IOSpacingScale,
  IOTagHSpacing,
  IOTagVSpacing
} from "./variables/IOSpacing";

export type Tag = WithTestID<{
  text: string;
  variant: "qrCode" | "legalMessage" | "info" | "warning" | "error" | "success";
}>;

type VariantProps = {
  iconColor: IOColors;
  iconName: IOIcons;
};

const mapVariants: Record<NonNullable<Tag["variant"]>, VariantProps> = {
  qrCode: {
    iconColor: "blueIO-500",
    iconName: "qrCode"
  },
  legalMessage: {
    iconColor: "blueIO-500",
    iconName: "legalValue"
  },
  info: {
    iconColor: "info-700",
    iconName: "info"
  },
  warning: {
    iconColor: "warning-700",
    iconName: "warningFilled"
  },
  error: {
    iconColor: "error-600",
    iconName: "errorFilled"
  },
  success: {
    iconColor: "success-700",
    iconName: "success"
  }
};

const IOTagIconMargin: IOSpacingScale = 6;
const IOTagIconSize: IOIconSizeScale = 16;

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    }),
    borderWidth: 1,
    backgroundColor: IOColors.white,
    borderColor: IOColors["grey-100"],
    borderRadius: IOTagRadius,
    paddingHorizontal: IOTagHSpacing,
    paddingVertical: IOTagVSpacing
  },
  iconWrapper: {
    marginEnd: IOTagIconMargin,
    flexShrink: 1
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    alignSelf: "center",
    textTransform: "uppercase",
    color: IOColors["grey-700"],
    flexShrink: 1,
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  }
});

/**
 * Tag component, used mainly for message list and details
 */
export const Tag = ({ text, variant, testID }: Tag) => (
  <View testID={testID} style={styles.tag}>
    <View style={styles.iconWrapper}>
      <Icon
        name={mapVariants[variant].iconName}
        color={mapVariants[variant].iconColor}
        size={IOTagIconSize}
      />
    </View>
    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.label}>
      {text}
    </Text>
  </View>
);
