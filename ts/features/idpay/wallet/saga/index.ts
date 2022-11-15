import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { createIDPayWalletClient } from "../api/client";
import { IDPAY_API_UAT_BASEURL } from "../../../../config";
import { idPayWalletGet } from "../store/actions";
import { waitBackoffError } from "../../../../utils/backoffError";
import { SessionToken } from "../../../../types/SessionToken";
import { handleGetIDPayWallet } from "./networking/handleGetIDPayWallet";

/**
 * Handle the IDPay Wallet requests
 * @param bearerToken
 */
export function* watchIDPayWalletSaga(bearerToken: SessionToken): SagaIterator {
  const idPayWalletClient = createIDPayWalletClient(
    IDPAY_API_UAT_BASEURL,
    bearerToken
  );

  // handle the request of getting id pay wallet
  yield* takeLatest(idPayWalletGet.request, function* () {
    // wait backoff time if there were previous errors
    yield* call(waitBackoffError, idPayWalletGet.failure);
    yield* call(handleGetIDPayWallet, idPayWalletClient.getWallet);
  });
}
