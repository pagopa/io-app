import { SagaIterator } from "redux-saga";
import { put, takeLatest } from "typed-redux-saga/macro";
import { IDPayClient } from "../../common/api/client";
import { idPayGenerateCode, idPayGetCodeStatus } from "../store/actions";
import { handleIdPayGenerateCode } from "./handleIdPayGenerateCode";
import { handleIdPayGetCodeStatus } from "./handleIdPayGetCodeStatus";

export function* watchIdPayCodeSaga(
  idPayClient: IDPayClient,
  bearerToken: string
): SagaIterator {
  yield* takeLatest(
    idPayGetCodeStatus.request,
    handleIdPayGetCodeStatus,
    idPayClient.getIdpayCodeStatus,
    bearerToken
  );

  yield* takeLatest(
    idPayGenerateCode.request,
    handleIdPayGenerateCode,
    idPayClient.generateCode,
    bearerToken
  );

  yield* put(idPayGetCodeStatus.request());
}
