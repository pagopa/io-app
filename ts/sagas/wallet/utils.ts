import { Option } from "fp-ts/lib/Option";
import { IResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, put, select, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { PagoPaClient } from "../../api/pagopa";
import { PagopaToken } from "../../types/pagopa";

import {
  pagoPaTokenFailure,
  pagoPaTokenRequest,
  pagoPaTokenSuccess
} from "../../store/actions/wallet/pagopa";
import { GlobalState } from "../../store/reducers/types";
import {
  getPagoPaToken,
  isRequestingPagoPaTokenSelector
} from "../../store/reducers/wallet/pagopa";

import { SagaCallReturnType } from "../../types/utils";

// allow refreshing token this number of times
const MAX_TOKEN_REFRESHES = 2;

export function* fetchAndStorePagoPaToken(pagoPaClient: PagoPaClient) {
  yield put(pagoPaTokenRequest());

  const refreshTokenResponse: SagaCallReturnType<
    typeof pagoPaClient.getSession
  > = yield call(pagoPaClient.getSession, pagoPaClient.walletToken);

  if (
    refreshTokenResponse !== undefined &&
    refreshTokenResponse.status === 200
  ) {
    // Token fetched successfully, store it.
    yield put(pagoPaTokenSuccess(refreshTokenResponse.value.data.sessionToken));
  } else {
    yield put(pagoPaTokenFailure());
  }
}

// this function tries to carry out the provided
// request, and refreshes the pagoPA token if a 401
// is returned. Upon refreshing, it tries to
// re-fetch the contents again for a maximum of
// MAX_TOKEN_REFRESHES times.
// If the request is successful (i.e. it does not
// return a 401), the successful token is returned
// along with the response (the caller will then
// decide what to do with it)
export function* fetchWithTokenRefresh<T>(
  request: (
    pagoPaToken: PagopaToken
  ) => Promise<IResponseType<401, undefined> | undefined | T>,
  pagoPaClient: PagoPaClient,
  retries: number = MAX_TOKEN_REFRESHES
): Iterator<T | undefined | Effect> {
  if (retries === 0) {
    return;
  }

  const pagoPaToken: Option<PagopaToken> = yield select<GlobalState>(
    getPagoPaToken
  );

  if (pagoPaToken.isSome()) {
    const response: SagaCallReturnType<typeof request> = yield call(
      request,
      pagoPaToken.value
    );

    if (response === undefined) {
      return;
    }

    // BEWARE: since there is not an easy way to restrict T to an arbitrary union
    // of IResponseType(s), we kind of take a leap of faith here and assume that T
    // is always a union of IResponseType(s) together with undefined.
    if ((response as any).status !== 401) {
      // Return code is not 401, the token has been "accepted"
      // (the caller will then handle other error codes).
      return response;
    }
  }

  const isRequestingPagoPaToken: boolean = yield select(
    isRequestingPagoPaTokenSelector
  );

  if (isRequestingPagoPaToken) {
    // Wait to receive response.
    yield take(getType(pagoPaTokenSuccess));
  } else {
    // Request new token
    yield call(fetchAndStorePagoPaToken, pagoPaClient);
  }

  // Retry fetching the result.
  return yield call(fetchWithTokenRefresh, request, pagoPaClient, retries - 1);
}
