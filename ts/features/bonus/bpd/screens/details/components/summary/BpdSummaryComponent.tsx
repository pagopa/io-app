import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { isStringNullyOrEmpty } from "../../../../../../../utils/strings";
import { isReady } from "../../../../model/RemoteValue";
import { BpdAmount } from "../../../../store/actions/amount";
import { BpdPeriod } from "../../../../store/actions/periods";
import { bpdIbanSelector } from "../../../../store/reducers/details/activation";
import { bpdAmountForSelectedPeriod } from "../../../../store/reducers/details/amounts";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import { TransactionsTextualSummary } from "./TransactionsTextualSummary";
import { TransactionsGraphicalSummary } from "./TransactionsGraphicalSummary";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type SummaryData = {
  period: BpdPeriod;
  amount: BpdAmount;
};

const Content = (sd: SummaryData) => (
  <View>
    {sd.period.status === "Inactive" ? null : (
      <TransactionsGraphicalSummary
        transactions={sd.amount.transactionNumber}
        minTransactions={sd.period.minTransactionNumber}
      />
    )}
    <View spacer={true} />
    <TransactionsTextualSummary
      period={sd.period}
      amount={sd.amount}
      name={"Ciao"}
    />
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
      // In order to render the component in the active period, the iban should be defined
      period.status !== "Active" ||
      (isReady(props.iban) && !isStringNullyOrEmpty(props.iban.value))
        ? pot.fold(
            props.amount,
            () => null,
            () => null,
            _ => null,
            _ => null,
            amount => <Content amount={amount} period={period} />,
            amount => <Content amount={amount} period={period} />,
            (amount, _) => <Content amount={amount} period={period} />,
            _ => null
          )
        : null
    )
    .getOrElse(null);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  currentPeriod: bpdSelectedPeriodSelector(state),
  amount: bpdAmountForSelectedPeriod(state),
  iban: bpdIbanSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdSummaryComponent);
