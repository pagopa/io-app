import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, delay, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentNewSessionToken } from "../../store/actions/networking";
import { selectWalletPaymentSessionToken } from "../../store/selectors";

/**
 * Retrieves the eCommerceSessionToken from the Redux store.
 * If the token is not present, this function dispatches a request action
 * and waits for the data to be available. If successful, it returns the token.
 * In case of failure or timeout, the function returns undefined.
 * @param timeoutMs
 * @returns
 */
export function* getOrFetchWalletSessionToken(timeoutMs: number = 3000) {
  const sessionToken: ReturnType<typeof selectWalletPaymentSessionToken> =
    yield* select(selectWalletPaymentSessionToken);

  if (sessionToken) {
    // If the session token is already present in the store just return it
    return sessionToken;
  }

  // Otherwise a new request of the session token is dispatches
  yield* put(walletPaymentNewSessionToken.request());

  // We wait for the request to end, either is success or is failure
  // We set a timeout of timeoutMs milliseconds
  const { data } = yield* race({
    data: take(walletPaymentNewSessionToken.success),
    failure: take(walletPaymentNewSessionToken.failure),
    timeout: delay(timeoutMs)
  });

  // If the success action is the first dispatches we have de new session token
  return data?.payload.sessionToken;
}

export function* handleWalletPaymentNewSessionToken(
  newSessionToken: PaymentClient["newSessionToken"],
  action: ActionType<(typeof walletPaymentNewSessionToken)["request"]>
) {
  const newSessionTokenRequest = newSessionToken({});

  try {
    const newSessionTokenResult = (yield* call(
      withRefreshApiCall,
      newSessionTokenRequest,
      action
    )) as unknown as SagaCallReturnType<typeof newSessionToken>;

    yield* put(
      pipe(
        newSessionTokenResult,
        E.fold(
          error =>
            walletPaymentNewSessionToken.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),
          ({ status, value }) => {
            if (status === 200) {
              return walletPaymentNewSessionToken.success(value);
            } else {
              return walletPaymentNewSessionToken.failure({
                ...getGenericError(new Error(`Error: ${status}`))
              });
            }
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletPaymentNewSessionToken.failure({ ...getNetworkError(e) }));
  }
}
