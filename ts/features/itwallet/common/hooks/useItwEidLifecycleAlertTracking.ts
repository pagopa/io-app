import { useCallback, useMemo, useRef, useEffect } from "react";
import {
  trackITWalletBannerVisualized,
  trackItWalletBannerTap
} from "../../analytics";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum";
import { ItwJwtCredentialStatus } from "../utils/itwTypesUtils";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

type Props = {
  maybeEidStatus: ItwJwtCredentialStatus | undefined;
  navigation: ReturnType<typeof useIONavigation>;
  currentScreenName?: string;
  isOffline?: boolean;
  skipTracking?: boolean;
};

/**
 * Hook for tracking eID lifecycle alerts.
 *
 * This hook handles two types of analytics events:
 * 1. Banner visualized event: triggered the first time the alert becomes visible
 *    when the screen is focused. If the screen loses focus and regains it,
 *    the event can be retracked depending on the focus behavior.
 * 2. Banner tap event: triggered when the user tap the alert.
 *
 * If `skipTracking` is true or the eID status is valid, no tracking occurs.
 *
 * @param maybeEidStatus The current eID status
 * @param currentScreenName Optional screen name to include in tracking
 * @param isOffline Whether the app is in offline mode
 * @param skipTracking Flag to disable tracking entirely
 * @returns trackAlertTap callback to track tap interactions on the alert
 */
// eslint-disable-next-line functional/immutable-data
export const useItwEidLifecycleAlertTracking = ({
  maybeEidStatus,
  navigation,
  currentScreenName,
  isOffline = false,
  skipTracking = false
}: Props) => {
  const hasTrackedRef = useRef(false);
  const isEidInvalid =
    maybeEidStatus === "jwtExpiring" || maybeEidStatus === "jwtExpired";

  const shouldTrack = !skipTracking && isEidInvalid;

  const bannerId =
    maybeEidStatus === "jwtExpiring"
      ? "itwExpiringIdBanner"
      : "itwExpiredIdBanner";

  const alertProps = useMemo(
    () => ({
      banner_id: bannerId,
      banner_page: currentScreenName ?? "not_available",
      banner_landing: isOffline
        ? "not_available"
        : ITW_SCREENVIEW_EVENTS.ITW_ID_METHOD
    }),
    [bannerId, currentScreenName, isOffline]
  );

  useEffect(() => {
    if (!shouldTrack) {
      return;
    }
    const onFocus = () => {
      if (!hasTrackedRef.current) {
        trackITWalletBannerVisualized(alertProps);
        hasTrackedRef.current = true;
      }
    };

    const onBlur = () => {
      hasTrackedRef.current = false;
    };

    // We use navigation listeners for "focus" and "blur" here instead of "useFocusEffect"
    // because this hook may be used inside a BottomSheet. 
    const unsubscribeFocus = navigation.addListener("focus", onFocus);
    const unsubscribeBlur = navigation.addListener("blur", onBlur);

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, shouldTrack, alertProps]);

  const trackAlertTap = useCallback(() => {
    if (shouldTrack) {
      trackItWalletBannerTap(alertProps);
    }
  }, [shouldTrack, alertProps]);

  return { trackAlertTap };
};
