import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H6, IOColors } from "@pagopa/io-app-design-system";

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
  const normalizedValue = pipe(
    WithinRangeInteger(0, 100).decode(value),
    E.map(v => v.toString()),
    E.getOrElse(() => "-")
  );
  const percentage = <H6 color={"white"}>{PERCENTAGE_SYMBOL}</H6>;
  return (
    <View style={small ? styles.smallValueBox : styles.discountValueBox}>
      <H6 color={"white"} style={styles.percentage}>
        {MINUS_SYMBOL}
        {normalizedValue}
        {percentage}
      </H6>
    </View>
  );
};

export default CgnDiscountValueBox;
