import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { applicationChangeState } from "../../../../store/actions/application";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { itwDebugReset } from "../store/actions";
import { itwDebugSavedCredentialsSelector } from "../store/selectors";

/**
 * Restores real credentials after a playground status override.
 *
 * Status overrides are meant to be temporary playground state. The original
 * credentials are restored when the app leaves the foreground and also at boot
 * in case the process was killed before the background transition completed.
 */
export function* restoreItwDebugCredentialStatusOverrides(): SagaIterator {
  const savedCredentials = yield* select(itwDebugSavedCredentialsSelector);

  if (savedCredentials === undefined) {
    return;
  }

  const credentials = Object.values(savedCredentials);

  if (credentials.length > 0) {
    yield* put(itwCredentialsStore(credentials));
  }

  yield* put(itwDebugReset());
}

function* handleApplicationStateChange(
  action: ActionType<typeof applicationChangeState>
): SagaIterator {
  if (action.payload === "active") {
    return;
  }

  yield* call(restoreItwDebugCredentialStatusOverrides);
}

/**
 * Restores temporary playground status overrides at boot and watches app
 * lifecycle changes to keep them limited to the current foreground session.
 */
export function* watchItwDebugCredentialStatusOverrides(): SagaIterator {
  yield* call(restoreItwDebugCredentialStatusOverrides);

  yield* takeLatest(
    getType(applicationChangeState),
    handleApplicationStateChange
  );
}
