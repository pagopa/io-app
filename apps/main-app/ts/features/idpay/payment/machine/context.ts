import { AuthPaymentResponseDTO } from "@io-app/api-types/generated/definitions/idpay/AuthPaymentResponseDTO";

import { PaymentFailure } from "../types/PaymentFailure";

export interface Context {
  readonly data_entry?: "manual" | "qr_code";
  readonly failure: PaymentFailure | undefined;
  readonly transactionData: AuthPaymentResponseDTO | undefined;
  readonly trxCode: string;
}

export const Context: Context = {
  trxCode: "",
  data_entry: undefined,
  transactionData: undefined,
  failure: undefined
};
