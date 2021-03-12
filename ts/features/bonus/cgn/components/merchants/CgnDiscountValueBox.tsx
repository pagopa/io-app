import { WithinRangeInteger } from "italia-ts-commons/lib/numbers";
import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { H3 } from "../../../../../components/core/typography/H3";

type ValueBoxProps = {
  value: number;
  small?: boolean;
};

const styles = StyleSheet.create({
  percentage: { textAlign: "center", lineHeight: 30 },
  smallValueBox: {
    borderRadius: 6.5,
    paddingVertical: 5,
    width: 40,
    textAlign: "center",
    backgroundColor: "#EB9505"
  },
  discountValueBox: {
    borderRadius: 6.5,
    paddingVertical: 8,
    width: 48,
    marginLeft: "auto",
    height: 48,
    backgroundColor: "#EB9505"
  }
});

const PERCENTAGE_SYMBOL = "%";

const CgnDiscountValueBox = ({ value, small }: ValueBoxProps) => {
  const normalizedValue = WithinRangeInteger(0, 100)
    .decode(value)
    .map(v => v.toString())
    .getOrElse("-");

  return (
    <View style={small ? styles.smallValueBox : styles.discountValueBox}>
      {small ? (
        <H4 weight={"Bold"} color={"white"} style={styles.percentage}>
          {normalizedValue}
          <H5 weight={"SemiBold"} color={"white"}>
            {PERCENTAGE_SYMBOL}
          </H5>
        </H4>
      ) : (
        <H3 weight={"Bold"} color={"white"} style={styles.percentage}>
          {/* avoid overflow */}
          {normalizedValue}
          <H5 weight={"SemiBold"} color={"white"}>
            {PERCENTAGE_SYMBOL}
          </H5>
        </H3>
      )}
    </View>
  );
};

export default CgnDiscountValueBox;
