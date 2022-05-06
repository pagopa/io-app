import React from "react";
import { StyleSheet } from "react-native";
import { Badge } from "native-base";
import { IOColors } from "./variables/IOColors";
import { LabelSmall } from "./typography/LabelSmall";
import { BaseTypography } from "./typography/BaseTypography";

type IOBadgeCommonProps = {
  text: string;
  small?: boolean;
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

/**
 * A badge component styled with the
 * IO primary color.
 */
export const IOPrimaryBadge = ({ text, small }: IOBadgeCommonProps) => (
  <Badge
    style={[
      commonBadgeStyles.badge,
      { backgroundColor: IOColors.blue },
      small ? commonBadgeStyles.badgeSmall : {}
    ]}
  >
    <LabelSmall color="white">{text}</LabelSmall>
  </Badge>
);

/**
 * A badge component styled with the
 * IO white color.
 */
export const IOWhiteBadge = ({ text, small }: IOBadgeCommonProps) => (
  <Badge
    style={[
      commonBadgeStyles.badge,
      { backgroundColor: IOColors.white },
      small ? commonBadgeStyles.badgeSmall : {}
    ]}
  >
    {small ? (
      <BaseTypography
        weight={"SemiBold"}
        color={"blue"}
        style={commonBadgeStyles.badgeSmallLabel}
      >
        {text}
      </BaseTypography>
    ) : (
      <LabelSmall color="blue">{text}</LabelSmall>
    )}
  </Badge>
);
