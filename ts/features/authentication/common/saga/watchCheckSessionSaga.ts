import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { TypeOfApiResponseStatus } from "@pagopa/ts-commons/lib/requests";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { GetSessionStateT } from "../../../../../definitions/session_manager/requestTypes";
import {
  checkCurrentSession,
  sessionInformationLoadSuccess
} from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { isTestEnv } from "../../../../utils/environment";
import { convertUnknownToError } from "../../../../utils/errors";
import { handleSessionExpiredSaga } from "../../fastLogin/saga/utils";
import { getOnlyNotAlreadyExistentValues } from "../../../zendesk/utils";
import { sessionInfoSelector } from "../store/selectors";
import { SMBackendClient } from "../../../../api/BackendClientManager";

export function* checkSession(
  getSessionValidity: SMBackendClient["getSessionState"],
  fields?: string, // the `fields` parameter is optional and it defaults to an empty object
  mergeOldAndNewValues: boolean = false
): Generator<
  ReduxSagaEffect,
  TypeOfApiResponseStatus<GetSessionStateT> | undefined,
  any
> {
  try {
    const response: SagaCallReturnType<typeof getSessionValidity> = yield* call(
      getSessionValidity,
      { Bearer: "", fields } // Pass the optional params
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
        const currentSessionInfo = yield* select(sessionInfoSelector);

        yield* put(
          sessionInformationLoadSuccess(
            mergeOldAndNewValues && O.isSome(currentSessionInfo)
              ? getOnlyNotAlreadyExistentValues(
                  response.right.value,
                  currentSessionInfo.value
                )
              : response.right.value
          )
        );
      }
      return response.right.status;
    }
  } catch (e) {
    // investigate here if we want to handle differently errors during session check
    // the timeout error is here
    yield* put(checkCurrentSession.failure(convertUnknownToError(e)));
    return undefined;
  }
}

export function* checkSessionResult(
  action: ReturnType<(typeof checkCurrentSession)["success"]>
) {
  if (!action.payload.isSessionValid) {
    yield* call(handleSessionExpiredSaga);
  }
}

// Saga that listen to check session dispatch and returns it's validity
export function* watchCheckSessionSaga(
  getSessionValidity: SMBackendClient["getSessionState"],
  fields?: string
): SagaIterator {
  yield* takeLatest(getType(checkCurrentSession.request), function* () {
    yield* call(checkSession, getSessionValidity, fields);
  });
  yield* takeLatest(getType(checkCurrentSession.success), checkSessionResult);
}

export const testableCheckSession = isTestEnv ? checkSession : undefined;
