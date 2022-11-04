import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { isSuccessTransaction } from "../../../types/pagopa";
import { PaymentHistory } from "./history";

/**
 * return some(true) if payment ends successfully
 * return some(false) if payment ends with a failure
 * return none if payments didn't end (no data to say failure or success)
 * @param payment
 */
export const isPaymentDoneSuccessfully = (
  payment: PaymentHistory
): O.Option<boolean> => {
  if (payment.failure) {
    return O.some(false);
  }
  if (payment.success) {
    return O.some(true);
  }
  // if we have an outcomeCode we got an error on pay
  return payment.outcomeCode
    ? O.some(false)
    : pipe(
        payment.transaction,
        O.fromNullable,
        O.map(t => t !== undefined && isSuccessTransaction(t))
      );
};
