import { useIOToast } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { offlineAccessReasonSelector } from "../features/ingress/store/selectors";
import { useIOSelector } from "../store/hooks";
import { trackOfflineActionNotAllowed } from "../utils/analytics.ts";
import { isConnectedSelector } from "../features/connectivity/store/selectors";

/**
 * A hook that checks for a general offline or error state before executing a function.
 * If any offline condition is met (no internet, unknown connectivity, or a specific
 * session/access reason is present), it shows a toast error message and does not
 * execute the provided function.
 *
 * The toast is shown if:
 * - `isConnected` selector returns `false` (definitely offline).
 * - `isConnected` selector returns `undefined` (connectivity unknown).
 * - `offlineAccessReason` selector returns a defined reason (e.g., session expired),
 * even if `isConnected` is `true`.
 *
 * The provided function `fn` is executed only if `isConnected` is `true` AND
 * `offlineAccessReason` is `undefined`.
 *
 * @example
 * ```typescript
 * // Create a guarded action. The toast will show if any offline condition is detected.
 * const guardedAction = useOfflineToastGuard(performSomeAction);
 *
 * // Call the guarded action
 * guardedAction(arg1, arg2); // performSomeAction will only run if online and no issues.
 * ```
 *
 * @param fn The function to execute when the application is determined to be online
 * and no specific offline access reasons are present.
 * @returns A wrapped function that either executes the provided function
 * or shows a toast error message and returns `undefined`.
 */
export const useOfflineToastGuard = (fn: (...args: Array<any>) => any) => {
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const isConnected = useIOSelector(isConnectedSelector);
  const toast = useIOToast();
  const { name } = useRoute();

  const guardFn = useCallback(() => {
    toast.error(I18n.t("global.offline.toast"));
    trackOfflineActionNotAllowed(name);
    return undefined;
  }, [name, toast]);

  // Determine if any offline condition is met:
  // 1. offlineAccessReason is set (e.g., "SESSION_EXPIRED")
  // OR
  // 2. !isConnected is true (meaning isConnected is false OR isConnected is undefined)
  const isOffline = offlineAccessReason !== undefined || !isConnected;

  return (...args: Array<any>) => (isOffline ? guardFn() : fn(...args));
};
