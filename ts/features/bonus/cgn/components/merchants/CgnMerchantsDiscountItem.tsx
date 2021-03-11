import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { WithinRangeInteger } from "italia-ts-commons/lib/numbers";
import IconFont from "../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { H5 } from "../../../../../components/core/typography/H5";
import { H4 } from "../../../../../components/core/typography/H4";
import { ShadowBox } from "../../../bpd/screens/details/components/summary/base/ShadowBox";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";

type Props = {
  category: string;
  description: string;
  value: string;
};

const PERCENTAGE_SYMBOL = "%";

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", alignItems: "center" },
  row: {
    flexDirection: "row"
  },
  verticalPadding: {
    flex: 1,
    paddingVertical: 16
  },
  discountValueBox: {
    borderRadius: 6.5,
    paddingVertical: 8,
    width: 48,
    marginLeft: "auto",
    height: 48,
    backgroundColor: "#EB9505"
  },
  percentage: { textAlign: "center", lineHeight: 30 }
});

const CgnMerchantDiscountItem: React.FunctionComponent<Props> = (
  props: Props
) => (
  <View style={styles.verticalPadding}>
    <ShadowBox>
      <View style={[styles.row, styles.container]}>
        <View style={IOStyles.flex}>
          <View style={styles.row}>
            {/* TODO when available and defined the icon name should be defined through a map of category codes */}
            <IconFont name={"io-theater"} size={22} color={IOColors.bluegrey} />
            <View hspacer small />
            <View style={IOStyles.flex}>
              <H5 weight={"SemiBold"} color={"bluegrey"}>
                {props.category.toLocaleUpperCase()}
              </H5>
              <View spacer xsmall />
              <H4 weight={"SemiBold"} color={"bluegreyDark"}>
                {props.description}
              </H4>
            </View>
            <View style={styles.discountValueBox}>
              <H3 weight={"Bold"} color={"white"} style={styles.percentage}>
                {/* avoid overflow */}
                {WithinRangeInteger(0, 100)
                  .decode(parseInt(props.value, 10))
                  .map(v => v.toString())
                  .getOrElse("-")}
                <H5 weight={"SemiBold"} color={"white"}>
                  {PERCENTAGE_SYMBOL}
                </H5>
              </H3>
            </View>
          </View>
        </View>
      </View>
    </ShadowBox>
  </View>
);

export default CgnMerchantDiscountItem;
