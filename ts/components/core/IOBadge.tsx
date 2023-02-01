import React from "react";
import { View, Text, StyleSheet, PixelRatio } from "react-native";
import { makeFontStyleObject } from "./fonts";
import { IOColors, IOColorType } from "./variables/IOColors";

export type IOBadgeOutlineColors = Extract<
  IOColorType,
  "blue" | "white" | "red" | "orange"
>;
export type IOBadgeSolidColors = Extract<
  IOColorType,
  "blue" | "white" | "grey" | "aqua"
>;

type IOBadgeCommonProps = {
  text: string;
  small?: boolean;
  testID?: string;
  labelTestID?: string;
};

type IOBadgeConditionalProps =
  | {
      variant?: "solid";
      color?: IOBadgeSolidColors;
    }
  | {
      variant?: "outline";
      color?: IOBadgeOutlineColors;
    };

export type IOBadgeProps = IOBadgeCommonProps & IOBadgeConditionalProps;

type SolidVariantProps = {
  background: IOColorType;
  text: IOColorType;
};

const mapOutlineColor: Record<
  NonNullable<IOBadgeOutlineColors>,
  IOColorType
> = {
  blue: "blue",
  white: "white",
  red: "red",
  orange: "orange"
};

const mapSolidColor: Record<
  NonNullable<IOBadgeSolidColors>,
  SolidVariantProps
> = {
  blue: {
    background: "blue",
    text: "white"
  },
  white: {
    background: "white",
    text: "bluegrey"
  },
  aqua: {
    background: "aqua",
    text: "bluegreyDark"
  },
  grey: {
    background: "grey",
    text: "white"
  }
};

const defaultVariant: IOBadgeProps["variant"] = "solid";
const defaultColor: IOBadgeProps["color"] = "blue";

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    textAlignVertical: "center", // Android
    justifyContent: "center",
    // Visual parameters based on the FontScale
    // ~20 = Small size height
    // ~24 = Default size height
    paddingVertical: PixelRatio.getFontScale() * 1.25,
    paddingHorizontal: PixelRatio.getFontScale() * 10,
    borderRadius: PixelRatio.getFontScale() * 25
  },
  label: {
    alignSelf: "center",
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  },
  labelSizeDefault: {
    fontSize: 14,
    lineHeight: 20
  },
  labelSizeSmall: {
    fontSize: 11,
    lineHeight: 16
  }
});

/**
 * Official badge component
 */
export const IOBadge = ({
  text,
  variant = defaultVariant,
  color = defaultColor,
  small,
  testID,
  labelTestID
}: IOBadgeProps) => (
  <View
    testID={testID}
    style={[
      styles.badge,
      variant === "outline" && {
        borderColor: IOColors[mapOutlineColor[color as IOBadgeOutlineColors]],
        borderWidth: 1
      },
      variant === "solid" && {
        backgroundColor:
          IOColors[mapSolidColor[color as IOBadgeSolidColors]?.background]
      }
    ]}
  >
    {/* TODO: Enable bolder text using `isBoldTextEnabled` RN API
    (not yet released at the time I am writing this comment. */}
    <Text
      // allowFontScaling
      // maxFontSizeMultiplier={1.5}
      testID={labelTestID}
      style={[
        styles.label,
        small ? styles.labelSizeSmall : styles.labelSizeDefault,
        variant === "outline" && {
          color: IOColors[mapOutlineColor[color as IOBadgeOutlineColors]]
        },
        variant === "solid" && {
          color: IOColors[mapSolidColor[color as IOBadgeSolidColors]?.text]
        }
      ]}
    >
      {text}
    </Text>
  </View>
);
