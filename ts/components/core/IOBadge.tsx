import React from "react";
import { StyleSheet } from "react-native";
import { Badge } from "native-base";
import { IOColors } from "./variables/IOColors";
import { LabelSmall } from "./typography/LabelSmall";

type IOBadgeCommonProps = {
  text: string;
};

const commonBadgeStyles = StyleSheet.create({
  badge: {
    paddingLeft: 15,
    paddingRight: 15
  }
});

/**
 * A badge component styled with the
 * IO primary color.
 */
export const IOPrimaryBadge = ({ text }: IOBadgeCommonProps) => (
  <Badge style={[commonBadgeStyles.badge, { backgroundColor: IOColors.blue }]}>
    <LabelSmall color="white">{text}</LabelSmall>
  </Badge>
);
