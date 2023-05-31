import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { PaymentFailure } from "./failure";

export type Context = {
  trxCode: O.Option<string>;
  transactionData: O.Option<E.Either<PaymentFailure, AuthPaymentResponseDTO>>;
};

export const INITIAL_CONTEXT: Context = {
  trxCode: O.none,
  transactionData: O.none
};
