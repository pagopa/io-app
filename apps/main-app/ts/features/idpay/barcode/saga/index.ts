import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { IDPayClient } from "../../common/api/client";
import { idPayGenerateBarcode } from "../store/actions";
import { handleGenerateBarcode } from "./handleGenerateBarcode";

export function* watchIDPayBarcodeSaga(
  idPayClient: IDPayClient,
  bearerToken: string
): SagaIterator {
  yield* takeLatest(
    idPayGenerateBarcode.request,
    handleGenerateBarcode,
    idPayClient.createBarCodeTransaction,
    bearerToken
  );
}
