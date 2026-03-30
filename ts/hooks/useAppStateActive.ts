import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * A hook that executes a callback function when the app state changes to 'active'.
 *
 * @param onActive - The function to call when the app becomes active.
 */
export const useAppStateActive = (onActive: () => void): void => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (appState.current.match(/active/)) {
      onActive();
    }

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          onActive();
        }
        // eslint-disable-next-line functional/immutable-data
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [onActive]);
};
