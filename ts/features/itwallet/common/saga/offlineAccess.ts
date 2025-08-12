import { AppStateStatus } from "react-native";
import { fork, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
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
import { resetOfflineAccessReason } from "../../../ingress/store/actions";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../store/actions/securePreferences";

/**
 * Handles the offline access counter reset by listening for the wallet
 * instance status store success actions.
 *
 * The offline access counter is reset when the wallet instance status is updated
 * successfully, indicating that the user has returned online and the wallet instance
 * stattus is refreshed.
 */
function* handleItwOfflineAccessCounterReset() {
  yield* put(itwOfflineAccessCounterReset());
}

/**
 * Increments the offline access counter if the startup status is OFFLINE.
 *
 * @param startupStatus - The current startup status of the application.
 */
function* handleItwOfflineAccessCounterUp(startupStatus: StartupStatusEnum) {
  if (startupStatus === StartupStatusEnum.OFFLINE) {
    yield* put(itwOfflineAccessCounterUp());
  }
}

/**
 * Increments the offline access counter if the startup status is OFFLINE.
 * It also listens for the startup load success action with the OFFLINE status
 * to increment the counter.
 */
function* watchItwOfflineAccessCounterUp() {
  yield* takeLatest(
    getType(startupLoadSuccess),
    function* (action: ActionType<typeof startupLoadSuccess>) {
      yield* handleItwOfflineAccessCounterUp(action.payload);
    }
  );

  const startupStatus = yield* select(isStartupLoaded);
  yield* handleItwOfflineAccessCounterUp(startupStatus);
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

/**
 * Watch actions that trigger the offline access counter reset.
 */
export function* watchItwOfflineAccess() {
  yield* takeLatest(
    getType(itwUpdateWalletInstanceStatus.success),
    handleItwOfflineAccessCounterReset
  );

  yield* fork(watchItwOfflineAccessCounterUp);
  yield* fork(watchOfflineWalletBackgroundActivity);
}
