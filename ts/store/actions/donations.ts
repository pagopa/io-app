/**
 * Action type related to the execution of a donation
 */

import { AmountInEuroCents } from "italia-pagopa-commons/lib/pagopa";
import { ActionType, createAsyncAction } from "typesafe-actions";

export const paymentIdFofDonation = createAsyncAction(
  "PAYMENT_ID_FOR_DONATION_REQUEST",
  "PAYMENT_ID_FOR_DONATION_SUCCESS",
  "PAYMENT_ID_FOR_DONATION_FAILURE"
)<AmountInEuroCents, void, void>();

export type DonationsActions = ActionType<typeof paymentIdFofDonation>;
