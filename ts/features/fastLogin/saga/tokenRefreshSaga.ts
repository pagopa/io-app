import { SagaIterator } from "redux-saga";
import { call, delay, put, takeLatest } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { ValidationError } from "io-ts";
import {
  refreshSessionToken,
  sessionExpired
} from "../../../store/actions/authentication";
import { SessionToken } from "../../../types/SessionToken";
import { startApplicationInitialization } from "../../../store/actions/application";
import {
  createFastLoginClient,
  createNonceClient,
  performFastLogin,
  performGetNonce
} from "../backend";
import { apiUrlPrefix } from "../../../config";
import { SagaCallReturnType } from "../../../types/utils";
import { LollipopConfig } from "../../lollipop";
import { getKeyInfo } from "../../lollipop/saga";
import {
  FastLoginResponse,
  FastLoginResponseType,
  NonceBaseResponseType,
  NonceResponse
} from "../backend/mockedFunctionsAndTypes";

export function* watchTokenRefreshSaga(): SagaIterator {
  yield* takeLatest(refreshSessionToken.request, doRefreshTokenSaga);
}

type RequestStateType = {
  counter: number;
  success: boolean;
  error: string | undefined;
};

const MAX_RETRYES = 3;

function* doRefreshTokenSaga() {
  const nonceClient = createNonceClient(apiUrlPrefix);

  // eslint-disable-next-line functional/no-let
  const requestState: RequestStateType = {
    counter: 0,
    success: false,
    error: undefined
  };

  while (requestState.counter < MAX_RETRYES && !requestState.success) {
    const nonceResponse: SagaCallReturnType<typeof performGetNonce> =
      yield* call(performGetNonce, nonceClient);

    if (E.isRight(nonceResponse) && nonceResponse.right.status === 200) {
      const nonce = nonceResponse.right.value.nonce;
      const lollipopConfig: LollipopConfig = {
        nonce
      };

      const keyInfo = yield* call(getKeyInfo);

      const fastLoginClient = createFastLoginClient(
        apiUrlPrefix,
        keyInfo,
        lollipopConfig
      );

      const tokenResponse: SagaCallReturnType<typeof performFastLogin> =
        yield* call(performFastLogin, fastLoginClient);
      if (E.isRight(tokenResponse) && tokenResponse.right.status === 200) {
        // eslint-disable-next-line functional/immutable-data
        requestState.success = true;

        // TODO: replace the token response type with the correct one.

        const newToken = tokenResponse.right.value.token as SessionToken;
        yield* put(refreshSessionToken.success(newToken));
        // Reinit all backend clients to use the new token
        yield* put(startApplicationInitialization());
      } else {
        yield* delay(1000);
        handleRequestError(requestState, tokenResponse);
      }
    } else {
      yield* delay(1000);
      handleRequestError(requestState, nonceResponse);
    }
  }

  if (requestState.error) {
    yield* put(refreshSessionToken.failure(new Error(requestState.error)));
    yield* put(sessionExpired());
  }
}

const handleRequestError = (
  requestState: RequestStateType,
  response: E.Either<
    ReadonlyArray<ValidationError>,
    | FastLoginResponseType<FastLoginResponse>
    | NonceBaseResponseType<NonceResponse>
  >
) => {
  const errorDescription: ErrorDescription = pipe(
    response,
    E.fold(
      validationErrors => ({
        description: readableReport(validationErrors)
      }),
      ({ status }) => ({
        status,
        description: `response status ${status}`
      })
    )
  );
  // eslint-disable-next-line functional/immutable-data
  requestState.error = errorDescription.description;

  if (errorDescription.status === 403 || errorDescription.status === 401) {
    // eslint-disable-next-line functional/immutable-data
    requestState.success = true;
    return;
  }
  // eslint-disable-next-line functional/immutable-data
  requestState.counter++;
};

type ErrorDescription = {
  status?: number;
  description: string;
};
