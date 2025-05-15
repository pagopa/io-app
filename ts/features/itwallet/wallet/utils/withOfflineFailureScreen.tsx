import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { useIOSelector } from "../../../../store/hooks.ts";
import { OfflineFailureComponent } from "../../../../components/error/OfflineFailure.tsx";
import { trackContentNotAvailable } from "../../../../utils/analytics.ts";
import { isConnectedSelector } from "../../../connectivity/store/selectors";

/**
 * Higher-Order Component that conditionally renders screens or an offline failure screen.
 *
 * This HOC checks the application's offline state using the `isConnectedSelector`.
 * When the app is online, it renders the original screen unchanged.
 * When offline, it replaces the screen entirely with the `OfflineFailureScreen` component.
 *
 * The HOC also tracks analytics when content is not available due to offline state.
 *
 * @example
 * ```tsx
 * // Create an enhanced component with offline handling
 * const ProfileScreenWithOfflineAlert = withOfflineAlert(ProfileScreen);
 *
 * // Use in navigation or component tree
 * <ProfileScreenWithOfflineAlert someProp={value} />
 * ```
 *
 * @param Screen - The React component to enhance with offline handling functionality
 * @returns A new component that conditionally renders either the original screen or the offline failure screen
 */
export const withOfflineFailureScreen =
  (Screen: React.ComponentType<any>) => (props: any) => {
    const isConnected = useIOSelector(isConnectedSelector);
    const { name } = useRoute();

    useEffect(() => {
      if (!isConnected) {
        trackContentNotAvailable({
          screen: name
        });
      }
    }, [name, isConnected]);

    return pipe(
      !isConnected,
      O.fromNullable,
      O.fold(
        () => <Screen {...props} />,
        () => <OfflineFailureComponent isHeaderVisible={true} />
      )
    );
  };
