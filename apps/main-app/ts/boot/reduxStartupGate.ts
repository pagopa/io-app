import { AppState, type NativeEventSubscription } from "react-native";
import { type Middleware } from "redux";

const REDUX_PERSIST_ACTION_PREFIX = "persist/";

/**
 * Creates a one-shot gate that defers redux-persist and saga startup until the
 * app first becomes active.
 *
 * Expo headless tasks evaluate the app entry point while the device may be
 * locked. redux-persist v5 starts automatically when `persistStore` is called,
 * which can access secure storage before protected data is available. This gate
 * keeps the plain Redux store available by blocking only `persist/*` actions.
 * All other Redux actions continue through the middleware normally.
 *
 * Call `startWhenAppIsActive` once after store creation. On the first active
 * state it opens the middleware gate, removes its AppState listener, then runs
 * the supplied persistence and saga startup callback exactly once.
 *
 * @returns The middleware to register first and the function that schedules
 * deferred startup.
 */
export const createReduxStartupGate = () => {
  // Shared by the middleware and AppState callback so opening the gate also
  // allows redux-persist's deferred actions through the existing store.
  // eslint-disable-next-line functional/no-let
  let isGateOpen = false;

  /**
   * Blocks redux-persist lifecycle actions until the startup gate opens.
   */
  const middleware: Middleware = () => next => action => {
    const actionType = (action as { type?: unknown }).type;
    // TODO: redux-persist v5 has no manualPersist; remove this gate after (if ever) upgrading to v6.
    if (
      !isGateOpen &&
      typeof actionType === "string" &&
      actionType.startsWith(REDUX_PERSIST_ACTION_PREFIX)
    ) {
      // Skipping next prevents redux-persist from reaching protected storage.
      return action;
    }
    return next(action);
  };

  /**
   * Opens the gate and starts persistence and sagas on the first active state.
   */
  const startWhenAppIsActive = (startPersistenceAndSagas: () => void) => {
    // eslint-disable-next-line functional/no-let, prefer-const -- assigned after startOnce closes over it
    let appStateSubscription: NativeEventSubscription | undefined;
    const startOnce = () => {
      if (isGateOpen) {
        return;
      }
      // Open first so synchronous persist actions dispatched by the callback
      // are allowed through the middleware.
      isGateOpen = true;
      appStateSubscription?.remove();
      startPersistenceAndSagas();
    };

    // Subscribe before checking currentState to avoid missing a transition to
    // active between the initial check and listener registration.
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
