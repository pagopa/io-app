import { AppStateStatus } from "react-native";
import {
  call,
  fork,
  put,
  select,
  take,
  takeLatest
} from "typed-redux-saga/macro";
import { Action, ActionType, getType, isActionOf } from "typesafe-actions";

import { backgroundActivityTimeout } from "../../../../config";
import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import {
  resetOfflineAccessReason,
  setOfflineAccessReason
} from "../../../ingress/store/actions";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import { checkWalletInstanceStateOfflineSaga } from "../../lifecycle/saga/checkWalletInstanceStateSaga";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../store/actions/securePreferences";

/**
 * Waits for offline access before proceeding.
 * Returns immediately when an offline reason is already available;
 * otherwise waits for `setOfflineAccessReason`.
 *
 * @returns A generator that yields until offline access is active.
 */
export function* waitForOfflineAccess() {
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);

  if (offlineAccessReason !== undefined) {
    return;
  }

  yield* take(
    (action: Action): action is ReturnType<typeof setOfflineAccessReason> =>
      isActionOf(setOfflineAccessReason, action) && action.payload !== undefined
  );
}

/**
 * Starts offline access bookkeeping and checks the valid Wallet Instance against
 * its cached Status List after device-offline access begins.
 */
export function* watchItwOfflineSaga() {
  /**
   * Handles the offline access counter reset by listening for the wallet
   * instance status store success actions.
   *
   * The offline access counter is reset when the wallet instance status is updated
   * successfully, indicating that the user has returned online and the wallet instance
   * stattus is refreshed.
   */
  yield* takeLatest(
    getType(itwUpdateWalletInstanceStatus.success),
    function* () {
      yield* put(itwOfflineAccessCounterReset());
    }
  );

  // Wait for offline access signal before proceeding with offline access logic
  yield* waitForOfflineAccess();

  // Check the valid Wallet Instance against its cached Status List after
  // device-offline access begins
  yield* call(checkWalletInstanceStateOfflineSaga);
  // Increment the offline access counter to indicate that the user has accessed
  // the app in offline mode.
  yield* put(itwOfflineAccessCounterUp());
  // Start watching for background activity to reset offline access if the app
  // is in the background for too long
  yield* fork(watchOfflineWalletBackgroundActivity);
}

/**
 * Watches for changes in the application state and resets the offline access reason
 * if the app goes to the background for a certain amount of time.
 */
function* watchOfflineWalletBackgroundActivity() {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // eslint-disable-next-line functional/no-let
  let lastState = {
    appState: "active" as AppStateStatus,
    timestamp: 0
  };

  yield* takeLatest(
    getType(applicationChangeState),
    function* (action: ActionType<typeof applicationChangeState>) {
      const startupStatus = yield* select(isStartupLoaded);

      // Do nothing if the app is not in offline mode
      if (startupStatus !== StartupStatusEnum.OFFLINE) {
        return;
      }

      // Listen for changes in application state
      const newApplicationState: AppStateStatus = action.payload;
      // When the app goes to the background, we store the last state
      // and the timestamp
      if (newApplicationState !== "active") {
        lastState = {
          appState: newApplicationState,
          timestamp: Date.now()
        };
        return;
      }

      // When the app comes back to the foreground,
      // we check if the time since the last state change is greater than
      // the background activity timeout.
      if (lastState.appState !== "active" && newApplicationState === "active") {
        const currentTimestamp = Date.now();
        const timeSinceLastStateChange = currentTimestamp - lastState.timestamp;

        // Update the last state
        lastState = {
          appState: newApplicationState,
          timestamp: Date.now()
        };

        // If the time since the last state change is greater than the
        // background activity timeout, we reset the offline app
        if (timeSinceLastStateChange >= backgroundActivityTimeoutMillis) {
          // Reset the offline access reason.
          // Since this state is `undefined` when the user is online,
          // the startup saga will proceed without blocking.
          yield* put(resetOfflineAccessReason());
          // Dispatch this action to mount the correct navigator.
          yield* put(startupLoadSuccess(StartupStatusEnum.INITIAL));
          // restart startup saga
          yield* put(startApplicationInitialization());
        }
      }
    }
  );
}
