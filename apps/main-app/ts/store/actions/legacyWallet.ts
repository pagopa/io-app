import { PaymentFaultV2Enum as PaymentProblemErrorEnum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { PaymentRequestsGetResponse } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { ActionType, createAsyncAction } from "typesafe-actions";

export type PaymentStartOrigin =
  | "donation"
  | "manual_insertion"
  | "message"
  | "poste_datamatrix_scan"
  | "qrcode_scan";
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
