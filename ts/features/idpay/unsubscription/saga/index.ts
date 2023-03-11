import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { waitBackoffError } from "../../../../utils/backoffError";
import { IDPayClient } from "../../common/api/client";
import {
  idPayUnsubscribe,
  IdPayUnsubscribePayloadType
} from "../store/actions";
import { handleUnsubscribe } from "./handleUnsubscribe";

export function* watchIDPayUnsubscribeSaga(
  idPayClient: IDPayClient,
  token: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  // handle the request of getting id pay wallet
  yield* takeLatest(
    idPayUnsubscribe.request,
    function* (action: { payload: IdPayUnsubscribePayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idPayUnsubscribe.failure);
      yield* call(
        handleUnsubscribe,
        idPayClient.unsubscribe,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
}
