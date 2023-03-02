import { Badge } from "native-base";
import React from "react";
import { ColorValue, StyleSheet } from "react-native";
import { LabelSmall } from "./typography/LabelSmall";
import { IOColors } from "./variables/IOColors";

type IOBadgeCommonProps = {
  text: string;
  small?: boolean;
  labelColor?: Extract<IOColors, "bluegreyDark" | "blue" | "white" | "red">;
};

const commonBadgeStyles = StyleSheet.create({
  badge: {
    paddingLeft: 8,
    paddingRight: 8
  },
  badgeSmall: {
    height: 18
  }
});

const mapForegroundBackgroundColor: Record<
  NonNullable<IOBadgeCommonProps["labelColor"]>,
  ColorValue
> = {
  white: IOColors.blue,
  blue: IOColors.white,
  bluegreyDark: IOColors.aqua,
  red: IOColors.white
};

const mapForegroundBorderColor: Record<
  NonNullable<IOBadgeCommonProps["labelColor"]>,
  ColorValue | null
> = {
  white: null,
  blue: IOColors.blue,
  bluegreyDark: null,
  red: IOColors.red
};

const borderStyle = (color: NonNullable<IOBadgeCommonProps["labelColor"]>) => {
  const borderColor = mapForegroundBorderColor[color];
  if (borderColor === null) {
    return null;
  } else {
    return {
      borderColor,
      borderWidth: 1
    };
  }
};

/**
 * A badge component styled with the
 * IO primary color.
 */
export const IOBadge = ({ text, small, labelColor }: IOBadgeCommonProps) => {
  const lColor = labelColor ?? "white";

  return (
    <Badge
      style={[
        commonBadgeStyles.badge,
        {
          backgroundColor: lColor
            ? mapForegroundBackgroundColor[lColor]
            : IOColors.blue
        },
        borderStyle(lColor ?? "white"),
        small ? commonBadgeStyles.badgeSmall : {}
      ]}
    >
      <LabelSmall
        color={lColor}
        fontSize={small ? "small" : "regular"}
        weight={"SemiBold"}
      >
        {text}
      </LabelSmall>
    </Badge>
  );
};
