import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";
import { idpayTimelineDetailsGet } from "../store/actions";
import { handleGetTimelineDetails } from "./handleGetTimelineDetails";

/**
 * Handle IDPAY timeline requests
 * @param bearerToken
 */
export function* watchIDPayTimelineSaga(
  idPayClient: IDPayClient,
  bearerToken: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idpayTimelineDetailsGet.request,
    handleGetTimelineDetails,
    idPayClient.getTimelineDetail,
    bearerToken,
    preferredLanguage
  );
}
