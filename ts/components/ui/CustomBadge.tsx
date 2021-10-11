import { Badge, Text } from "native-base";
import React, { memo } from "react";
import { StyleSheet } from "react-native";
import variables from "../../theme/variables";

type Props = {
  badgeValue?: number;
};

const styles = StyleSheet.create({
  textStyle: {
    paddingLeft: 0,
    paddingRight: 0
  },
  badgeStyle: {
    backgroundColor: variables.brandPrimary,
    borderColor: "white",
    borderWidth: 2,
    position: "absolute",
    elevation: 0.1,
    shadowColor: "white",
    width: 20,
    height: 20,
    left: 12,
    bottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
    alignContent: "center"
  }
});

const MAX_BADGE_VALUE = 99;
const multiplierFallback = 1.4;
// map the digits to display within the badge with the relative width multiplier factor
// (the badge displays value below MAX_BADGE_VALUE)
const multiplierMap: Record<number, number> = {
  1: 1,
  2: 1.2
};
// get the width multiplier relative to the count of digits to display
const getWidthMultiplier = (text: string): number => {
  const digits = text.length;
  return multiplierMap[digits] ?? multiplierFallback;
};

/**
 * A simple badge used for show the number of messages to read
 *
 */
const CustomBadge = (props: Props) => {
  const badgeValue = props.badgeValue ?? 0;
  if (badgeValue === 0) {
    return null;
  }
  const badge = `${Math.min(badgeValue, MAX_BADGE_VALUE)}${
    badgeValue > MAX_BADGE_VALUE ? "+" : ""
  }`;
  return (
    <Badge
      style={[
        styles.badgeStyle,
        { width: styles.badgeStyle.width * getWidthMultiplier(badge) }
      ]}
    >
      <Text
        badge={true}
        style={styles.textStyle}
        accessible={false}
        importantForAccessibility={"no-hide-descendants"}
      >
        {badge}
      </Text>
    </Badge>
  );
};

export default memo(
  CustomBadge,
  (prev, next) => prev.badgeValue === next.badgeValue
);
