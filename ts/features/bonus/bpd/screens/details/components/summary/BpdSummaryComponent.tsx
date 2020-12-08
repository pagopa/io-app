import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { profileNameSelector } from "../../../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { BpdAmount } from "../../../../store/actions/amount";
import { BpdPeriod } from "../../../../store/actions/periods";
import { bpdAmountForSelectedPeriod } from "../../../../store/reducers/details/amounts";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import { TextualSummary } from "./TextualSummary";
import { TransactionsGraphicalSummary } from "./TransactionsGraphicalSummary";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type SummaryData = {
  period: BpdPeriod;
  amount: BpdAmount;
  name: string | undefined;
};

/**
 * The graphical summary is visible only when the period is closed or when the period is Active
 * and transactionNumber > 0
 * @param period
 * @param amount
 */
const isGraphicalSummaryVisible = (period: BpdPeriod, amount: BpdAmount) =>
  period.status === "Closed" ||
  (period.status === "Active" && amount.transactionNumber > 0);

const Content = (sd: SummaryData) => (
  <View testID={"bpdSummaryComponent"}>
    {isGraphicalSummaryVisible(sd.period, sd.amount) ? (
      <TransactionsGraphicalSummary
        transactions={sd.amount.transactionNumber}
        minTransactions={sd.period.minTransactionNumber}
        period={sd.period}
      />
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
  fromNullable(props.currentPeriod)
    .map(period =>
      pot.fold(
        props.amount,
        () => null,
        () => null,
        _ => null,
        _ => null,
        amount => <Content amount={amount} period={period} name={props.name} />,
        amount => <Content amount={amount} period={period} name={props.name} />,
        (amount, _) => (
          <Content amount={amount} period={period} name={props.name} />
        ),
        _ => null
      )
    )
    .getOrElse(null);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  currentPeriod: bpdSelectedPeriodSelector(state),
  amount: bpdAmountForSelectedPeriod(state),
  name: profileNameSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdSummaryComponent);
