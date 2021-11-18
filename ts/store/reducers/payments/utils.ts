import { fromNullable, Option, some } from "fp-ts/lib/Option";
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
): Option<boolean> => {
  if (payment.failure) {
    return some(false);
  }
  if (payment.success) {
    return some(true);
  }
  // if we have an outcomeCode we got an error on pay
  return payment.outcomeCode
    ? some(false)
    : fromNullable(payment.transaction).map(
        t => t !== undefined && isSuccessTransaction(t)
      );
};
