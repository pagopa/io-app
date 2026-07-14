import { useRoute } from "@react-navigation/native";
import { useEffect } from "react";

import { useIOSelector } from "../../../../store/hooks";
import { trackContentNotAvailable } from "../../../../utils/analytics";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";

/**
 * Returns true when the screen should be replaced with the offline failure view,
 * and tracks the analytics event (`trackContentNotAvailable`) when offline.
 *
 * Offline is defined as:
 * 1. `isConnected` is `false` or `undefined` (connectivity unknown or absent).
 * 2. `offlineAccessReason` is set (e.g. session expired), regardless of connectivity.
 *
 * Must be called inside a screen registered in a navigator (requires `useRoute`).
 */
export const useOfflineFailureScreen = () => {
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const isConnected = useIOSelector(isConnectedSelector);
  const { name } = useRoute();

  const isOffline = offlineAccessReason !== undefined || !isConnected;

  useEffect(() => {
    if (isOffline) {
      trackContentNotAvailable(name);
    }
  }, [name, isOffline]);

  return isOffline;
};
