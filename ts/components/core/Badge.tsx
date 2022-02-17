import React from "react";
import { StyleSheet } from "react-native";
import { Badge } from "native-base";
import { IOColors } from "./variables/IOColors";
import { H5 } from "./typography/H5";

type BadgeCommonProps = {
  children: string;
};

const commonBadgeStyles = StyleSheet.create({
  badge: {
    paddingLeft: 15,
    paddingRight: 15
  }
});

/**
 * A badge componet styled with the
 * IO primary color.
 */
export const PrimaryBadge: React.FC<BadgeCommonProps> = ({ children }) => (
  <Badge style={[commonBadgeStyles.badge, { backgroundColor: IOColors.blue }]}>
    <H5 color="white">{children}</H5>
  </Badge>
);
