import { AppState, type NativeEventSubscription } from "react-native";
import { type Middleware } from "redux";

const REDUX_PERSIST_ACTION_PREFIX = "persist/";

/**
 * Defers redux-persist and saga startup until the app first becomes active.
 *
 * Expo headless tasks evaluate the app entry point while the device may be
 * locked. redux-persist v5 starts automatically when `persistStore` is called,
 * which can access secure storage before protected data is available. This gate
 * keeps the plain Redux store available while blocking persistence side effects
 * until the app is foregrounded.
 */
export const createReduxStartupGate = () => {
  // eslint-disable-next-line functional/no-let
  let isGateOpen = false;
  const middleware: Middleware = () => next => action => {
    const actionType = (action as { type?: unknown }).type;
    // ponytail: redux-persist v5 has no manualPersist; remove this gate after upgrading to v6.
    if (
      !isGateOpen &&
      typeof actionType === "string" &&
      actionType.startsWith(REDUX_PERSIST_ACTION_PREFIX)
    ) {
      return action;
    }
    return next(action);
  };

  const startWhenAppIsActive = (startPersistenceAndSagas: () => void) => {
    // eslint-disable-next-line functional/no-let, prefer-const -- assigned after startOnce closes over it
    let appStateSubscription: NativeEventSubscription | undefined;
    const startOnce = () => {
      if (isGateOpen) {
        return;
      }
      isGateOpen = true;
      appStateSubscription?.remove();
      startPersistenceAndSagas();
    };

    appStateSubscription = AppState.addEventListener("change", appState => {
      if (appState === "active") {
        startOnce();
      }
    });
    if (AppState.currentState === "active") {
      startOnce();
    }
  };

  return { middleware, startWhenAppIsActive };
};
