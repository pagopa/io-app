import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { IDPayClient } from "../../common/api/client";
import { idPayUnsubscribeAction } from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";
import { handleUnsubscribe } from "./handleUnsubscribe";

export function* watchIdPayUnsubscriptionSaga(
  idPayClient: IDPayClient,
  bearerToken: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idPayUnsubscribeAction.request,
    handleUnsubscribe,
    idPayClient.unsubscribe,
    bearerToken,
    preferredLanguage
  );
}
