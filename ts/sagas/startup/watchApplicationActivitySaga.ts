import { AppStateStatus } from "react-native";
import { call, fork, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { backgroundActivityTimeout } from "../../config";
import NavigationService from "../../navigation/NavigationService";
import { applicationChangeState } from "../../store/actions/application";
import { identificationRequest } from "../../features/identification/store/actions";
import { ReduxSagaEffect } from "../../types/utils";
import {
  StartupStatusEnum,
  isStartupLoaded
} from "../../store/reducers/startup";
import { maybeHandlePendingBackgroundActions } from "../../features/pushNotifications/sagas/common";
import { areTwoMinElapsedFromLastActivity } from "../../features/authentication/fastLogin/store/actions/sessionRefreshActions";
import { isFastLoginEnabledSelector } from "../../features/authentication/fastLogin/store/selectors";
import { IdentificationBackActionType } from "../../features/identification/store/reducers";

/**
 * Listen to APP_STATE_CHANGE_ACTION and:
 * - if needed, force the user to identify
 * - if a notification is pressed, redirect to the related message
 */
export function* watchApplicationActivitySaga(): IterableIterator<ReduxSagaEffect> {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // eslint-disable-next-line functional/no-let
  let lastState = {
    appState: "active" as AppStateStatus,
    timestamp: 0
  };

  yield* takeLatest(
    getType(applicationChangeState),
    function* (action: ActionType<typeof applicationChangeState>) {
      // Listen for changes in application state
      const newApplicationState: AppStateStatus = action.payload;

      const startupState = yield* select(isStartupLoaded);

      if (startupState !== StartupStatusEnum.AUTHENTICATED) {
        // The app is not authenticated, or is starting do nothing
        // We don't want to ask for identification when the user is not authenticated
        return;
      }

      // Be aware not to block the code flow is the newApplicationState
      // is 'active', since it is used later in the
      // 'handlePendingMessageStateIfAllowed' to check for an app
      // opening from a push notification received while the application
      // was in the background state
      if (newApplicationState !== "active") {
        lastState = {
          appState: newApplicationState,
          timestamp: Date.now()
        };
        return;
      }

      if (lastState.appState !== "active" && newApplicationState === "active") {
        yield* fork(maybeHandlePendingBackgroundActions);

        // Screens requiring identification when the app pass from background/inactive to active state
        const whiteList: ReadonlyArray<string> = [];

        const currentRoute: ReturnType<
          typeof NavigationService.getCurrentRouteName
        > = yield* call(NavigationService.getCurrentRouteName);
        const isSecuredRoute =
          // eslint-disable-next-line sonarjs/no-empty-collection
          currentRoute && whiteList.indexOf(currentRoute) !== -1;
        if (isSecuredRoute) {
          /**
           * Request always identification to display again screens included in the witheList.
           * It is done on status change from active/inactive to background to avoid secured
           * screen being displayed for a while before the IdentificationScreen when the user
           * focuses again on the app
           */
          yield* put(
            identificationRequest(
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              IdentificationBackActionType.CLOSE_APP
            )
          );
        } else {
          const currentTimestamp = Date.now();
          const timeSinceLastStateChange =
            currentTimestamp - lastState.timestamp;

          // Update the last state
          lastState = {
            appState: newApplicationState,
            timestamp: Date.now()
          };
          if (timeSinceLastStateChange >= backgroundActivityTimeoutMillis) {
            const isFastLoginEnabled = yield* select(
              isFastLoginEnabledSelector
            );
            // this dispatch will be used to determine whether or not to refresh the session
            if (isFastLoginEnabled) {
              yield* put(
                areTwoMinElapsedFromLastActivity({ hasTwoMinPassed: true })
              );
            }
            // The app was in background for a long time, request identification
            yield* put(
              identificationRequest(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                IdentificationBackActionType.CLOSE_APP
              )
            );
            // refresh session token
          }
        }
      }
    }
  );
}
