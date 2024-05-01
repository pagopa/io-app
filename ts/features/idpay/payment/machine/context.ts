import * as O from "fp-ts/lib/Option";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { PaymentFailure } from "../types/PaymentFailure";

export interface Context {
  readonly trxCode: string;
  readonly transactionData: O.Option<AuthPaymentResponseDTO>;
  readonly failure: O.Option<PaymentFailure>;
}

export const Context: Context = {
  trxCode: "",
  transactionData: O.none,
  failure: O.none
};
