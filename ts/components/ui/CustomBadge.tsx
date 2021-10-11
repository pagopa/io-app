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
// get the width multiplier relative to the count of digits to display
const getWidthMultiplier = (text: string) => {
  const digits = text.length;
  if (digits <= 1) {
    return 1;
  }
  if (digits <= 2) {
    return 1.1;
  }
  // more than 2 digits
  return 1.4;
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
