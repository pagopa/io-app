import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { useIOSelector } from "../../../../store/hooks";
import { OfflineFailureComponent } from "../../../../components/error/OfflineFailure";
import { trackContentNotAvailable } from "../../../../utils/analytics";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";

/**
 * Higher-Order Component that conditionally renders a given screen or an offline failure screen.
 *
 * This HOC determines the application's effective offline state by checking:
 * 1. If `isConnected` selector returns `false` (definitely offline).
 * 2. If `isConnected` selector returns `undefined` (connectivity is unknown).
 * 3. If `offlineAccessReason` selector returns a defined reason (e.g., session expired),
 * even if `isConnected` might be `true`.
 *
 * If any of these conditions indicate an offline or error state, the HOC renders the
 * `OfflineFailureComponent`. Otherwise (if `isConnected` is `true` and no
 * `offlineAccessReason` is present), it renders the original `Screen` component.
 *
 * The HOC also tracks an analytics event (`trackContentNotAvailable`) when the
 * offline failure screen is shown.
 *
 * @example
 * ```tsx
 * // Original screen component
 *
 * // Create an enhanced component with offline handling
 * const ProfileScreenWithOfflineFallback = withOfflineFailureScreen(MyScreen);
 *
 * // Use in navigation or component tree
 * <ProfileScreenWithOfflineFallback />
 * ```
 *
 * @param Screen - The React component to enhance with offline handling functionality.
 * @returns A new component that conditionally renders either the original `Screen`
 * or the `OfflineFailureComponent`.
 */
export const withOfflineFailureScreen =
  <P extends object>(Screen: React.ComponentType<P>) =>
  (props: P) => {
    const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
    const isConnected = useIOSelector(isConnectedSelector);
    const { name } = useRoute();

    // Determine if any offline condition is met:
    // 1. offlineAccessReason is set (e.g., "SESSION_EXPIRED")
    // OR
    // 2. !isConnected is true (meaning isConnected is false OR isConnected is undefined)
    const isOffline = offlineAccessReason !== undefined || !isConnected;

    useEffect(() => {
      if (isOffline) {
        trackContentNotAvailable(name);
      }
    }, [name, isOffline]);

    if (isOffline) {
      return <OfflineFailureComponent isHeaderVisible={true} />;
    } else {
      return <Screen {...props} />;
    }
  };
