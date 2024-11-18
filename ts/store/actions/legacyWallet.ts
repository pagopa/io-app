import { ActionType, createAsyncAction } from "typesafe-actions";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum as PaymentProblemErrorEnum } from "../../../definitions/backend/PaymentProblemJson";

export type PaymentStartOrigin =
  | "message"
  | "qrcode_scan"
  | "poste_datamatrix_scan"
  | "manual_insertion"
  | "donation";
//
// verifica
//

// the error is undefined in case we weren't able to decode it, it should be
// interpreted as a generic error
export const paymentVerifica = createAsyncAction(
  "PAYMENT_VERIFICA_REQUEST",
  "PAYMENT_VERIFICA_SUCCESS",
  "PAYMENT_VERIFICA_FAILURE"
)<
  { rptId: RptId; startOrigin: PaymentStartOrigin },
  PaymentRequestsGetResponse,
  keyof typeof PaymentProblemErrorEnum | undefined
>();

export type PaymentActions = ActionType<typeof paymentVerifica>;
