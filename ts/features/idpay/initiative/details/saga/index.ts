import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import { call, select, takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import {
  IDPAY_API_TEST_TOKEN,
  IDPAY_API_UAT_BASEURL
} from "../../../../../config";
import { preferredLanguageSelector } from "../../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../../types/SessionToken";
import { waitBackoffError } from "../../../../../utils/backoffError";
import { fromLocaleToPreferredLanguage } from "../../../../../utils/locale";
import { createIDPayWalletClient } from "../../../wallet/api/client";
import { idpayInitiativeGet, IdPayInitiativeGetPayloadType } from "../store";
import { handleGetInitiativeDetails } from "./handleGetInitiativeDetails";

/**
 * Handle IDPAY initiative requests
 * @param bearerToken
 */
export function* idpayInitiativeDetailsSaga(
  bearerToken: SessionToken
): SagaIterator {
  const idPayWalletClient = createIDPayWalletClient(IDPAY_API_UAT_BASEURL);
  const token = IDPAY_API_TEST_TOKEN ?? bearerToken;
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
}
