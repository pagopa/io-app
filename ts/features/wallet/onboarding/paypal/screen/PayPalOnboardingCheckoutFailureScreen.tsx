import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { paypalOnboardingOutcomeCodeSelector } from "../store/reducers/outcomeCode";
import WorkunitGenericFailure from "../../../../../components/error/WorkunitGenericFailure";
import OutcomeCodeMessageComponent from "../../../../../components/wallet/OutcomeCodeMessageComponent";
import { extractOutcomeCode } from "../../../../../store/reducers/wallet/outcomeCode";
import { walletAddPaypalFailure } from "../store/actions";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const PayPalOnboardingCheckoutFailureScreen = (props: Props) =>
  extractOutcomeCode(props.outcomeCode).fold(
    <WorkunitGenericFailure />,
    outcomeCode => (
      <OutcomeCodeMessageComponent
        outcomeCode={outcomeCode}
        successComponent={null}
        onClose={props.exit}
      />
    )
  );

const mapDispatchToProps = (dispatch: Dispatch) => ({
  exit: () => dispatch(walletAddPaypalFailure())
});

const mapStateToProps = (state: GlobalState) => ({
  outcomeCode: paypalOnboardingOutcomeCodeSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalOnboardingCheckoutFailureScreen);
