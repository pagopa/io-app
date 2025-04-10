import { useIOToast } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import { OfflineAccessReasonEnum } from "../features/ingress/store/reducer";
import { offlineAccessReasonSelector } from "../features/ingress/store/selectors";
import I18n from "../i18n";
import { useIONavigation } from "../navigation/params/AppParamsList";
import ROUTES from "../navigation/routes";
import { useIOSelector } from "../store/hooks";
import {
  trackItwContentNotAvailable,
  trackItwOfflineActionNotAllowed
} from "../features/itwallet/analytics";

/**
 * The type of offline guard to use.
 * - `screen`: Navigate to the OfflineFailureScreen - Use this if the wrapped function triggers
 *    a navigation to a screen that requires an internet connection or a valid session to work.
 * - `toast`: Show a toast - Use this if the wrapped function trigger a network request that requires
 *   a valid sessino to work.
 */
export type OfflineGuardType = "screen" | "toast";

/**
 * Options for the offline guard.
 * - `type`: The type of guard to apply: "screen" (default) or "toast"
 * - `reasons`: The reasons for which the guard should be applied. Default is all offline reasons.
 */
export type OfflineGuardOptions = {
  type?: OfflineGuardType;
  reasons?: ReadonlyArray<OfflineAccessReasonEnum>;
};

/**
 * A hook that checks offline status before executing a function.
 * If there is no connectivity or a valid session is missing, it either navigates to OfflineFailureScreen
 * or shows a toast based on the specified guard type.
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
 * @param options The options for the offline guard
 * @returns A wrapped function that either executes the provided function (when online)
 *          or performs the fallback action based on the specified guard type (when offline)
 */
export const useOfflineGuard = <TArgs extends Array<any>, TReturn>(
  fn: (...args: TArgs) => TReturn,
  options: OfflineGuardOptions = {}
) => {
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const navigation = useIONavigation();
  const toast = useIOToast();
  const { name } = useRoute();
  const { type = "screen", reasons = Object.values(OfflineAccessReasonEnum) } =
    options;

  /**
   * The function that will be executed if there is no connectivity.
   */
  const guardFn = useCallback(() => {
    if (type === "screen") {
      navigation.navigate(ROUTES.OFFLINE_FAILURE);
      trackItwContentNotAvailable();
    } else if (type === "toast") {
      toast.error(I18n.t("global.offline.toast"));
      trackItwOfflineActionNotAllowed({
        screen: name
      });
    }
    return undefined as unknown as TReturn;
  }, [name, navigation, toast, type]);

  return pipe(
    offlineAccessReason,
    O.fromNullable,
    O.map(reason => reasons.includes(reason)),
    O.map(isOffline => (isOffline ? guardFn : fn)),
    O.getOrElse(() => fn)
  );
};
