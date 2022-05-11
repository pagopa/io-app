import React from "react";
import { ColorValue, StyleSheet } from "react-native";
import { Badge } from "native-base";
import { IOColors } from "./variables/IOColors";
import { LabelSmall } from "./typography/LabelSmall";

type IOBadgeCommonProps = {
  text: string;
  small?: boolean;
  labelColor?: "white" | "blue";
};

const commonBadgeStyles = StyleSheet.create({
  badge: {
    paddingLeft: 15,
    paddingRight: 15
  },
  badgeSmall: {
    height: 18
  },
  badgeSmallLabel: { fontSize: 12, lineHeight: 18 }
});

const mapForegroundBackgroundColor: Record<
  NonNullable<IOBadgeCommonProps["labelColor"]>,
  ColorValue
> = { white: IOColors.blue, blue: IOColors.white };

/**
 * A badge component styled with the
 * IO primary color.
 */
export const IOBadge = ({ text, small, labelColor }: IOBadgeCommonProps) => (
  <Badge
    style={[
      commonBadgeStyles.badge,
      {
        backgroundColor: labelColor
          ? mapForegroundBackgroundColor[labelColor]
          : IOColors.blue
      },
      small ? commonBadgeStyles.badgeSmall : {}
    ]}
  >
    <LabelSmall
      color={labelColor ?? "white"}
      fontSize={small ? "small" : "regular"}
    >
      {text}
    </LabelSmall>
  </Badge>
);
