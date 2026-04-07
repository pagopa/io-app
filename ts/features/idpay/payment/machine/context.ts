import * as O from "fp-ts/lib/Option";

import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { PaymentFailure } from "../types/PaymentFailure";

export interface Context {
  readonly data_entry?: "manual" | "qr_code";
  readonly failure: O.Option<PaymentFailure>;
  readonly transactionData: O.Option<AuthPaymentResponseDTO>;
  readonly trxCode: string;
}

export const Context: Context = {
  trxCode: "",
  data_entry: undefined,
  transactionData: O.none,
  failure: O.none
};
