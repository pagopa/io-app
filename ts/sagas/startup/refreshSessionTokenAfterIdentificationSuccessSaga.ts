import { put, select, take } from "typed-redux-saga/macro";
import { isAutomaticSessionRefreshEnabledSelector } from "../../features/fastLogin/store/selectors";
import { refreshSessionToken } from "../../features/fastLogin/store/actions/tokenRefreshActions";
import { identificationSuccess } from "../../store/actions/identification";

/**
 * This function is called to regenerate the session token
 * after successful identification
 */
export function* refreshSessionTokenAfterIdentificationSuccessSaga(): Generator {
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
