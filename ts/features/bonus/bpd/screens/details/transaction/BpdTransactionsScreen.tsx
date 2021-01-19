import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdDisplayTransactionsSelector } from "../../../store/reducers/details/combiner";
import LoadTransactions from "./detail/LoadTransactions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Display all the transactions for a specific period
 * @constructor
 */
const BpdTransactionsScreen: React.FunctionComponent<Props> = props =>
  pot.fold(
    props.transactionForSelectedPeriod,
    () => <LoadTransactions />,
    () => <LoadTransactions />,
    _ => <LoadTransactions />,
    _ => <LoadTransactions />,
    _ => <LoadTransactions />,
    _ => <LoadTransactions />,
    _ => <LoadTransactions />,
    _ => <LoadTransactions />
  );
const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  transactionForSelectedPeriod: bpdDisplayTransactionsSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdTransactionsScreen);
