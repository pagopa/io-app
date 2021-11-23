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

/**
 * Show an error screen indicating the reason of the failure
 * The CTA ends the onboarding flow
 * @param props
 * @constructor
 */
const PayPalOnboardingCheckoutFailureScreen = (props: Props) =>
  // TODO review the error code messages see https://pagopa.atlassian.net/browse/IA-484
  extractOutcomeCode(props.outcomeCode).fold(
    <WorkunitGenericFailure />,
    outcomeCode => (
      <OutcomeCodeMessageComponent
        outcomeCode={outcomeCode}
        successComponent={() => null}
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
