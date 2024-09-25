import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import { PaymentManagerToken } from "../../../../../types/pagopa";
import { SessionManager } from "../../../../../utils/SessionManager";
import { fetchPsp } from "../actions/legacyTransactionsActions";
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
 * Handles fetchPspRequest
 */
export function* fetchPspRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<(typeof fetchPsp)["request"]>
): Generator<ReduxSagaEffect, void, any> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getPsp(action.payload.idPsp)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);

    if (E.isRight(response)) {
      if (response.right.status === 200) {
        const psp = response.right.value.data;
        const successAction = fetchPsp.success({
          idPsp: action.payload.idPsp,
          psp
        });
        yield* put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    const failureAction = fetchPsp.failure({
      idPsp: action.payload.idPsp,
      error: convertUnknownToError(e)
    });
    if (isTimeoutError(getNetworkError(e))) {
      // check if also the IO session is expired
      yield* put(checkCurrentSession.request());
    }
    yield* put(failureAction);
    if (action.payload.onFailure) {
      action.payload.onFailure(failureAction);
    }
  }
}
