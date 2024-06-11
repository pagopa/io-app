import * as E from "fp-ts/lib/Either";
import { call, delay, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { PagoPaClient } from "../../common/api/client";
import { paymentsGetPagoPaPlatformSessionTokenAction } from "../store/actions";
import { selectPagoPaPlatformSessionToken } from "../store/selectors";

/**
 * Retrieves the PagoPA session token from the Redux store.
 * If the token is not present, this function dispatches a request action
 * and waits for the data to be available. If successful, it returns the token.
 * In case of failure or timeout, the function returns undefined.
 *
 * @param timeoutMs - The timeout duration in milliseconds for waiting on the session token request.
 * @returns The PagoPA session token if available, otherwise undefined.
 */
export function* getOrFetchPagoPaPlatformSessionToken(
  timeoutMs: number = 3000
) {
  // Attempt to retrieve the session token from the Redux store
  const sessionToken: ReturnType<typeof selectPagoPaPlatformSessionToken> =
    yield* select(selectPagoPaPlatformSessionToken);

  // If the session token is already present in the store, return it
  if (sessionToken) {
    return sessionToken;
  }

  // If the session token is not present, dispatch a new request action
  yield* put(paymentsGetPagoPaPlatformSessionTokenAction.request());

  // Wait for the request to end, either in success or failure, with a timeout
  const { data } = yield* race({
    data: take(paymentsGetPagoPaPlatformSessionTokenAction.success),
    failure: take(paymentsGetPagoPaPlatformSessionTokenAction.failure),
    timeout: delay(timeoutMs)
  });

  // If the success action is dispatched, retrieve the new session token
  return data?.payload.token;
}

export function* handlePagoPaPlatformSessionToken(
  newSessionToken: PagoPaClient["generateSessionWallet"],
  action: ActionType<
    (typeof paymentsGetPagoPaPlatformSessionTokenAction)["request"]
  >
) {
  const newSessionTokenRequest = newSessionToken({});
  try {
    const newSessionTokenResult = (yield* call(
      withRefreshApiCall,
      newSessionTokenRequest,
      action
    )) as SagaCallReturnType<typeof newSessionToken>;

    if (E.isLeft(newSessionTokenResult)) {
      yield* put(
        paymentsGetPagoPaPlatformSessionTokenAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(newSessionTokenResult.left))
          )
        })
      );
      return;
    }

    if (newSessionTokenResult.right.status === 201) {
      yield* put(
        paymentsGetPagoPaPlatformSessionTokenAction.success(
          newSessionTokenResult.right.value
        )
      );
    } else if (newSessionTokenResult.right.status !== 401) {
      // The 401 status is handled by the withRefreshApiCall
      yield* put(
        paymentsGetPagoPaPlatformSessionTokenAction.failure({
          ...getGenericError(
            new Error(`Error: ${newSessionTokenResult.right.status}`)
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetPagoPaPlatformSessionTokenAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
