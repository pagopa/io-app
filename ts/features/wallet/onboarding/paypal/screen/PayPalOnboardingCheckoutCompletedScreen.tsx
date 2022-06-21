import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useEffect } from "react";
import WorkunitGenericFailure from "../../../../../components/error/WorkunitGenericFailure";
import OutcomeCodeMessageComponent from "../../../../../components/wallet/OutcomeCodeMessageComponent";
import I18n from "../../../../../i18n";
import { fetchWalletsRequestWithExpBackoff } from "../../../../../store/actions/wallet/wallets";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { extractOutcomeCode } from "../../../../../store/reducers/wallet/outcomeCode";
import { paypalSelector } from "../../../../../store/reducers/wallet/wallets";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { walletAddPaypalFailure } from "../store/actions";
import { paypalOnboardingOutcomeCodeSelector } from "../store/reducers/onOboardingCompleted";
import PayPalOnboardingCompletedSuccessComponent from "./PayPalOnboardingCompletedSuccessComponent";

/**
 * The paypal onboarding is completed
 * This screen show a success or a failure based on the outcome code obtained in the previous step
 * @constructor
 */
const PayPalOnboardingCheckoutCompletedScreen = () =>
  // TODO review the error code messages see https://pagopa.atlassian.net/browse/IA-484
  {
    const dispatch = useIODispatch();
    const paypalOutcomeCode = useIOSelector(
      paypalOnboardingOutcomeCodeSelector
    );
    const paypalPaymentMethod = useIOSelector(paypalSelector);
    const loadWallets = useCallback(() => {
      dispatch(fetchWalletsRequestWithExpBackoff());
    }, [dispatch]);
    // refresh wallet to load the added paypal method
    useEffect(() => {
      loadWallets();
    }, [loadWallets]);

    // this should not happen (we can say nothing about the error)
    if (paypalOutcomeCode === undefined) {
      return <WorkunitGenericFailure />;
    }
    const outcomeCode = extractOutcomeCode(O.some(paypalOutcomeCode));
    // it should never happen (the outcome code is not recognized as valid)
    if (O.isNone(outcomeCode)) {
      return <WorkunitGenericFailure />;
    }
    // show a loading or error component to handle the wallet reload
    if (
      pot.isLoading(paypalPaymentMethod) ||
      pot.isError(paypalPaymentMethod)
    ) {
      return (
        <LoadingErrorComponent
          isLoading={!pot.isError(paypalPaymentMethod)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={loadWallets}
        />
      );
    }
    return (
      <OutcomeCodeMessageComponent
        hideContextualHelp={true}
        outcomeCode={outcomeCode.value}
        successComponent={() => <PayPalOnboardingCompletedSuccessComponent />}
        onClose={() => dispatch(walletAddPaypalFailure())}
      />
    );
  };

export default PayPalOnboardingCheckoutCompletedScreen;
