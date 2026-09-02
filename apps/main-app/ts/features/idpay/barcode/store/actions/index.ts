import { TransactionBarCodeResponse } from "@io-app/api-types/generated/definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "@io-app/api-types/generated/definitions/idpay/TransactionErrorDTO";
import { ActionType, createAsyncAction } from "typesafe-actions";

import { NetworkError } from "../../../../../utils/errors";

type IdPayGenerateBarcodePayload = {
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
    error: NetworkError | TransactionErrorDTO;
    initiativeId: string;
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
    error: NetworkError | TransactionErrorDTO;
    initiativeId: string;
  }
>();

export type IdPayStaticCodeActions = ActionType<typeof idPayGenerateStaticCode>;
