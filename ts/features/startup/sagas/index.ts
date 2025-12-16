import { delay, put, select } from "typed-redux-saga/macro";
import { startApplicationInitialization } from "../../../store/actions/application";
import {
  StartupTransientError,
  startupTransientErrorSelector
} from "../../../store/reducers/startup";
import { WAIT_INITIALIZE_SAGA } from "../../../sagas/startup";
import { startupTransientError } from "../../../store/actions/startup";
import {
  trackGetProfileEndpointTransientError,
  trackGetSessionEndpointTransientError
} from "../analytics";

const STARTUP_TRANSIENT_ERROR_MAX_RETRIES = 3;

type StartupTransientErrorKind = Exclude<
  StartupTransientError["kind"],
  "NOT_SET"
>;

export function* handleApplicationStartupTransientError(
  kind: StartupTransientErrorKind
) {
  const transientError: StartupTransientError = yield* select(
    startupTransientErrorSelector
  );

  const isSessionRetriesWithinLimit =
    transientError.getSessionRetries < STARTUP_TRANSIENT_ERROR_MAX_RETRIES;
  const isProfileRetriesWithinLimit =
    transientError.getProfileRetries < STARTUP_TRANSIENT_ERROR_MAX_RETRIES;

  if (!isSessionRetriesWithinLimit || !isProfileRetriesWithinLimit) {
    yield* handleMaxRetriesReached(kind);
    return;
  }

  yield* handleRetry(kind, transientError);
}

function* handleRetry(
  kind: StartupTransientErrorKind,
  transientError: StartupTransientError
) {
  const updateErrorAction = getUpdateErrorAction(kind, transientError);

  yield* put(updateErrorAction);
  yield* delay(WAIT_INITIALIZE_SAGA);
  yield* put(startApplicationInitialization());
}

function getUpdateErrorAction(
  kind: StartupTransientErrorKind,
  transientError: StartupTransientError
) {
  const getSessionRetries =
    kind === "GET_SESSION_DOWN" ? transientError.getSessionRetries + 1 : 0;
  const getProfileRetries =
    kind === "GET_PROFILE_DOWN" ? transientError.getProfileRetries + 1 : 0;

  return startupTransientError({
    kind,
    getSessionRetries,
    getProfileRetries,
    showError: false
  });
}

function* handleMaxRetriesReached(kind: StartupTransientErrorKind) {
  if (kind === "GET_SESSION_DOWN") {
    void trackGetSessionEndpointTransientError();
  } else if (kind === "GET_PROFILE_DOWN") {
    void trackGetProfileEndpointTransientError();
  }

  yield* put(
    startupTransientError({
      kind,
      getSessionRetries: 0,
      getProfileRetries: 0,
      showError: true
    })
  );
}
