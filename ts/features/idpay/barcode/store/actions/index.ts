import { ActionType, createAsyncAction } from "typesafe-actions";
import { TransactionBarCodeResponse } from "../../../../../../definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "../../../../../../definitions/idpay/TransactionErrorDTO";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayGenerateBarcodePayload = {
  initiativeId: string;
};

export const idPayGenerateBarcode = createAsyncAction(
  "IDPAY_GENERATE_BARCODE_REQUEST",
  "IDPAY_GENERATE_BARCODE_SUCCESS",
  "IDPAY_GENERATE_BARCODE_FAILURE"
)<
  IdPayGenerateBarcodePayload,
  TransactionBarCodeResponse,
  {
    initiativeId: string;
    error: TransactionErrorDTO | NetworkError;
  }
>();

export type IdPayBarcodeActions = ActionType<typeof idPayGenerateBarcode>;

export const idPayGenerateStaticCode = createAsyncAction(
  "IDPAY_GENERATE_STATIC_CODE_REQUEST",
  "IDPAY_GENERATE_STATIC_CODE_SUCCESS",
  "IDPAY_GENERATE_STATIC_CODE_FAILURE"
)<
  IdPayGenerateBarcodePayload,
  TransactionBarCodeResponse,
  {
    initiativeId: string;
    error: TransactionErrorDTO | NetworkError;
  }
>();

export type IdPayStaticCodeActions = ActionType<typeof idPayGenerateStaticCode>;
