import { WithinRangeInteger } from "italia-ts-commons/lib/numbers";
import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { H3 } from "../../../../../components/core/typography/H3";

type ValueBoxProps = {
  value: number;
  small?: true;
};

const styles = StyleSheet.create({
  percentage: { textAlign: "center", lineHeight: 30 },
  smallValueBox: {
    borderRadius: 6.5,
    paddingVertical: 5,
    width: 40,
    textAlign: "center",
    backgroundColor: "#9B5897"
  },
  discountValueBox: {
    borderRadius: 6.5,
    paddingVertical: 8,
    width: 48,
    marginLeft: "auto",
    height: 48,
    backgroundColor: "#9B5897"
  }
});

const PERCENTAGE_SYMBOL = "%";
const MINUS_SYMBOL = "-";

const CgnDiscountValueBox = ({ value, small }: ValueBoxProps) => {
  const normalizedValue = WithinRangeInteger(0, 100)
    .decode(value)
    .map(v => v.toString())
    .getOrElse("-");
  const percentage = (
    <H5 weight={"SemiBold"} color={"white"}>
      {PERCENTAGE_SYMBOL}
    </H5>
  );
  return (
    <View style={small ? styles.smallValueBox : styles.discountValueBox}>
      {small ? (
        <H4 weight={"Bold"} color={"white"} style={styles.percentage}>
          {MINUS_SYMBOL}
          {normalizedValue}
          {percentage}
        </H4>
      ) : (
        <H3 weight={"Bold"} color={"white"} style={styles.percentage}>
          {MINUS_SYMBOL}
          {normalizedValue}
          {percentage}
        </H3>
      )}
    </View>
  );
};

export default CgnDiscountValueBox;
