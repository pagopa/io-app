import { H6, IOColors } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { normalizedDiscountPercentage } from "./utils";

type ValueBoxProps = {
  value: number;
  small?: true;
};

const BADGE_SIZE_SMALL = 40;
const BADGE_SIZE_DEFAULT = 48;

const styles = StyleSheet.create({
  percentage: { textAlign: "center", lineHeight: 30 },
  smallValueBox: {
    alignSelf: "center",
    borderRadius: BADGE_SIZE_SMALL / 4,
    paddingVertical: 4,
    width: BADGE_SIZE_SMALL,
    textAlign: "center",
    backgroundColor: IOColors.antiqueFuchsia
  },
  discountValueBox: {
    alignSelf: "center",
    borderRadius: BADGE_SIZE_DEFAULT / 4,
    paddingVertical: 8,
    width: BADGE_SIZE_DEFAULT,
    backgroundColor: IOColors.antiqueFuchsia
  }
});

const PERCENTAGE_SYMBOL = "%";
const MINUS_SYMBOL = "-";

const CgnDiscountValueBox = ({ value, small }: ValueBoxProps) => {
  const percentage = <H6 color={"white"}>{PERCENTAGE_SYMBOL}</H6>;
  return (
    <View style={small ? styles.smallValueBox : styles.discountValueBox}>
      <H6 color={"white"} style={styles.percentage}>
        {MINUS_SYMBOL}
        {normalizedDiscountPercentage(value)}
        {percentage}
      </H6>
    </View>
  );
};

export default CgnDiscountValueBox;
