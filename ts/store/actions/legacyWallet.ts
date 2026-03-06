import { ActionType, createAsyncAction } from "typesafe-actions";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { PaymentFaultV2Enum as PaymentProblemErrorEnum } from "../../../definitions/backend/communication/PaymentFaultV2";
import { PaymentRequestsGetResponse } from "../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";

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
