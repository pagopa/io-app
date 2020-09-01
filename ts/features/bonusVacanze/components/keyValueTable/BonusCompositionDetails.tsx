import { View } from "native-base";
import React from "react";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import H5 from "../../../../components/ui/H5";
import H6 from "../../../../components/ui/H6";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import {
  KeyValueRow,
  KeyValueTable,
  keyValueTableStyle
} from "./KeyValueTable";

type Props = {
  bonusAmount: number;
  taxBenefit: number;
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: "bold"
  },
  bonusAmount: {
    fontSize: themeVariables.fontSize2
  }
});

/**
 * The header for this representation, display a title with the amount of the bonus
 * @param key
 * @param value
 */
const header = (key: string, value: string) => (
  <View style={keyValueTableStyle.baseRow} accessible={true}>
    <H6>{key}</H6>
    <H5>{value}</H5>
  </View>
);

/**
 * Transform a generic couple of string in a {@link KeyValueRow} used to be rendered inside a KeyValueTable.
 * @param keyText
 * @param valueText
 * @param keyStyle
 * @param valueStyle
 */
const getRow = (
  keyText: string,
  valueText: string,
  keyStyle?: StyleProp<TextStyle>,
  valueStyle?: StyleProp<TextStyle>
) =>
  ({
    key: {
      text: keyText,
      style: keyStyle
    },
    value: {
      text: valueText,
      style: valueStyle
    }
  } as KeyValueRow);

/**
 * This component display a table with the composition details of the bonus.
 * It displays the total bonus amount, the expendable amount and the tax benefit.
 * The base component {@link KeyValueTable} is used, in order to have a common layout settings.
 * @param props
 * @constructor
 */
export const BonusCompositionDetails: React.FunctionComponent<Props> = props => {
  const amountTitle = I18n.t("bonus.bonusVacanze.composition.amount");
  const expendableText = I18n.t("bonus.bonusVacanze.composition.expendable");
  const taxBenefitText = I18n.t("bonus.bonusVacanze.composition.taxBenefit");

  const expendableAmount = props.bonusAmount - props.taxBenefit;

  const displayBonusAmount = formatNumberAmount(props.bonusAmount, true);
  const displayExpendableAmount = formatNumberAmount(expendableAmount, true);
  const displayTaxBenefit = formatNumberAmount(props.taxBenefit, true);

  const rows: ReadonlyArray<KeyValueRow> = [
    getRow(expendableText, displayExpendableAmount, undefined, styles.bold),
    getRow(taxBenefitText, displayTaxBenefit)
  ];

  return (
    <View>
      {header(amountTitle, displayBonusAmount)}
      <KeyValueTable leftFlex={3} rightFlex={1} rows={rows} />
    </View>
  );
};
