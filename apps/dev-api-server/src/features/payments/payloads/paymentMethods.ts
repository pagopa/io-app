import { PaymentMethodsResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv3/PaymentMethodsResponse";

import { paymentMethodsDB } from "../persistence/paymentMethods";

export const allPaymentMethods: PaymentMethodsResponse = {
  paymentMethods: paymentMethodsDB
};
