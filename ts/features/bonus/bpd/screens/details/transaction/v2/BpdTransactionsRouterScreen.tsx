import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import WorkunitGenericFailure from "../../../../../../../components/error/WorkunitGenericFailure";
import { navigateToWorkunitGenericFailureScreen } from "../../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { AwardPeriodId } from "../../../../store/actions/periods";
import { bpdTransactionsLoadRequiredData } from "../../../../store/actions/transactions";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";
import { bpdTransactionsRequiredDataLoadStateSelector } from "../../../../store/reducers/details/transactionsv2/ui";
import LoadTransactions from "../LoadTransactions";
import BpdAvailableTransactionsScreenV2 from "./BpdAvailableTransactionsScreenV2";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * V2 version of the screen, makes sure that all essential data for viewing transactions is loaded
 * @param props
 * @constructor
 */
const BpdTransactionsRouterScreen = (
  props: Props
): React.ReactElement | null => {
  const [firstLoadingRequest, setFirstLoadingRequest] = useState(false);
  const [unexpectedError, setUnexpectedError] = useState(false);

  // Refresh the transactions required data when the screen is open
  useEffect(() => {
    if (props.selectedPeriod) {
      setFirstLoadingRequest(true);
      props.loadRequiredData(props.selectedPeriod.awardPeriodId);
    } else {
      // This should never happens
      setUnexpectedError(true);
    }
  }, []);

  // Handling unexpected error
  if (unexpectedError) {
    return <WorkunitGenericFailure />;
  }

  // We want to be sure that before rendering the pot state, a first load request has been sent
  if (!firstLoadingRequest) {
    return <LoadTransactions />;
  }

  return pot.fold(
    props.transactionsRequiredData,
    () => <LoadTransactions />,
    () => <LoadTransactions />,
    _ => <LoadTransactions />,
    // TODO: add error
    _ => null,
    _ => <BpdAvailableTransactionsScreenV2 />,
    _ => <LoadTransactions />,
    (_, __) => <LoadTransactions />,
    _ => null
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadRequiredData: (periodId: AwardPeriodId) =>
    dispatch(bpdTransactionsLoadRequiredData.request(periodId)),
  navigateToErrorFallback: () =>
    dispatch(navigateToWorkunitGenericFailureScreen())
});

const mapStateToProps = (state: GlobalState) => ({
  transactionsRequiredData: bpdTransactionsRequiredDataLoadStateSelector(state),
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdTransactionsRouterScreen);
