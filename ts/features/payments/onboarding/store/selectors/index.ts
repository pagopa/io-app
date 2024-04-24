import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { PaymentMethodManagementTypeEnum } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodManagementType";
import { GlobalState } from "../../../../../store/reducers/types";
import { PaymentMethodStatusEnum } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";

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
      ({ paymentMethods }) =>
        paymentMethods?.filter(
          method =>
            method.methodManagement ===
            PaymentMethodManagementTypeEnum.ONBOARDABLE &&
            method.status === PaymentMethodStatusEnum.ENABLED
        ) ?? []
    )
);

export const selectPaymentOnboardingSelectedMethod = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.selectedPaymentMethodId
);

export const selectPaymentOnboardingResumePaymentRptId = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.resumePaymentRptId
);
