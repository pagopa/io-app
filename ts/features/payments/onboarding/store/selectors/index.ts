import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { isMethodOnboardable } from "../../utils";

const walletOnboardingSelector = (state: GlobalState) =>
  state.features.payments.onboarding;

export const selectPaymentOnboardingRequestResult = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.result
);

/**
 * A payment method must be ONBOARDABLE and ENABLED in order to be onboarder
 */
export const selectPaymentOnboardingMethods = createSelector(
  walletOnboardingSelector,
  onboarding =>
    pot.map(
      onboarding.paymentMethods,
      ({ paymentMethods }) => paymentMethods?.filter(isMethodOnboardable) ?? []
    )
);

export const selectPaymentOnboardingSelectedMethod = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.selectedPaymentMethodId
);

export const selectPaymentOnboardingRptIdToResume = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.rptIdToResume
);
