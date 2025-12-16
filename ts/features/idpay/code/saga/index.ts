import { SagaIterator } from "redux-saga";
import { put, takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";
import {
  idPayEnrollCode,
  idPayGenerateCode,
  idPayGetCodeStatus
} from "../store/actions";
import { handleIdPayEnrollCode } from "./handleIdPayEnrollCode";
import { handleIdPayGenerateCode } from "./handleIdPayGenerateCode";
import { handleIdPayGetCodeStatus } from "./handleIdPayGetCodeStatus";

export function* watchIdPayCodeSaga(
  idPayClient: IDPayClient,
  bearerToken: string,
  preferredLanguage: PreferredLanguageEnum
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

  yield* takeLatest(
    idPayEnrollCode.request,
    handleIdPayEnrollCode,
    idPayClient.enrollInstrumentCode,
    bearerToken,
    preferredLanguage
  );

  yield* put(idPayGetCodeStatus.request());
}
