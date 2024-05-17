import { PaymentMethodManagementTypeEnum } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";

export const WALLET_PAYMENT_FEEDBACK_URL =
  "https://io.italia.it/diccilatua/ces-pagamento";

export const isValidPaymentMethod = (method: PaymentMethodResponse) =>
  method.methodManagement === PaymentMethodManagementTypeEnum.ONBOARDABLE ||
  method.methodManagement === PaymentMethodManagementTypeEnum.NOT_ONBOARDABLE ||
  method.methodManagement ===
    PaymentMethodManagementTypeEnum.ONBOARDABLE_WITH_PAYMENT;

export const isValidOnboardableMethod = (method: PaymentMethodResponse) =>
  method.methodManagement === PaymentMethodManagementTypeEnum.ONBOARDABLE ||
  method.methodManagement ===
    PaymentMethodManagementTypeEnum.ONBOARDABLE_ONLY ||
  method.methodManagement ===
    PaymentMethodManagementTypeEnum.ONBOARDABLE_WITH_PAYMENT;
