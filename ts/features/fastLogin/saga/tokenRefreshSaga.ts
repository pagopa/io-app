import { SagaIterator } from "redux-saga";
import { put, take, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import {
  askUserToRefreshSessionToken,
  refreshSessionToken
} from "../../../store/actions/authentication";
import { SessionToken } from "../../../types/SessionToken";
import { identificationRequest } from "../../../store/actions/identification";
import { startApplicationInitialization } from "../../../store/actions/application";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";

export function* watchTokenRefreshSaga(): SagaIterator {
  yield* takeLatest(refreshSessionToken.request, handleRefreshSessionToken);
}

function* handleRefreshSessionToken(
  _: ReturnType<typeof refreshSessionToken.request>
) {
  yield* put(askUserToRefreshSessionToken.request());
  const userAnswerAction = yield* take(
    getType(askUserToRefreshSessionToken.success)
  );
  const typedAction = userAnswerAction as ReturnType<
    typeof askUserToRefreshSessionToken.success
  >;
  if (typedAction.payload === "yes") {
    yield* doRefreshTokenSaga();
  } else {
    // Lock the app
    NavigationService.navigate(ROUTES.MESSAGES_HOME);
    yield* put(identificationRequest());
  }
}

function* doRefreshTokenSaga() {
  // FIXME: This is a mock, we should call the backend to refresh the token
  const newToken = "FOOBEERBAR" as SessionToken;
  yield* put(refreshSessionToken.success(newToken));
  // Reinit all backend clients to use the new token
  yield* put(startApplicationInitialization({ handleSessionExpiration: true }));
  return newToken;
}
