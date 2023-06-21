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
import { apiUrlPrefix, fastLoginMaxRetries } from "../../../config";
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
  status: "in-progress" | "success" | "max-retries" | "session-expired";
  error: string | undefined;
};

const MAX_RETRIES = fastLoginMaxRetries;

function* doRefreshTokenSaga() {
  const nonceClient = createNonceClient(apiUrlPrefix);

  // eslint-disable-next-line functional/no-let
  const requestState: RequestStateType = {
    counter: 0,
    status: "in-progress",
    error: undefined
  };

  while (requestState.status === "in-progress") {
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
        requestState.status = "success";

        // FIX ME: replace the token response type with the correct one.
        // Jira: https://pagopa.atlassian.net/browse/IOPID-264

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

  // TODO: differentiate between the two error types
  // Jira: https://pagopa.atlassian.net/browse/IOPID-316
  if (
    requestState.status === "session-expired" ||
    requestState.status === "max-retries"
  ) {
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
  const errorDescription: FastLoginTokenRefreshError = pipe(
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

  if (errorDescription.status === 403) {
    // eslint-disable-next-line functional/immutable-data
    requestState.status = "session-expired";
    return;
  }

  if (requestState.counter === MAX_RETRIES - 1) {
    // eslint-disable-next-line functional/immutable-data
    requestState.status = "max-retries";
    return;
  }

  // eslint-disable-next-line functional/immutable-data
  requestState.status = "in-progress";
  // eslint-disable-next-line functional/immutable-data
  requestState.counter++;
};

type FastLoginTokenRefreshError = {
  status?: number;
  description: string;
};
