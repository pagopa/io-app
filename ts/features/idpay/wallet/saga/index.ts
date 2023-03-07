import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { waitBackoffError } from "../../../../utils/backoffError";
import { IDPayClient } from "../../common/api/client";
import { idPayWalletGet } from "../store/actions";
import { handleGetIDPayWallet } from "./handleGetIDPayWallet";

/**
 * Handle the IDPay Wallet requests
 * @param bearerToken
 */
export function* watchIDPayWalletSaga(
  idPayClient: IDPayClient,
  token: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  // handle the request of getting id pay wallet
  yield* takeLatest(idPayWalletGet.request, function* () {
    // wait backoff time if there were previous errors
    yield* call(waitBackoffError, idPayWalletGet.failure);
    yield* call(
      handleGetIDPayWallet,
      idPayClient.getWallet,
      token,
      preferredLanguage
    );
  });
}
