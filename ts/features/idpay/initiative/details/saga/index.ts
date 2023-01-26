import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import { call, select, takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import {
  idPayTestToken,
  idPayApiUatBaseUrl,
  idPayApiBaseUrl
} from "../../../../../config";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../../store/reducers/persistedPreferences";
import { waitBackoffError } from "../../../../../utils/backoffError";
import { fromLocaleToPreferredLanguage } from "../../../../../utils/locale";
import { createIDPayWalletClient } from "../../../wallet/api/client";
import { createIDPayTimelineClient } from "../api/client";
import {
  idpayInitiativeGet,
  IdPayInitiativeGetPayloadType,
  idpayTimelinePageGet,
  IdpayTimelinePageGetPayloadType
} from "../store/actions";
import { handleGetInitiativeDetails } from "./handleGetInitiativeDetails";
import { handleGetTimelinePage } from "./handleGetTimelinePage";

/**
 * Handle IDPAY initiative requests
 * @param bearerToken
 */
export function* idpayInitiativeDetailsSaga(bearerToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);
  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;
  const token = idPayTestToken ?? bearerToken;

  const idPayWalletClient = createIDPayWalletClient(baseUrl);
  const idPayTimelineClient = createIDPayTimelineClient(baseUrl);

  const language = yield* select(preferredLanguageSelector);

  const preferredLanguage = pipe(
    language,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );
  // handle the request of getting id pay wallet
  yield* takeLatest(
    idpayInitiativeGet.request,
    function* (action: { payload: IdPayInitiativeGetPayloadType }) {
      // wait backoff time if there were previous errors
      yield* call(waitBackoffError, idpayInitiativeGet.failure);
      yield* call(
        handleGetInitiativeDetails,
        idPayWalletClient.getWalletDetail,
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
        idPayTimelineClient.getTimeline,
        token,
        preferredLanguage,
        action.payload
      );
    }
  );
}
