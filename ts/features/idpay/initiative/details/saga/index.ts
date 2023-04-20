import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { waitBackoffError } from "../../../../../utils/backoffError";
import { IDPayClient } from "../../../common/api/client";
import {
  idpayInitiativeGet,
  IdPayInitiativeGetPayloadType,
  idpayTimelineDetailsGet,
  IdPayTimelineDetailsGetPayloadType,
  idpayTimelinePageGet,
  IdpayTimelinePageGetPayloadType
} from "../store/actions";
import { handleGetInitiativeDetails } from "./handleGetInitiativeDetails";
import { handleGetTimelineDetails } from "./handleGetTimelineDetails";
import { handleGetTimelinePage } from "./handleGetTimelinePage";

/**
 * Handle IDPAY initiative requests
 * @param bearerToken
 */
export function* watchIDPayInitiativeDetailsSaga(
  idPayClient: IDPayClient,
  token: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  // handle the request of getting id pay wallet
  yield* takeLatest(
    idpayInitiativeGet.request,
    function* (action: { payload: IdPayInitiativeGetPayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idpayInitiativeGet.failure);
      yield* call(
        handleGetInitiativeDetails,
        idPayClient.getWalletDetail,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
  yield* takeLatest(
    idpayTimelinePageGet.request,
    function* (action: { payload: IdpayTimelinePageGetPayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idpayTimelinePageGet.failure);
      yield* call(
        handleGetTimelinePage,
        idPayClient.getTimeline,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
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
