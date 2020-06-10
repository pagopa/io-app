import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
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
  text: {
    fontSize: themeVariables.fontSizeSmall
  },
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
  <View style={[keyValueTableStyle.baseRow, keyValueTableStyle.header]}>
    <Text style={styles.bold}>{key}</Text>
    <Text style={[styles.bonusAmount, styles.bold]}>{value}</Text>
  </View>
);

/**
 * Transform a generic couple of string in a {@link KeyValueRow} used to be rendered inside a KeyValueTable.
 * @param k
 * @param v
 */
const getRow = (k: string, v: string) =>
  ({
    key: {
      text: k,
      style: styles.text
    },
    value: {
      text: v,
      style: styles.text
    }
  } as KeyValueRow);

/**
 * This component display a table with the composition details of the bonus.
 * It displays the total bonus amount, the expendable amount and the tax benefit.
 * The base component {@link KeyValueTable} is used, in order to have a common layout settings.
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

  const rows: ReadonlyArray<KeyValueRow> = [
    getRow(expendableText, displayExpendableAmount),
    getRow(taxBenefitText, displayTaxBenefit)
  ];

  return (
    <View>
      {header(amountTitle, displayBonusAmount)}
      <KeyValueTable leftFlex={3} rightFlex={1} rows={rows} />
    </View>
  );
};
