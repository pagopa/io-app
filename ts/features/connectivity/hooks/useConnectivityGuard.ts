import { useCallback } from "react";
import { useIOSelector } from "../../../store/hooks";
import { isConnectedSelector } from "../store/selectors";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";

type ConnectivityCheckFunction<T> = (...args: Array<T>) => void | Promise<void>;

/**
 * A hook that executes a function if there is connectivity, otherwise navigates to NoConnectivityScreen.
 * Use this hook to wrap functions that require an internet connection to work.
 *
 * @example
 * ```typescript
 * const yourFunctionWithConnectivity = useConnectivityGuard(yourFunction);
 * ```
 *
 * @param fn The function to execute when there is connectivity
 * @returns A wrapped function that either executes the provided function or navigates to NoConnectivityScreen
 */
export const useConnectivityGuard = <T>(fn: ConnectivityCheckFunction<T>) => {
  const isConnected = useIOSelector(isConnectedSelector);
  const navigation = useIONavigation();

  return useCallback(
    (...args: Array<T>) => {
      if (!isConnected) {
        navigation.navigate(ROUTES.NO_CONNECTIVITY);
        return;
      }

      return fn(...args);
    },
    [isConnected, navigation, fn]
  );
};
