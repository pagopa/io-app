import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { navigateToWorkunitGenericFailureScreen } from "../../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { AwardPeriodId } from "../../../../store/actions/periods";
import { bpdTransactionsLoadRequiredData } from "../../../../store/actions/transactions";
import {
  atLeastOnePaymentMethodHasBpdEnabledSelector,
  paymentMethodsWithActivationStatusSelector
} from "../../../../store/reducers/details/combiner";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import { bpdTransactionsRequiredDataLoadState } from "../../../../store/reducers/details/transactionsv2/ui";
import { NoPaymentMethodAreActiveWarning } from "../BpdAvailableTransactionsScreen";
import BpdEmptyTransactionsList from "../BpdEmptyTransactionsList";
import LoadTransactions from "../LoadTransactions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const AtLeastOneTransactionRouter = (props: Props) => {
  useEffect(() => {
    if (props.selectedPeriod) {
      props.loadRequiredData(props.selectedPeriod.awardPeriodId);
    } else {
      // This should never happens
      props.navigateToErrorFallback();
    }
  }, []);
  return pot.fold(
    props.transactionsRequiredData,
    () => <LoadTransactions />,
    () => <LoadTransactions />,
    _ => <LoadTransactions />,
    // TODO: add error
    _ => null,
    _ => null,
    _ => null,
    (_, __) => null,
    _ => null
  );
};

/**
 * V2 version of the screen, makes sure that all essential data for viewing transactions is loaded
 * - currentPeriod.amount.transactionCount === 0 && !noPaymentMethodWithCashback enabled: NoPaymentMethodAreActiveWarning
 * - currentPeriod.amount.transactionCount === 0 && atLeastOnePaymentMethodWithCashback enabled: BpdEmptyTransactionsList
 * - currentPeriod.amount.transactionCount > 0: loadRequiredData and display TransactionList
 * @param props
 * @constructor
 */
const BpdTransactionsRouterScreen = (
  props: Props
): React.ReactElement | null => {
  const atLeastOneTransaction =
    (props.selectedPeriod?.amount.transactionNumber ?? 0) > 0;

  // If the user have at least one transaction, try to load the required data to display the transactions
  if (atLeastOneTransaction) {
    return <AtLeastOneTransactionRouter {...props} />;
  }
  // The user doesn't have a single transaction, we have two alternative screen
  else {
    const noPaymentMethodActive =
      !props.atLeastOnePaymentMethodActive &&
      pot.isSome(props.potWallets) &&
      props.potWallets.value.length > 0;
    if (noPaymentMethodActive) {
      return <NoPaymentMethodAreActiveWarning />;
    }
    return <BpdEmptyTransactionsList />;
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadRequiredData: (periodId: AwardPeriodId) =>
    dispatch(bpdTransactionsLoadRequiredData.request(periodId)),
  navigateToErrorFallback: () =>
    dispatch(navigateToWorkunitGenericFailureScreen())
});

const mapStateToProps = (state: GlobalState) => ({
  transactionsRequiredData: bpdTransactionsRequiredDataLoadState(state),
  selectedPeriod: bpdSelectedPeriodSelector(state),
  atLeastOnePaymentMethodActive: atLeastOnePaymentMethodHasBpdEnabledSelector(
    state
  ),
  potWallets: paymentMethodsWithActivationStatusSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdTransactionsRouterScreen);
