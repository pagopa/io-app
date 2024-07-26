import { Validation } from "io-ts";
import {
  TypeofApiCall,
  TypeofApiParams,
  TypeofApiResponse
} from "@pagopa/ts-commons/lib/requests";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";

import { getOrFetchPagoPaPlatformSessionToken } from "../saga/handlePaymentsSessionToken";
import { Action } from "../../../../store/actions/types";
import { paymentsResetPagoPaPlatformSessionTokenAction } from "../store/actions";

type TokenKey = "pagoPAPlatformSessionToken" | "Authorization";

/**
 * This handler injects the session token in the request body and calls the API function.
 * It also handles the case of a 401 response, resetting the session token and retrying the request.
 * - Biz events uses "Authorization" as token key
 * - Wallet & E-commerce uses "pagoPAPlatformSessionToken" as token key
 * @param apiFunction the API function to call
 * @param failureAction the action to dispatch in case of failure
 * @param requestBody the request body to send to the API
 * @param tokenKey the key of the token in the request body
 *
 * */
export function* withPaymentsSessionToken<T>(
  apiFunction: TypeofApiCall<T>,
  action: Action,
  requestBody: Omit<TypeofApiParams<T>, TokenKey>,
  tokenKey?: keyof TypeofApiParams<T> & TokenKey
) {
  // Get the session token
  const sessionToken = yield* getOrFetchPagoPaPlatformSessionToken(action);

  // eslint-disable-next-line functional/no-let
  let requestFunction: Promise<Validation<TypeofApiResponse<T>>>;

  // If the pagoPASessionToken is missing, return a 401 response to trigger a retry
  if (sessionToken === undefined) {
    return E.right({ status: 401 }) as Validation<TypeofApiResponse<T>>;
  } else if (tokenKey === undefined) {
    // If the token key is missing, call the api function without the token
    requestFunction = apiFunction(requestBody as TypeofApiParams<T>);
  } else {
    // Creates the request with the token injected
    const requestWithToken = {
      ...requestBody,
      [tokenKey]: sessionToken
    } as TypeofApiParams<T>;
    requestFunction = apiFunction(requestWithToken);
  }

  const response = yield* call(() => requestFunction);

  // If the response is a 401, reset the session token and retry the request
  if (E.isRight(response) && (response.right as any).status === 401) {
    yield* put(paymentsResetPagoPaPlatformSessionTokenAction());
    yield* put(action);
  }

  return response;
}
