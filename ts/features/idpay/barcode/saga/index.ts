import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { IDPayClient } from "../../common/api/client";
import {
  idPayGenerateBarcode,
  idPayGenerateStaticCode
} from "../store/actions";
import { handleGenerateBarcode } from "./handleGenerateBarcode";
import { handleGenerateStaticCode } from "./handleGenerateStaticCode";

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

  yield* takeLatest(
    idPayGenerateStaticCode.request,
    handleGenerateStaticCode,
    idPayClient.retrievectiveBarCodeTransaction,
    bearerToken
  );
}
