import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { PagoPaClient } from "../../common/api/client";
import {
  paymentsGetPagoPaPlatformSessionTokenAction,
  savePaymentsPendingAction
} from "../store/actions";
import { selectPagoPaPlatformSessionToken } from "../store/selectors";

export type PaymentsFetchPagoPaSessionTokenResponse = {
  refreshed: boolean;
  token?: string;
};

/**
 * Retrieves the PagoPA session token from the Redux store.
 * If the token is not present, this function dispatches a request action
 * and stores the original action that triggered the request in order to
 * resume it once the token is available.
 *
 * @returns The PagoPA session token if available, otherwise undefined.
 */
export function* getOrFetchPagoPaPlatformSessionToken(action: ActionType<any>) {
  // Attempt to retrieve the session token from the Redux store
  const sessionToken: ReturnType<typeof selectPagoPaPlatformSessionToken> =
    yield* select(selectPagoPaPlatformSessionToken);

  // If the session token is already present in the store, return it
  if (sessionToken) {
    return sessionToken;
  }

  // Store the original action that triggered the request
  yield* put(savePaymentsPendingAction({ pendingAction: action }));

  // If the session token is not present, dispatch a new request action
  yield* put(paymentsGetPagoPaPlatformSessionTokenAction.request());

  return undefined;
}

export function* handlePaymentsSessionToken(
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
