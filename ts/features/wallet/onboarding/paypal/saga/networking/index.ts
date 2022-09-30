import { call, put } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  searchPaypalPsp,
  walletAddPaypalRefreshPMToken
} from "../../store/actions";
import {
  getError,
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { convertPayPalPsp } from "../../store/transformers";

/**
 * handle the request of searching for PayPal psp
 * @param searchPsp
 * @param sessionManager
 */
export function* handlePaypalSearchPsp(
  searchPsp: PaymentManagerClient["searchPayPalPsp"],
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    const searchPayPalPspRequest: SagaCallReturnType<typeof searchPsp> =
      yield* call(sessionManager.withRefresh(searchPsp));
    if (E.isRight(searchPayPalPspRequest)) {
      if (searchPayPalPspRequest.right.status === 200) {
        yield* put(
          searchPaypalPsp.success(
            searchPayPalPspRequest.right.value.data.map(convertPayPalPsp)
          )
        );
        return;
      }
      // != 200
      yield* put(
        searchPaypalPsp.failure(
          getGenericError(
            new Error(`response status ${searchPayPalPspRequest.right.status}`)
          )
        )
      );
    } else {
      yield* put(
        searchPaypalPsp.failure(
          getGenericError(
            new Error(readablePrivacyReport(searchPayPalPspRequest.left))
          )
        )
      );
    }
  } catch (e) {
    yield* put(searchPaypalPsp.failure(getNetworkError(e)));
  }
}

// refresh PM token (it is needed in the webview) to ensure it won't expire during the checkout process
export function* refreshPMToken(
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    // If the request for the new token fails a new Error is raised
    const pagoPaToken: O.Option<PaymentManagerToken> = yield* call(
      sessionManager.getNewToken
    );
    if (O.isSome(pagoPaToken)) {
      yield* put(walletAddPaypalRefreshPMToken.success(pagoPaToken.value));
    } else {
      yield* put(
        walletAddPaypalRefreshPMToken.failure(
          new Error("cant load pm session token")
        )
      );
    }
  } catch (e) {
    yield* put(walletAddPaypalRefreshPMToken.failure(getError(e)));
  }
}
