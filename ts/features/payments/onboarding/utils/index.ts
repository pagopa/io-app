import { PaymentMethodManagementTypeEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";

export const ONBOARDING_CALLBACK_URL_SCHEMA = "iowallet";

export const isMethodOnboardable = ({
  methodManagement,
  status
}: PaymentMethodResponse) =>
  [
    PaymentMethodManagementTypeEnum.ONBOARDABLE,
    PaymentMethodManagementTypeEnum.ONBOARDABLE_ONLY,
    PaymentMethodManagementTypeEnum.ONBOARDABLE_WITH_PAYMENT
  ].includes(methodManagement) && status === PaymentMethodStatusEnum.ENABLED;
