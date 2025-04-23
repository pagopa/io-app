import { useIOToast } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import { OfflineAccessReasonEnum } from "../features/ingress/store/reducer";
import { offlineAccessReasonSelector } from "../features/ingress/store/selectors";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { trackOfflineActionNotAllowed } from "../utils/analytics.ts";

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
 *
 * // Only guard for specific offline reasons
 * const actionWithSpecificGuard = useOfflineGuard(performAction, {
 *   reasons: [OfflineAccessReasonEnum.NO_INTERNET_CONNECTION]
 * });
 * ```
 *
 * @param fn The function to execute when there is connectivity
 * @param options Optional configuration for the offline guard
 * @returns A wrapped function that either executes the provided function (when online)
 *          or shows a toast error message (when offline)
 */
export const useOfflineToastGuard = (
  fn: (...args: Array<any>) => any,
  options: OfflineGuardOptions = {}
) => {
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const toast = useIOToast();
  const { name } = useRoute();
  const { reasons = Object.values(OfflineAccessReasonEnum) } = options;

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
      offlineAccessReason,
      O.fromNullable,
      O.map(reason => reasons.includes(reason)),
      O.map(isOffline => (isOffline ? guardFn : () => fn(...args))),
      O.getOrElse(() => fn),
      f => f(...args)
    );
};
