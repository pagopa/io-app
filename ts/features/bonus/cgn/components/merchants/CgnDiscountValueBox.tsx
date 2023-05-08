import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";

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
