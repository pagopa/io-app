import {
  TypeofApiCall,
  TypeofApiParams
} from "@pagopa/ts-commons/lib/requests";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { getGenericError } from "../../../../utils/errors";
import { getOrFetchPagoPaPlatformSessionToken } from "../saga/handlePaymentsSessionToken";

type TokenKey = "pagoPAPlatformSessionToken" | "bearerAuth" | "Authorization";

/** Handler to inject the session token in the request
 * - Biz events uses "Authorization" as token key
 * - Wallet uses "bearerAuth" as token key
 * - E-commerce uses "pagoPAPlatformSessionToken" as token key
 * @param apiFunction the API function to call
 * @param failureAction the action to dispatch in case of failure
 * @param requestBody the request body to send to the API
 * @param tokenKey the key of the token in the request body
 * */
export function* withPaymentsSessionToken<T>(
  apiFunction: TypeofApiCall<T>,
  failureAction: (error: any) => ActionType<any>,
  requestBody: Omit<TypeofApiParams<T>, TokenKey>,
  tokenKey?: keyof TypeofApiParams<T> & TokenKey
) {
  // Get the session token
  const sessionToken = yield* getOrFetchPagoPaPlatformSessionToken();

  // If token is missing, dispatch failure action and return a dummy function
  if (sessionToken === undefined) {
    yield* put(
      failureAction({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return undefined;
  }

  // If the token key is missing, call the api function without the token
  if (tokenKey === undefined) {
    return apiFunction(requestBody as TypeofApiParams<T>);
  }

  // Creates the request with the token injected
  const requestWithToken = {
    ...requestBody,
    [tokenKey]: sessionToken
  } as TypeofApiParams<T>;

  return apiFunction(requestWithToken);
}
