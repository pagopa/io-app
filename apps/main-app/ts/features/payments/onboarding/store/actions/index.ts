import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";
import { WalletCreateResponse } from "../../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { NetworkError } from "../../../../../utils/errors";
import { WalletOnboardingOutcomeEnum } from "../../types/OnboardingOutcomeEnum";

export type ContextualOnboardingWebViewPayload = {
  onCancel?: (outcome?: WalletOnboardingOutcomeEnum) => void;
  onError?: (outcome?: WalletOnboardingOutcomeEnum) => void;
  onSuccess?: (url: string) => void;
  url: string;
};

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

export const contextualOnboardingStartWebViewFlow = createStandardAction(
  "PAYMENTS_ONBOARDING_START_WEB_VIEW_FLOW"
)<ContextualOnboardingWebViewPayload>();

export type PaymentsOnboardingActions =
  | ActionType<typeof contextualOnboardingStartWebViewFlow>
  | ActionType<typeof paymentsOnboardingGetMethodsAction>
  | ActionType<typeof paymentsStartOnboardingAction>;
