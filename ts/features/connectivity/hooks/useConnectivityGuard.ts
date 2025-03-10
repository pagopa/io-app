import { useIOToast } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIOSelector } from "../../../store/hooks";
import { isConnectedSelector } from "../store/selectors";

/**
 * The type of connectivity guard to use.
 * - `screen`: Navigate to the NoConnectivityScreen - Use this if the wrapped function triggers
 *    a navigation to a screen that requires an internet connection to work.
 * - `toast`: Show a toast - Use this if the wrapped function trigger a network request
 */
export type ConnectivityGuardType = "screen" | "toast";

/**
 * A hook that checks connectivity before executing a function.
 * If there is no connectivity, it either navigates to NoConnectivityScreen or shows a toast
 * based on the specified guard type.
 *
 * @example
 * ```typescript
 * // Navigate to NO_CONNECTION screen when offline
 * const navigateWithConnectivity = useConnectivityGuard(navigateToProtectedScreen);
 *
 * // Show toast when offline
 * const fetchWithConnectivity = useConnectivityGuard(fetchData, "toast");
 * ```
 *
 * @param fn The function to execute when there is connectivity
 * @param type The type of guard to apply: "screen" (default) or "toast"
 * @returns A wrapped function that either executes the provided function (when online)
 *          or performs the fallback action based on the specified guard type (when offline)
 */
export const useConnectivityGuard = (
  fn: (...args: Array<any>) => void | Promise<void>,
  type: ConnectivityGuardType = "screen"
) => {
  const isConnected = useIOSelector(isConnectedSelector);
  const navigation = useIONavigation();
  const toast = useIOToast();

  /**
   * The function that will be executed if there is no connectivity.
   */
  const guardFn = useCallback(() => {
    if (type === "screen") {
      navigation.navigate(ROUTES.NO_CONNECTION);
    } else if (type === "toast") {
      toast.error(I18n.t("global.noConnection.toast"));
    }
  }, [navigation, toast, type]);

  return isConnected ? fn : guardFn;
};
