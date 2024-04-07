import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletCreateResponse } from "../../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";

export const paymentsOnboardingGetMethodsAction = createAsyncAction(
  "PAYMENTS_GET_ONBOARDING_METHODS_REQUEST",
  "PAYMENTS_GET_ONBOARDING_METHODS_SUCCESS",
  "PAYMENTS_GET_ONBOARDING_METHODS_FAILURE",
  "PAYMENTS_GET_ONBOARDING_METHODS_CANCEL"
)<void, PaymentMethodsResponse, NetworkError, void>();

export const paymentsStartOnboardingAction = createAsyncAction(
  "PAYMENTS_START_ONBOARDING_REQUEST",
  "PAYMENTS_START_ONBOARDING_SUCCESS",
  "PAYMENTS_START_ONBOARDING_FAILURE",
  "PAYMENTS_START_ONBOARDING_CANCEL"
)<{ paymentMethodId: string }, WalletCreateResponse, NetworkError, void>();

export type PaymentsOnboardingActions =
  | ActionType<typeof paymentsStartOnboardingAction>
  | ActionType<typeof paymentsOnboardingGetMethodsAction>;
