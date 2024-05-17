import { PaymentMethodManagementTypeEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";

export const ONBOARDING_FAQ_ENABLE_3DS = "https://io.italia.it/faq/#n3_3";
export const ONBOARDING_CALLBACK_URL_SCHEMA = "iowallet";
export const ONBOARDING_OUTCOME_PATH = "/wallets/outcomes";

export const isMethodOnboardable = (method: PaymentMethodResponse) =>
  (method.methodManagement === PaymentMethodManagementTypeEnum.ONBOARDABLE ||
    method.methodManagement ===
      PaymentMethodManagementTypeEnum.ONBOARDABLE_ONLY ||
    method.methodManagement ===
      PaymentMethodManagementTypeEnum.ONBOARDABLE_WITH_PAYMENT) &&
  method.status === PaymentMethodStatusEnum.ENABLED;
