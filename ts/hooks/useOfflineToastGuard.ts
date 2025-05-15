import { useIOToast } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import { OfflineAccessReasonEnum } from "../features/ingress/store/reducer";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { trackOfflineActionNotAllowed } from "../utils/analytics.ts";
import { isConnectedSelector } from "../features/connectivity/store/selectors";

/**
 * Options for the offline guard.
 * - `reasons`: The specific offline reasons for which the guard should be applied. Default is all offline reasons.
 */
export type OfflineGuardOptions = {
  reasons?: ReadonlyArray<OfflineAccessReasonEnum>;
};

/**
 * A hook that checks offline status before executing a function.
 * If there is no connectivity or a valid session is missing, it shows a toast error message.
 *
 * @example
 * ```typescript
 * // Show toast when offline
 * const actionWithConnectivity = useOfflineToastGuard(performAction);
 * });
 * ```
 * @param fn The function to execute when there is connectivity
 * @returns A wrapped function that either executes the provided function (when online)
 *          or shows a toast error message (when offline)
 */
export const useOfflineToastGuard = (fn: (...args: Array<any>) => any) => {
  const isConnected = useIOSelector(isConnectedSelector);
  const toast = useIOToast();
  const { name } = useRoute();
  /**
   * The function that will be executed if there is no connectivity.
   */
  const guardFn = useCallback(() => {
    toast.error(I18n.t("global.offline.toast"));
    trackOfflineActionNotAllowed({
      screen: name
    });
    return undefined;
  }, [name, toast]);

  return (...args: Array<any>) =>
    pipe(
      !isConnected,
      O.fromNullable,
      O.map(isOffline => (isOffline ? guardFn : () => fn(...args))),
      O.getOrElse(() => fn),
      f => f(...args)
    );
};
