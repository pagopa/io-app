import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletCreateResponse } from "../../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

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

// This implementation will be removed as soon as the backend will migrate totally to the NPG. (https://pagopa.atlassian.net/browse/IOBP-632)
export const paymentsInitOnboardingWithRptIdToResume = createStandardAction(
  "PAYMENTS_INIT_ONBOARDING_RESUMING_TRANSACTION"
)<{
  rptId: RptId;
}>();

// This implementation will be removed as soon as the backend will migrate totally to the NPG. (https://pagopa.atlassian.net/browse/IOBP-632)
export const paymentsResetRptIdToResume = createStandardAction(
  "PAYMENTS_RESET_RPTID_TO_RESUME"
)();

export type PaymentsOnboardingActions =
  | ActionType<typeof paymentsStartOnboardingAction>
  | ActionType<typeof paymentsOnboardingGetMethodsAction>
  | ActionType<typeof paymentsInitOnboardingWithRptIdToResume>
  | ActionType<typeof paymentsResetRptIdToResume>;
