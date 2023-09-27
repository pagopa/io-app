import * as O from "fp-ts/lib/Option";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { PaymentFailure } from "./failure";

export type Context = {
  trxCode: O.Option<string>;
  transactionData: O.Option<AuthPaymentResponseDTO>;
  failure: O.Option<PaymentFailure>;
};

export const INITIAL_CONTEXT: Context = {
  trxCode: O.none,
  transactionData: O.none,
  failure: O.none
};
