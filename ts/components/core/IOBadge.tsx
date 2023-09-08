import React from "react";
import { View, Text, StyleSheet, PixelRatio, Platform } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { makeFontStyleObject } from "./fonts";

export type IOBadgeOutlineColors = Extract<
  IOColors,
  "blue" | "white" | "grey" | "red" | "orange"
>;
export type IOBadgeSolidColors = Extract<
  IOColors,
  "blue" | "white" | "grey" | "aqua" | "red"
>;

type IOBadgeCommonProps = {
  text: string;
  small?: boolean;
  labelColor?: Extract<IOColors, "bluegreyDark" | "blue" | "white" | "red">;
  testID?: string;
  labelTestID?: string;
};

type IOBadgeConditionalProps =
  | {
      variant: "solid";
      color: IOBadgeSolidColors;
    }
  | {
      variant: "outline";
      color: IOBadgeOutlineColors;
    };

export type IOBadge = IOBadgeCommonProps & IOBadgeConditionalProps;

type SolidVariantProps = {
  background: IOColors;
  text: IOColors;
};

const mapOutlineColor: Record<NonNullable<IOBadgeOutlineColors>, IOColors> = {
  blue: "blue",
  white: "white",
  grey: "bluegreyDark",
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
  },
  red: {
    background: "red",
    text: "white"
  }
};

const defaultVariant: IOBadge["variant"] = "solid";
const defaultColor: IOBadge["color"] = "blue";

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    }),
    // Visual parameters based on the FontScale
    // ~20 = Small size height
    // ~24 = Default size height
    paddingVertical: PixelRatio.getFontScale() * 1.25,
    paddingHorizontal: PixelRatio.getFontScale() * 10,
    borderRadius: PixelRatio.getFontScale() * 25
  },
  label: {
    alignSelf: "center",
    ...makeFontStyleObject("SemiBold")
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
@deprecated("Use the new Badge component instead")
 */
export const IOBadge = ({
  text,
  variant = defaultVariant,
  color = defaultColor,
  small,
  testID,
  labelTestID
}: IOBadge) => (
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
    (not yet released at the time I am writing this comment). */}
    <Text
      // Disable temporarily the following props
      // to avoid layout breaking changes
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
