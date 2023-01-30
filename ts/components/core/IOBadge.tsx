import React from "react";
import { View, Text, ColorValue, StyleSheet } from "react-native";
import { makeFontStyleObject } from "./fonts";
import { IOColors, IOColorType } from "./variables/IOColors";

type IOBadgeOutlineColors = Extract<IOColorType, "blue" | "white" | "red">;
type IOBadgeSolidColors = Extract<IOColorType, "blue" | "white" | "aqua">;
type AllowedBadgeColors = IOBadgeOutlineColors | IOBadgeSolidColors;

export type IOBadgeProps = {
  text: string;
  small?: boolean;
  variant?: "solid" | "outline";
  color?: AllowedBadgeColors;
  testID?: string;
};

type SolidVariantProps = {
  background: ColorValue;
  text: ColorValue;
};

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

const mapOutlineColor: Record<NonNullable<IOBadgeOutlineColors>, ColorValue> = {
  blue: IOColors.blue,
  white: IOColors.white,
  red: IOColors.red
};

const mapSolidColor: Record<
  NonNullable<IOBadgeSolidColors>,
  SolidVariantProps
> = {
  blue: {
    background: IOColors.blue,
    text: IOColors.white
  },
  white: {
    background: IOColors.white,
    text: IOColors.bluegrey
  },
  aqua: {
    background: IOColors.aqua,
    text: IOColors.bluegreyDark
  }
};

const BADGE_SMALL_SIZE = 20;
const BADGE_DEFAULT_SIZE = 27;

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
        borderColor: mapOutlineColor[color as IOBadgeOutlineColors],
        borderWidth: 1
      },
      variant === "solid" && {
        backgroundColor: mapSolidColor[color as IOBadgeSolidColors]?.background
      }
    ]}
  >
    <Text
      style={[
        styles.label,
        small ? styles.labelSizeSmall : styles.labelSizeDefault,
        variant === "outline" && {
          color: mapOutlineColor[color as IOBadgeOutlineColors]
        },
        variant === "solid" && {
          color: mapSolidColor[color as IOBadgeSolidColors]?.text
        }
      ]}
    >
      {text}
    </Text>
  </View>
);
