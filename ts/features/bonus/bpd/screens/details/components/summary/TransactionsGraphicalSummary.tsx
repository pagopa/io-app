import { View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { H2 } from "../../../../../../../components/core/typography/H2";
import { H5 } from "../../../../../../../components/core/typography/H5";
import I18n from "../../../../../../../i18n";
import { Dispatch } from "../../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../../store/reducers/types";
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
 */
const PercentageTransactionsSummary = (props: Props) => {
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
            {props.transactions}
          </H2>{" "}
          {of} {props.minTransactions}
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
        <H2
          testID={"textualTransaction.transactions"}
          color={"blue"}
          style={styles.title}
        >
          {props.transactions}
        </H2>
      }
      row3={
        <H5
          testID={"textualTransaction.minTransactions"}
          color={"bluegrey"}
          style={styles.title}
        >
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
const TransactionsGraphicalSummary: React.FunctionComponent<Props> = props =>
  props.transactions < props.minTransactions ? (
    <TouchableOpacity onPress={props.goToTransactions}>
      <PercentageTransactionsSummary {...props} />
    </TouchableOpacity>
  ) : (
    <TextualTransactionsSummary {...props} />
  );

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goToTransactions: () => dispatch(navigateToBpdTransactions())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsGraphicalSummary);
