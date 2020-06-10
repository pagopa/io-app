import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../../i18n";
import themeVariables from "../../../theme/variables";
import { formatNumberAmount } from "../../../utils/stringBuilder";

type Props = {
  bonusAmount: number;
  taxBenefit: number;
};

const styles = StyleSheet.create({
  left: {
    flex: 3
  },
  right: {
    flex: 1,
    textAlign: "right",
    alignSelf: "center"
  },
  text: {
    fontSize: themeVariables.fontSizeSmall
  },
  bonus: {
    fontSize: themeVariables.fontSize2
  },
  baseRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowHeader: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  row: {
    paddingLeft:
      themeVariables.contentPadding + themeVariables.contentPadding / 2,
    paddingRight: themeVariables.contentPadding,
    paddingTop: themeVariables.spacerSmallHeight
  }
});

const header = (key: string, value: string) => (
  <View style={[styles.rowHeader, styles.baseRow]}>
    <Text bold={true}>{key}</Text>
    <Text style={styles.bonus} bold={true}>
      {value}
    </Text>
  </View>
);

const row = (key: string, value: string) => (
  <View style={[styles.row, styles.baseRow]}>
    <Text style={[styles.text, styles.left]}>{key}</Text>
    <Text style={[styles.text, styles.right]}>{value}</Text>
  </View>
);

/**
 * This component display a table with the composition details of the bonus.
 * It displays the total bonus amount, the expendable amount and the tax benefit.
 * @param props
 * @constructor
 */
export const BonusCompositionDetails: React.FunctionComponent<
  Props
> = props => {
  const amountTitle = I18n.t("bonus.bonusVacanza.composition.amount");
  const expendableText = I18n.t("bonus.bonusVacanza.composition.expendable");
  const taxBenefitText = I18n.t("bonus.bonusVacanza.composition.taxBenefit");

  const expendableAmount = props.bonusAmount - props.taxBenefit;

  const displayBonusAmount = formatNumberAmount(props.bonusAmount, true);
  const displayExpendableAmount = formatNumberAmount(expendableAmount, true);
  const displayTaxBenefit = formatNumberAmount(props.taxBenefit, true);

  return (
    <View>
      {header(amountTitle, displayBonusAmount)}
      {row(expendableText, displayExpendableAmount)}
      {row(taxBenefitText, displayTaxBenefit)}
    </View>
  );
};
