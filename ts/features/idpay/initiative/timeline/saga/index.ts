import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { waitBackoffError } from "../../../../../utils/backoffError";
import { IDPayClient } from "../../../common/api/client";
import {
  IdPayTimelineDetailsGetPayloadType,
  idpayTimelineDetailsGet
} from "../store/actions";
import { handleGetTimelineDetails } from "./handleGetTimelineDetails";

/**
 * Handle IDPAY timeline requests
 * @param bearerToken
 */
export function* watchIDPayTimelineSaga(
  idPayClient: IDPayClient,
  token: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idpayTimelineDetailsGet.request,
    function* (action: { payload: IdPayTimelineDetailsGetPayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idpayTimelineDetailsGet.failure);
      yield* call(
        handleGetTimelineDetails,
        idPayClient.getTimelineDetail,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
}
