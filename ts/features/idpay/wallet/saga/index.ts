import { SagaIterator } from "redux-saga";
import { call, takeLatest, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createIDPayWalletClient } from "../api/client";
import {
  IDPAY_API_TEST_TOKEN,
  IDPAY_API_UAT_BASEURL
} from "../../../../config";
import { idPayWalletGet } from "../store/actions";
import { waitBackoffError } from "../../../../utils/backoffError";
import { SessionToken } from "../../../../types/SessionToken";
import { preferredLanguageSelector } from "../../../../store/reducers/persistedPreferences";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { handleGetIDPayWallet } from "./handleGetIDPayWallet";

/**
 * Handle the IDPay Wallet requests
 * @param bearerToken
 */
export function* watchIDPayWalletSaga(bearerToken: SessionToken): SagaIterator {
  const idPayWalletClient = createIDPayWalletClient(IDPAY_API_UAT_BASEURL);

  const token = IDPAY_API_TEST_TOKEN ?? bearerToken;
  const language = yield* select(preferredLanguageSelector);

  const preferredLanguage = pipe(
    language,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  // handle the request of getting id pay wallet
  yield* takeLatest(idPayWalletGet.request, function* () {
    // wait backoff time if there were previous errors
    yield* call(waitBackoffError, idPayWalletGet.failure);
    yield* call(
      handleGetIDPayWallet,
      idPayWalletClient.getWallet,
      token,
      preferredLanguage
    );
  });
}
