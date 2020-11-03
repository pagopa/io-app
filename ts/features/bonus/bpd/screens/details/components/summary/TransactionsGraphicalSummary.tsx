import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { H2 } from "../../../../../../../components/core/typography/H2";
import { H5 } from "../../../../../../../components/core/typography/H5";
import I18n from "../../../../../../../i18n";
import { BpdBaseShadowBoxLayout } from "./BpdBaseShadowBoxLayout";
import { ProgressBar } from "./ProgressBar";

type Props = {
  transactions: number;
  minTransactions: number;
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center"
  }
});

const loadLocales = () => ({
  title: I18n.t("bonus.bpd.details.components.transactionsCountOverview.title"),
  of: I18n.t("bonus.bpd.details.components.transactionsCountOverview.of")
});

/**
 * When transactions < minTransactions, display a progress bar with the related information
 * @param props
 */
const PercentageTransactionsSummary = (props: Props) => {
  const { title, of } = loadLocales();
  return (
    <BpdBaseShadowBoxLayout
      row1={<H5 style={styles.title}>{title}</H5>}
      row2={
        <H2 style={styles.title}>
          <H2 color={"blue"}>{props.transactions}</H2> {of}{" "}
          {props.minTransactions}
        </H2>
      }
      row3={
        <>
          <View spacer={true} />
          <ProgressBar
            progressPercentage={props.transactions / props.minTransactions}
          />
        </>
      }
    />
  );
};

/**
 * When transactions >= minTransactions, display only a textual summary
 * @param props
 * @constructor
 */
const TextualTransactionsSummary = (props: Props) => {
  const { title, of } = loadLocales();
  return (
    <BpdBaseShadowBoxLayout
      row1={<H5 style={styles.title}>{title}</H5>}
      row2={
        <H2 color={"blue"} style={styles.title}>
          {props.transactions}
        </H2>
      }
      row3={
        <H5 color={"bluegrey"} style={styles.title}>
          {of} {props.minTransactions}
        </H5>
      }
    />
  );
};

/**
 * Displays to the user a summary of the transactions and how many are missing
 * to reach the minimum necessary to receive the cashback.
 * @param props
 * @constructor
 */
export const TransactionsGraphicalSummary: React.FunctionComponent<Props> = props =>
  props.transactions < props.minTransactions ? (
    <PercentageTransactionsSummary {...props} />
  ) : (
    <TextualTransactionsSummary {...props} />
  );
