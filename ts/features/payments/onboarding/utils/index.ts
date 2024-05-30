import { PaymentMethodManagementTypeEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";

export const ONBOARDING_FAQ_ENABLE_3DS = "https://io.italia.it/faq/#n3_3";
export const ONBOARDING_CALLBACK_URL_SCHEMA = "iowallet";
export const ONBOARDING_OUTCOME_PATH = "/wallets/outcomes";

export const isMethodOnboardable = ({
  methodManagement,
  status
}: PaymentMethodResponse) =>
  [
    PaymentMethodManagementTypeEnum.ONBOARDABLE,
    PaymentMethodManagementTypeEnum.ONBOARDABLE_ONLY,
    PaymentMethodManagementTypeEnum.ONBOARDABLE_WITH_PAYMENT
  ].includes(methodManagement) && status === PaymentMethodStatusEnum.ENABLED;
