import React, { memo } from "react";
import { Text, StyleSheet, View } from "react-native";
import variables from "../../theme/variables";
import { isTestEnv } from "../../utils/environment";
import { IOColors } from "../../components/core/variables/IOColors";
import { makeFontStyleObject } from "../core/fonts";

type Props = {
  badgeValue?: number;
};

const BADGE_SIZE = 20;

const styles = StyleSheet.create({
  textStyle: {
    color: IOColors.white,
    fontSize: 10,
    textAlign: "center",
    ...makeFontStyleObject("Bold")
  },
  badgeStyle: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: variables.brandPrimary,
    borderColor: IOColors.white,
    borderWidth: 2,
    position: "absolute",
    elevation: 0.1,
    shadowColor: IOColors.white,
    left: 12,
    bottom: 10,
    paddingLeft: 0,
    paddingRight: 0
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
 * A simple round badge to display a positive number
 * Display all numbers less or equal of MAX_BADGE_VALUE
 * otherwise ${MAX_BADGE_VALUE}"+" will be displayed
 *
 * if badgeValue is nullish or negative, null element will be returned
 */
const CustomBadge = (props: Props) => {
  const badgeValue = props.badgeValue ?? 0;
  if (badgeValue <= 0) {
    return null;
  }
  const badge = `${Math.min(badgeValue, MAX_BADGE_VALUE)}${
    badgeValue > MAX_BADGE_VALUE ? "+" : ""
  }`;
  return (
    <View
      testID={"badgeTestID"}
      style={[
        styles.badgeStyle,
        { width: styles.badgeStyle.width * getWidthMultiplier(badge) }
      ]}
    >
      <Text
        style={styles.textStyle}
        accessible={false}
        importantForAccessibility={"no-hide-descendants"}
      >
        {badge}
      </Text>
    </View>
  );
};

export default memo(
  CustomBadge,
  (prev, next) => prev.badgeValue === next.badgeValue
);

// to ensure right code encapsulation we export functions/variables just for tests purposes
export const customBadgeTestable = isTestEnv
  ? { getWidthMultiplier, styles }
  : undefined;
