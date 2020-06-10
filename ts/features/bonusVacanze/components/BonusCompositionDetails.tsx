import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../../i18n";
import themeVariables from "../../../theme/variables";
import { formatNumberAmount } from "../../../utils/stringBuilder";

type Props = {
  bonusAmount: number;
  taxBenefit: number;
  textColor?: string;
};

const styles = StyleSheet.create({
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

type TextColor = {
  color?: string;
};

const header = (key: string, value: string, textColor: TextColor) => (
  <View style={[styles.rowHeader, styles.baseRow]}>
    <Text style={textColor} bold={true}>
      {key}
    </Text>
    <Text style={[styles.bonus, textColor]} bold={true}>
      {value}
    </Text>
  </View>
);

const row = (key: string, value: string, textColor: TextColor) => (
  <View style={[styles.row, styles.baseRow]}>
    <Text style={[styles.text, textColor]}>{key}</Text>
    <Text style={[styles.text, textColor]}>{value}</Text>
  </View>
);

/**
 * This component display a table with the composition details of the bonus
 * @param props
 * @constructor
 */
export const BonusCompositionDetails: React.FunctionComponent<
  Props
> = props => {
  const textColor = props.textColor ? { color: props.textColor } : {};

  const amountTitle = I18n.t("bonus.bonusVacanza.composition.amount");
  const expendableText = I18n.t("bonus.bonusVacanza.composition.expendable");
  const taxBenefitText = I18n.t("bonus.bonusVacanza.composition.taxBenefit");

  const expendableAmount = props.bonusAmount - props.taxBenefit;

  const displayBonusAmount = formatNumberAmount(props.bonusAmount, true);
  const displayExpendableAmount = formatNumberAmount(expendableAmount, true);
  const displayTaxBenefit = formatNumberAmount(props.taxBenefit, true);

  return (
    <View>
      {header(amountTitle, displayBonusAmount, textColor)}
      {row(expendableText, displayExpendableAmount, textColor)}
      {row(taxBenefitText, displayTaxBenefit, textColor)}
    </View>
  );
};
