import { AppStateStatus } from "react-native";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { backgroundActivityTimeout } from "../../config";
import NavigationService from "../../navigation/NavigationService";
import { applicationChangeState } from "../../store/actions/application";
import { identificationRequest } from "../../store/actions/identification";
import { ReduxSagaEffect } from "../../types/utils";
import { AppState, appStateSelector } from "../../store/reducers/appState";
import {
  StartupStatusEnum,
  isStartupLoaded
} from "../../store/reducers/startup";

/**
 * Listen to APP_STATE_CHANGE_ACTION and:
 * - if needed, force the user to identify
 * - if a notification is pressed, redirect to the related message
 */
export function* watchApplicationActivitySaga(): IterableIterator<ReduxSagaEffect> {
  const backgroundActivityTimeoutMillis = backgroundActivityTimeout * 1000;

  // eslint-disable-next-line functional/no-let
  let lastState: AppState = {
    appState: "active",
    timestamp: 0
  };

  yield* takeLatest(
    getType(applicationChangeState),
    function* (action: ActionType<typeof applicationChangeState>) {
      // Listen for changes in application state
      const newApplicationState: AppStateStatus = action.payload;

      const { appState, timestamp } = yield* select(appStateSelector);
      const startupState = yield* select(isStartupLoaded);

      if (startupState !== StartupStatusEnum.AUTHENTICATED) {
        // The app is not authenticated, do nothing
        // We don't want to ask for identification when the user is not authenticated
        return;
      }

      if (timestamp === 0) {
        // The app has just started, do nothing
        // We don't want to ask for identification when the app has just started
        return;
      }

      if (appState !== "active") {
        lastState = {
          appState,
          timestamp
        };
        return;
      }

      if (lastState.appState !== "active" && newApplicationState === "active") {
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
          yield* put(identificationRequest());
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
            // The app was in background for a long time, request identification
            yield* put(identificationRequest());
          }
        }
      }
    }
  );
}
