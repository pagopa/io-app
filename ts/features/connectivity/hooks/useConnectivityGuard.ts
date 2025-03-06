import { useIOToast } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIOSelector } from "../../../store/hooks";
import { isConnectedSelector } from "../store/selectors";

type ConnectivityCheckFunction = (...args: Array<any>) => void | Promise<void>;

/**
 * The type of connectivity guard to use.
 * - `screen`: Navigate to the NoConnectivityScreen - Use this if the wrapped function triggers a navigation to a screen that requires an internet connection to work.
 * - `toast`: Show a toast - Use this if the wrapped function trigger a network request
 */
export type ConnectivityGuardType = "screen" | "toast";

/**
 * A hook that executes a function if there is connectivity, otherwise navigates to NoConnectivityScreen.
 * Use this hook to wrap functions that trigger a navigation to screens that require an internet connection to work.
 *
 * @example
 * ```typescript
 * const yourWrappedFunction = useConnectivityGuard(yourFunction);
 * ```
 *
 * @param fn The function to execute when there is connectivity
 * @returns A wrapped function that either executes the provided function or navigates to NoConnectivityScreen
 */
export const useConnectivityGuard = (
  fn: ConnectivityCheckFunction,
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
