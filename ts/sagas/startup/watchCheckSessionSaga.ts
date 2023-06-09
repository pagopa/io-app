import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { TypeOfApiResponseStatus } from "@pagopa/ts-commons/lib/requests";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { GetSessionStateT } from "../../../definitions/backend/requestTypes";
import { BackendClient } from "../../api/backend";
import {
  checkCurrentSession,
  loadSupportToken,
  sessionInformationLoadSuccess
} from "../../store/actions/authentication";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { isTestEnv } from "../../utils/environment";
import { convertUnknownToError } from "../../utils/errors";
import { handleSessionExpiredSaga } from "../../features/fastLogin/saga/utils";

// load the support token useful for user assistance
function* handleLoadSupportToken(
  getSupportToken: ReturnType<typeof BackendClient>["getSupportToken"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof getSupportToken> = yield* call(
      getSupportToken,
      {}
    );
    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    } else {
      if (response.right.status === 200) {
        yield* put(loadSupportToken.success(response.right.value));
      } else {
        throw Error(`response status code ${response.right.status}`);
      }
    }
  } catch (e) {
    yield* put(loadSupportToken.failure(convertUnknownToError(e)));
  }
}

export function* checkSession(
  getSessionValidity: ReturnType<typeof BackendClient>["getSession"]
): Generator<
  ReduxSagaEffect,
  TypeOfApiResponseStatus<GetSessionStateT> | undefined,
  any
> {
  try {
    const response: SagaCallReturnType<typeof getSessionValidity> = yield* call(
      getSessionValidity,
      {}
    );
    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    } else {
      // On response we check the current status if 401 the session is invalid
      // the result will be false and then put the session expired action
      yield* put(
        checkCurrentSession.success({
          isSessionValid: response.right.status !== 401
        })
      );

      if (response.right.status === 200) {
        yield* put(sessionInformationLoadSuccess(response.right.value));
      }
      return response.right.status;
    }
  } catch (e) {
    yield* put(checkCurrentSession.failure(convertUnknownToError(e)));
    return undefined;
  }
}

export function* checkSessionResult(
  action: ReturnType<typeof checkCurrentSession["success"]>
) {
  if (!action.payload.isSessionValid) {
    yield* call(handleSessionExpiredSaga);
  }
}

// Saga that listen to check session dispatch and returns it's validity
export function* watchCheckSessionSaga(
  getSessionValidity: ReturnType<typeof BackendClient>["getSession"],
  getSupportToken: ReturnType<typeof BackendClient>["getSupportToken"]
): SagaIterator {
  yield* takeLatest(
    getType(checkCurrentSession.request),
    checkSession,
    getSessionValidity
  );
  yield* takeLatest(getType(checkCurrentSession.success), checkSessionResult);

  yield* takeLatest(
    getType(loadSupportToken.request),
    handleLoadSupportToken,
    getSupportToken
  );
}

export const testableCheckSession = isTestEnv ? checkSession : undefined;
