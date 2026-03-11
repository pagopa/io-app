import { useCallback, useMemo, useRef, useEffect } from "react";
import { trackItwBannerVisualized, trackItwBannerTap } from "../../analytics";
import { ITW_IDENTIFICATION_SCREENVIEW_EVENTS } from "../../identification/analytics/enum";
import { ItwJwtCredentialStatus } from "../utils/itwTypesUtils";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

type Props = {
  isItw: boolean;
  maybeEidStatus: ItwJwtCredentialStatus | undefined;
  navigation: ReturnType<typeof useIONavigation>;
  currentScreenName?: string;
  isOffline?: boolean;
  skipViewTracking?: boolean;
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
 * Tracking rules:
 * - If `skipViewTracking` is true, only the visualized event is skipped.
 * - If the eID status is valid, no visualized event is sent.
 * - If `isItw` is true, no tracking is sent at all.
 *
 * @param isItw Whether IT Wallet is active disables tracking entirely
 * @param maybeEidStatus The current eID status
 * @param navigation Navigation object to listen for focus/blur events
 * @param skipViewTracking Flag to disable only the view tracking (visualized)
 * @param currentScreenName Optional screen name to include in tracking
 * @param isOffline Whether the app is in offline mode
 * @returns trackAlertTap callback to track tap interactions on the alert
 */
export const useItwEidLifecycleAlertTracking = ({
  isItw,
  maybeEidStatus,
  navigation,
  skipViewTracking = false,
  currentScreenName,
  isOffline = false
}: Props) => {
  const hasTrackedRef = useRef(false);
  const isEidInvalid =
    maybeEidStatus === "jwtExpiring" || maybeEidStatus === "jwtExpired";

  const shouldTrackVisualization = !skipViewTracking && isEidInvalid && !isItw;

  const trackingProperties = useMemo(
    () => ({
      banner_id:
        maybeEidStatus === "jwtExpiring"
          ? "itwExpiringIdBanner"
          : "itwExpiredIdBanner",
      banner_page: currentScreenName ?? "not_available",
      banner_landing: isOffline
        ? "not_available"
        : ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_ID_METHOD
    }),
    [maybeEidStatus, currentScreenName, isOffline]
  );

  useEffect(() => {
    if (!shouldTrackVisualization) {
      return;
    }
    const onFocus = () => {
      if (!hasTrackedRef.current) {
        trackItwBannerVisualized(trackingProperties);
        // eslint-disable-next-line functional/immutable-data
        hasTrackedRef.current = true;
      }
    };

    const onBlur = () => {
      // eslint-disable-next-line functional/immutable-data
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
  }, [navigation, shouldTrackVisualization, trackingProperties]);

  const trackAlertTap = useCallback(() => {
    if (!isItw) {
      trackItwBannerTap(trackingProperties);
    }
  }, [isItw, trackingProperties]);

  return { trackAlertTap };
};
