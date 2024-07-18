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

  if (
    transientError.getSessionRetries < STARTUP_TRANSIENT_ERROR_MAX_RETRIES &&
    transientError.getProfileRetries < STARTUP_TRANSIENT_ERROR_MAX_RETRIES
  ) {
    if (kind === "GET_SESSION_DOWN") {
      yield* put(
        startupTransientError({
          kind,
          getSessionRetries: transientError.getSessionRetries + 1,
          getProfileRetries: 0,
          showError: false
        })
      );
    } else if (kind === "GET_PROFILE_DOWN") {
      yield* put(
        startupTransientError({
          kind,
          getSessionRetries: 0,
          getProfileRetries: transientError.getProfileRetries + 1,
          showError: false
        })
      );
    }
    yield* delay(WAIT_INITIALIZE_SAGA);
    yield* put(startApplicationInitialization());
  } else {
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
}
