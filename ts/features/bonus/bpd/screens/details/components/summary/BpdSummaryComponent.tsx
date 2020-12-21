import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StyleSheet } from "react-native";
import { profileNameSelector } from "../../../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { BpdAmount } from "../../../../saga/networking/amount";
import { BpdPeriod } from "../../../../store/actions/periods";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import SuperCashbackRankingSummary from "./SuperCashbackRankingSummary";
import { TextualSummary } from "./TextualSummary";
import TransactionsGraphicalSummary from "./TransactionsGraphicalSummary";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type SummaryData = {
  period: BpdPeriod;
  amount: BpdAmount;
  name: string | undefined;
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row"
  }
});

/**
 * The graphical summary is visible only when the period is closed or when the period is Active
 * and transactionNumber > 0
 * @param period
 * @param amount
 */
const isGraphicalSummaryVisible = (period: BpdPeriod, amount: BpdAmount) =>
  period.status === "Closed" ||
  (period.status === "Active" && amount.transactionNumber > 0);

/**
 * Return true if the SuperCashback is visible for the specified period
 * @param period
 */
const isSuperCashbackVisible = (period: BpdPeriod) => period.minPosition > 0;

const Content = (sd: SummaryData) => (
  <View testID={"bpdSummaryComponent"}>
    {isGraphicalSummaryVisible(sd.period, sd.amount) ? (
      <View style={styles.row}>
        <TransactionsGraphicalSummary
          transactions={sd.amount.transactionNumber}
          minTransactions={sd.period.minTransactionNumber}
          period={sd.period}
        />
        {isSuperCashbackVisible(sd.period) ? (
          <>
            <View hspacer={true} />
            <SuperCashbackRankingSummary minRanking={sd.period.minPosition} />
          </>
        ) : null}
      </View>
    ) : null}
    <View spacer={true} />
    <TextualSummary {...sd} />
  </View>
);

/**
 * Display a summary with a graphical and textual information about the minimum transaction
 * and the amount earned for the period.
 * @constructor
 */
const BpdSummaryComponent: React.FunctionComponent<Props> = props =>
  props.currentPeriod ? (
    <Content
      key={props.currentPeriod.awardPeriodId}
      amount={props.currentPeriod.amount}
      period={props.currentPeriod}
      name={props.name}
    />
  ) : null;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  currentPeriod: bpdSelectedPeriodSelector(state),
  name: profileNameSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdSummaryComponent);
