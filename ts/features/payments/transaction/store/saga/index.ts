/**
 * A saga that manages the Wallet.
 */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { ReduxSagaEffect } from "../../../../../types/utils";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { defaultRetryingFetch } from "../../../../../utils/fetch";
import { fetchPaymentManagerLongTimeout } from "../../../../../config";
import { SessionManager } from "../../../../../utils/SessionManager";
import { isProfileEmailValidatedSelector } from "../../../../../store/reducers/profile";
import {
  fetchPsp,
  fetchTransactionRequest,
  fetchTransactionsRequest,
  fetchTransactionsRequestWithExpBackoff
} from "../actions/legacyTransactionsActions";
import { fetchTransactionsRequestHandler } from "./fetchTransactionsRequestHandler";
import { fetchTransactionRequestHandler } from "./fetchTransactionRequestHandler";
import { fetchPspRequestHandler } from "./fetchPspRequestHandler";

export function* watchLegacyTransactionSaga(
  walletToken: string,
  paymentManagerUrlPrefix: string
): Generator<ReduxSagaEffect, void, boolean> {
  // Client for the PagoPA PaymentManager
  const paymentManagerClient: PaymentManagerClient = PaymentManagerClient(
    paymentManagerUrlPrefix,
    walletToken,
    // despite both fetch have same configuration, keeping both ensures possible modding
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0),
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0)
  );

  // Helper function that requests a new session token from the PaymentManager.
  // When calling the PM APIs, we must use separate session, generated from the
  // walletToken.
  const getPaymentManagerSession = async () => {
    try {
      const response = await paymentManagerClient.getSession(walletToken);
      if (E.isRight(response) && response.right.status === 200) {
        return O.some(response.right.value.data.sessionToken);
      }
      return O.none;
    } catch {
      return O.none;
    }
  };

  // The session manager for the PagoPA PaymentManager (PM) will manage the
  // refreshing of the PM session when calling its APIs, keeping a shared token
  // and serializing the refresh requests.
  const pmSessionManager = new SessionManager(getPaymentManagerSession);
  // check if the current profile (this saga starts only when the user is logged in)
  // has an email address validated
  const isEmailValidated = yield* select(isProfileEmailValidatedSelector);
  yield* call(pmSessionManager.setSessionEnabled, isEmailValidated);
  //
  // Sagas
  //

  // API requests
  //

  yield* takeLatest(
    getType(fetchTransactionsRequest),
    fetchTransactionsRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(fetchTransactionsRequestWithExpBackoff),
    function* (
      action: ActionType<typeof fetchTransactionsRequestWithExpBackoff>
    ) {
      yield* put(fetchTransactionsRequest(action.payload));
    }
  );

  yield* takeLatest(
    getType(fetchTransactionRequest),
    fetchTransactionRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(fetchPsp.request),
    fetchPspRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );
}
