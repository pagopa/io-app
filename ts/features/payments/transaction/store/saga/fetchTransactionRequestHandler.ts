import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { PaymentManagerToken } from "../../../../../types/pagopa";
import { SessionManager } from "../../../../../utils/SessionManager";
import {
  fetchTransactionFailure,
  fetchTransactionRequest,
  fetchTransactionSuccess
} from "../actions/legacyTransactionsActions";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../types/utils";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import {
  convertUnknownToError,
  getNetworkError,
  isTimeoutError
} from "../../../../../utils/errors";
import { checkCurrentSession } from "../../../../../store/actions/authentication";

/**
 * Handles fetchTransactionRequest
 */
export function* fetchTransactionRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof fetchTransactionRequest>
): Generator<ReduxSagaEffect, void, any> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getTransaction(action.payload)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(fetchTransactionSuccess(response.right.value.data));
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    if (isTimeoutError(getNetworkError(e))) {
      // check if also the IO session is expired
      yield* put(checkCurrentSession.request());
    }
    yield* put(fetchTransactionFailure(convertUnknownToError(e)));
  }
}
