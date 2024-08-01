import { put, select, take } from "typed-redux-saga/macro";
import { isAutomaticSessionRefreshEnabledSelector } from "../../features/fastLogin/store/selectors";
import { refreshSessionToken } from "../../features/fastLogin/store/actions/tokenRefreshActions";
import { identificationSuccess } from "../../store/actions/identification";

/**
 * This function is called to regenerate the session token
 * when a user returns the app to the foreground after
 * holding the app for at least 2 minutes in the background
 */
export function* refreshSessionTokenAfterTwoMinBackgroundSaga(): Generator {
  const isAutomaticSessionRefreshEnabled = yield* select(
    isAutomaticSessionRefreshEnabledSelector
  );
  // if the session refresh feature is active,
  if (isAutomaticSessionRefreshEnabled) {
    // after successful identification process,
    yield* take(identificationSuccess);
    // the regeneration of the session token will be performed.
    yield* put(
      refreshSessionToken.request({
        withUserInteraction: false,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  }
}
