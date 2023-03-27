import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "../../../../../../../components/core/spacer/Spacer";
import { H2 } from "../../../../../../../components/core/typography/H2";
import { H5 } from "../../../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { Dispatch } from "../../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { formatIntegerNumber } from "../../../../../../../utils/stringBuilder";
import { navigateToBpdTransactions } from "../../../../navigation/actions";
import { BpdPeriod } from "../../../../store/actions/periods";
import { BpdBaseShadowBoxLayout } from "./base/BpdBaseShadowBoxLayout";
import { ProgressBar } from "./base/ProgressBar";

type Props = {
  transactions: number;
  minTransactions: number;
  period: BpdPeriod;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
 * @deprecated not used anymore, it is kept for some time in case of second thoughts
 */
export const PercentageTransactionsSummary = (props: Props) => {
  const { title, of } = loadLocales();
  return (
    <BpdBaseShadowBoxLayout
      row1={
        <H5 testID={"percentageTransactions.title"} style={styles.title}>
          {title}
        </H5>
      }
      row2={
        <H2 style={styles.title}>
          <H2 testID={"percentageTransactions.transactions"} color={"blue"}>
            {formatIntegerNumber(props.transactions)}
          </H2>{" "}
          {of} {formatIntegerNumber(props.minTransactions)}
        </H2>
      }
      row3={
        <>
          <VSpacer size={16} />
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
        <H2
          testID={"textualTransaction.transactions"}
          color={"blue"}
          style={styles.title}
        >
          {formatIntegerNumber(props.transactions)}
        </H2>
      }
      row3={
        <H5
          testID={"textualTransaction.minTransactions"}
          color={"bluegrey"}
          style={styles.title}
        >
          {of} {formatIntegerNumber(props.minTransactions)}
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
const TransactionsGraphicalSummary = (props: Props) => (
  <TouchableOpacity onPress={props.goToTransactions} style={IOStyles.flex}>
    <TextualTransactionsSummary {...props} />
  </TouchableOpacity>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({
  goToTransactions: () => navigateToBpdTransactions()
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsGraphicalSummary);
