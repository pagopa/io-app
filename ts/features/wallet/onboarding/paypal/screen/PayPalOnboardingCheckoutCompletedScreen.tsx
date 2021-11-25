import React, { useEffect } from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { paypalOnboardingOutcomeCodeSelector } from "../store/reducers/outcomeCode";
import WorkunitGenericFailure from "../../../../../components/error/WorkunitGenericFailure";
import OutcomeCodeMessageComponent from "../../../../../components/wallet/OutcomeCodeMessageComponent";
import { extractOutcomeCode } from "../../../../../store/reducers/wallet/outcomeCode";
import { walletAddPaypalFailure } from "../store/actions";
import { fetchWalletsRequestWithExpBackoff } from "../../../../../store/actions/wallet/wallets";
import { paypalSelector } from "../../../../../store/reducers/wallet/wallets";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../../i18n";
import PayPalOnboardingCompletedSuccessComponent from "./PayPalOnboardingCompletedSuccessComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * The paypal onboarding is completed
 * This screen show a success or a failure based on the outcome code obtained in the previous step
 * @param props
 * @constructor
 */
const PayPalOnboardingCheckoutCompletedScreen = (props: Props) =>
  // TODO review the error code messages see https://pagopa.atlassian.net/browse/IA-484
  {
    const { loadWallets } = props;
    // refresh wallet to load the added paypal method
    useEffect(() => {
      loadWallets();
    }, [loadWallets]);

    // this should not happen (we can say nothing about the error)
    if (props.paypalOutcomeCode.isNone()) {
      return <WorkunitGenericFailure />;
    }
    const outcomeCode = extractOutcomeCode(props.paypalOutcomeCode);
    // it should not never happen (the outcome code is not recognized as valid)
    if (outcomeCode.isNone()) {
      return <WorkunitGenericFailure />;
    }
    // show a loding or error component to handle the wallet reload
    if (
      pot.isLoading(props.paypalPaymentMethod) ||
      pot.isError(props.paypalPaymentMethod)
    ) {
      return (
        <LoadingErrorComponent
          isLoading={!pot.isError(props.paypalPaymentMethod)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={loadWallets}
        />
      );
    }
    return (
      <OutcomeCodeMessageComponent
        outcomeCode={outcomeCode.value}
        successComponent={() => <PayPalOnboardingCompletedSuccessComponent />}
        onClose={props.exit}
      />
    );
  };

const mapDispatchToProps = (dispatch: Dispatch) => ({
  exit: () => dispatch(walletAddPaypalFailure()),
  loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff())
});

const mapStateToProps = (state: GlobalState) => ({
  paypalOutcomeCode: paypalOnboardingOutcomeCodeSelector(state),
  paypalPaymentMethod: paypalSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalOnboardingCheckoutCompletedScreen);
