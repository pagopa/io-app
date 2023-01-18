import React from "react";
import { View, StyleProp, StyleSheet, TextStyle } from "react-native";
import I18n from "../../../../../i18n";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { Body } from "../../../../../components/core/typography/Body";
import { H2 } from "../../../../../components/core/typography/H2";
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
  }
});

/**
 * The header for this representation, display a title with the amount of the bonus
 * @param key
 * @param value
 */
const header = (key: string, value: string) => (
  <View style={keyValueTableStyle.baseRow} accessible={true}>
    <Body weight={"SemiBold"}>{key}</Body>
    <H2 weight={"SemiBold"}>{value}</H2>
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
export const BonusCompositionDetails: React.FunctionComponent<Props> =
  props => {
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
