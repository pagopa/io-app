import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { makeFontStyleObject } from "./fonts";
import { IOColors, IOColorType } from "./variables/IOColors";

type IOBadgeOutlineColors = Extract<IOColorType, "blue" | "white" | "red">;
type IOBadgeSolidColors = Extract<
  IOColorType,
  "blue" | "white" | "grey" | "aqua"
>;

type IOBadgeCommonProps = {
  text: string;
  small?: boolean;
  testID?: string;
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

/*
  Before: <IOBadge text={"Badge"} small={true} labelColor={"white"} />
  After: <IOBadge text={"Badge"} variant="solid" color="blue" small />

  Before: <IOBadge text={"Badge"} small={true} labelColor={"bluegreyDark"} />
  After: <IOBadge text={"Badge"} variant="solid" color="aqua" small />

  Before: <IOBadge text={"Badge"} small={true} labelColor={"blue"} />
  After: <IOBadge text={"Badge"} variant="outline" color="blue" small />

  Before: <IOBadge text={"Badge"} small={true} labelColor={"red"} />
  After: <IOBadge text={"Badge"} variant="outline" color="red" small />

  NEW!
  <IOBadge text={"Badge"} variant="solid" color="white" small />
  --> LabelColor: bluegrey
  <IOBadge text={"Badge"} variant="outline" color="white" small />
  --> LabelColor: white

*/

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
  red: "red"
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

const BADGE_SMALL_SIZE = 20;
const BADGE_DEFAULT_SIZE = 24;

const defaultVariant: IOBadgeProps["variant"] = "solid";
const defaultColor: IOBadgeProps["color"] = "blue";

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    textAlignVertical: "center", // Android
    justifyContent: "center",
    elevation: 0.1
  },
  badgeSizeDefault: {
    // paddingHorizontal are different between sizes
    // to keep space uniform
    paddingHorizontal: 10,
    height: BADGE_DEFAULT_SIZE,
    borderRadius: BADGE_DEFAULT_SIZE / 2
  },
  badgeSizeSmall: {
    paddingHorizontal: 8,
    height: BADGE_SMALL_SIZE,
    borderRadius: BADGE_SMALL_SIZE / 2
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
 * A badge component styled with the
 * IO primary color.
 */
export const IOBadge = ({
  text,
  variant = defaultVariant,
  color = defaultColor,
  small,
  testID
}: IOBadgeProps) => (
  <View
    testID={testID}
    style={[
      styles.badge,
      small ? styles.badgeSizeSmall : styles.badgeSizeDefault,
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
    <Text
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
