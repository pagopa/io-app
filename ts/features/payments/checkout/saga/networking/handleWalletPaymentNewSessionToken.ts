import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, delay, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetNewSessionTokenAction } from "../../store/actions/networking";
import { selectWalletPaymentSessionToken } from "../../store/selectors";

/**
 * Retrieves the eCommerce session token from the Redux store.
 * If the token is not present, this function dispatches a request action
 * and waits for the data to be available. If successful, it returns the token.
 * In case of failure or timeout, the function returns undefined.
 *
 * @param timeoutMs - The timeout duration in milliseconds for waiting on the session token request.
 * @returns The eCommerce session token if available, otherwise undefined.
 */
export function* getOrFetchWalletSessionToken(timeoutMs: number = 3000) {
  // Attempt to retrieve the session token from the Redux store
  const sessionToken: ReturnType<typeof selectWalletPaymentSessionToken> =
    yield* select(selectWalletPaymentSessionToken);

  // If the session token is already present in the store, return it
  if (sessionToken) {
    return sessionToken;
  }

  // If the session token is not present, dispatch a new request action
  yield* put(paymentsGetNewSessionTokenAction.request());

  // Wait for the request to end, either in success or failure, with a timeout
  const { data } = yield* race({
    data: take(paymentsGetNewSessionTokenAction.success),
    failure: take(paymentsGetNewSessionTokenAction.failure),
    timeout: delay(timeoutMs)
  });

  // If the success action is dispatched, retrieve the new session token
  return data?.payload.sessionToken;
}

export function* handleWalletPaymentNewSessionToken(
  newSessionToken: PaymentClient["newSessionToken"],
  action: ActionType<(typeof paymentsGetNewSessionTokenAction)["request"]>
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
        paymentsGetNewSessionTokenAction.failure({
          ...getGenericError(new Error(readablePrivacyReport(newSessionTokenResult.left)))
        })
      );
      return;
    }

    if (newSessionTokenResult.right.status === 200) {
      yield* put(paymentsGetNewSessionTokenAction.success(newSessionTokenResult.right.value));
    } else if (newSessionTokenResult.right.status !== 401) {
      yield* put(
        paymentsGetNewSessionTokenAction.failure({
          ...getGenericError(new Error(`Error: ${newSessionTokenResult.right.status}`))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetNewSessionTokenAction.failure({ ...getNetworkError(e) })
    );
  }
}
