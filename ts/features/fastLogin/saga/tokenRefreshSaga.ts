import { SagaIterator } from "redux-saga";
import { call, delay, put, take, takeLatest } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { ValidationError } from "io-ts";
import { getType } from "typesafe-actions";
import { RequestResponseTypes } from "@pagopa/ts-commons/lib/requests";
import {
  logoutRequest,
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
  NonceBaseResponseType,
  NonceResponse
} from "../backend/mockedFunctionsAndTypes";
import {
  identificationFailure,
  identificationRequest,
  identificationSuccess
} from "../../../store/actions/identification";
import NavigationService from "../../../navigation/NavigationService";
import { FastLoginT } from "../../../../definitions/fast_login/requestTypes";
import {
  askUserToRefreshSessionToken,
  showRefreshTokenLoader,
  refreshSessionToken,
  refreshTokenTransientError,
  refreshTokenNoPinError
} from "../store/actions/tokenRefreshActions";
import { getPin } from "../../../utils/keychain";
import { dismissSupport } from "../../../utils/supportAssistance";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";

export function* watchTokenRefreshSaga(): SagaIterator {
  yield* takeLatest(refreshSessionToken.request, handleRefreshSessionToken);
}

function* handleRefreshSessionToken(
  refreshSessionTokenRequestAction: ReturnType<
    typeof refreshSessionToken.request
  >
) {
  // Dismiss Zendesk Support Screen if it is visible
  yield* call(dismissSupport);

  const isPinAvailable = O.isSome(yield* call(getPin));

  const { withUserInteraction } = refreshSessionTokenRequestAction.payload;

  if (!isPinAvailable) {
    if (withUserInteraction) {
      yield* put(refreshTokenNoPinError());
    } else {
      yield* put(logoutRequest());
    }
    return;
  }

  if (!withUserInteraction) {
    yield* call(doRefreshTokenSaga, refreshSessionTokenRequestAction);
    return;
  }

  yield* put(askUserToRefreshSessionToken.request());
  const userAnswerAction = yield* take(
    getType(askUserToRefreshSessionToken.success)
  );
  const typedAction = userAnswerAction as ReturnType<
    typeof askUserToRefreshSessionToken.success
  >;
  if (typedAction.payload === "yes") {
    yield* put(identificationRequest());
    const result = yield* take([identificationSuccess, identificationFailure]);
    if (result.type === getType(identificationSuccess)) {
      yield* call(doRefreshTokenSaga, refreshSessionTokenRequestAction);
    }
  } else {
    // Lock the app
    NavigationService.navigate(MESSAGES_ROUTES.MESSAGES_HOME);
    yield* put(identificationRequest());
  }
}

type RequestStateType = {
  counter: number;
  status: "in-progress" | "success" | "max-retries" | "session-expired";
  error: string | undefined;
};

const MAX_RETRIES = fastLoginMaxRetries;

// eslint-disable-next-line sonarjs/cognitive-complexity
function* doRefreshTokenSaga(
  refreshSessionTokenRequestAction: ReturnType<
    typeof refreshSessionToken.request
  >
) {
  const { showIdentificationModalAtStartup, showLoader } =
    refreshSessionTokenRequestAction.payload;

  if (showLoader) {
    yield* put(showRefreshTokenLoader());
  }
  const nonceClient = createNonceClient(apiUrlPrefix);

  // eslint-disable-next-line functional/no-let
  const requestState: RequestStateType = {
    counter: 0,
    status: "in-progress",
    error: undefined
  };

  while (requestState.status === "in-progress") {
    try {
      const nonceResponse = yield* call(performGetNonce, nonceClient);

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
          const newToken = tokenResponse.right.value
            .token as unknown as SessionToken;
          yield* put(refreshSessionToken.success(newToken));
          // Reinit all backend clients to use the new token
          yield* put(
            startApplicationInitialization({
              handleSessionExpiration: true,
              showIdentificationModalAtStartup
            })
          );
        } else {
          yield* delay(1000);
          handleRequestError(requestState, tokenResponse);
        }
      } else {
        yield* delay(1000);
        handleRequestError(requestState, nonceResponse);
      }
    } catch (e) {
      yield* delay(1000);
      handleRequestError(requestState);
    }
  }

  if (requestState.status === "session-expired") {
    yield* put(refreshSessionToken.failure(new Error(requestState.error)));
    yield* put(sessionExpired());
  }

  if (requestState.status === "max-retries") {
    yield* put(refreshTokenTransientError());
  }
}

const handleRequestError = (
  requestState: RequestStateType,
  response?: E.Either<
    ReadonlyArray<ValidationError>,
    RequestResponseTypes<FastLoginT> | NonceBaseResponseType<NonceResponse>
  >
) => {
  const errorDescription: FastLoginTokenRefreshError = pipe(
    response,
    O.fromNullable,
    O.fold(
      () => ({
        description: "max retries reached"
      }),
      response =>
        pipe(
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
        )
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
