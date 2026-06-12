import * as E from "fp-ts/lib/Either";
import { call, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import {
  RefreshThirdPartyApiCallOptions,
  ThirdPartyTokenError,
  withThirdPartyRefreshApiCall
} from "../../../authentication/fastLogin/saga/utils";
import { PagoPaClient } from "../../common/api/client";
import {
  paymentsGetPagoPaPlatformSessionTokenAction,
  savePaymentsPendingAction
} from "../store/actions";
import { selectPagoPaPlatformSessionToken } from "../store/selectors";

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

  const { success } = yield* race({
    success: take(paymentsGetPagoPaPlatformSessionTokenAction.success),
    failure: take(paymentsGetPagoPaPlatformSessionTokenAction.failure)
  });

  if (!success) {
    throw new Error("Failed to retrieve the PagoPA session token");
  }

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
      withThirdPartyRefreshApiCall,
      newSessionTokenRequest,
      { action } as RefreshThirdPartyApiCallOptions
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
    if (!(e instanceof ThirdPartyTokenError)) {
      yield* put(
        paymentsGetPagoPaPlatformSessionTokenAction.failure({
          ...getNetworkError(e)
        })
      );
    }
  }
}
