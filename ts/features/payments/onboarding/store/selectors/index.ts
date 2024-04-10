import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { PaymentMethodManagementTypeEnum } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodManagementType";
import { GlobalState } from "../../../../../store/reducers/types";

const walletOnboardingSelector = (state: GlobalState) =>
  state.features.payments.onboarding;

export const selectPaymentOnboardingRequestResult = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.result
);

export const selectPaymentOnboardingMethods = createSelector(
  walletOnboardingSelector,
  onboarding =>
    pot.map(onboarding.paymentMethods, ({ paymentMethods }) =>
      paymentMethods?.filter(
        method =>
          method.methodManagement ===
          PaymentMethodManagementTypeEnum.ONBOARDABLE
      )
    )
);

export const selectPaymentOnboardingSelectedMethod = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.selectedPaymentMethodId
);
