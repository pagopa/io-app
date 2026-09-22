import { useCallback, useEffect, useMemo, useRef } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { trackItwBannerTap, trackItwBannerVisualized } from "../../analytics";
import { ITW_IDENTIFICATION_SCREENVIEW_EVENTS } from "../../identification/analytics/enum";
import { ItwJwtCredentialStatus } from "../utils/itwTypesUtils";

type Props = {
  currentScreenName?: string;
  isItwCredential: boolean;
  isOffline?: boolean;
  maybeEidStatus: ItwJwtCredentialStatus | undefined;
  navigation: ReturnType<typeof useIONavigation>;
  skipViewTracking?: boolean;
};

const getLifecycleBannerId = (
  status: ItwJwtCredentialStatus | undefined,
  isItwCredential: boolean
) => {
  if (isItwCredential) {
    return status === "jwtExpiring"
      ? "itwExpiringPidBanner"
      : "itwExpiredPidBanner";
  }

  return status === "jwtExpiring"
    ? "itwExpiringIdBanner"
    : "itwExpiredIdBanner";
};

/**
 * Hook for tracking eID and PID lifecycle alerts.
 *
 * This hook handles two types of analytics events:
 * 1. Banner visualized event: triggered the first time the alert becomes visible
 *    when the screen is focused. If the screen loses focus and regains it,
 *    the event can be retracked depending on the focus behavior.
 * 2. Banner tap event: triggered when the user tap the alert.
 *
 * Tracking rules:
 * - If `skipViewTracking` is true, only the visualized event is skipped.
 * - If the credential status is valid, no visualized event is sent.
 *
 * @param isItwCredential Whether the credential is an IT-Wallet PID
 * @param maybeEidStatus The current credential status
 * @param navigation Navigation object to listen for focus/blur events
 * @param skipViewTracking Flag to disable only the view tracking (visualized)
 * @param currentScreenName Optional screen name to include in tracking
 * @param isOffline Whether the app is in offline mode
 * @returns trackAlertTap callback to track tap interactions on the alert
 */
export const useItwEidLifecycleAlertTracking = ({
  isItwCredential,
  maybeEidStatus,
  navigation,
  skipViewTracking = false,
  currentScreenName,
  isOffline = false
}: Props) => {
  const hasTrackedRef = useRef(false);
  const isEidInvalid =
    maybeEidStatus === "jwtExpiring" || maybeEidStatus === "jwtExpired";

  const shouldTrackVisualization = !skipViewTracking && isEidInvalid;

  const trackingProperties = useMemo(
    () => ({
      banner_id: getLifecycleBannerId(maybeEidStatus, isItwCredential),
      banner_page: currentScreenName ?? "not_available",
      banner_landing: isOffline
        ? "not_available"
        : ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_ID_METHOD
    }),
    [maybeEidStatus, currentScreenName, isOffline, isItwCredential]
  );

  useEffect(() => {
    if (!shouldTrackVisualization) {
      return;
    }
    const onFocus = () => {
      if (!hasTrackedRef.current) {
        trackItwBannerVisualized(trackingProperties);
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
  }, [navigation, shouldTrackVisualization, trackingProperties]);

  const trackAlertTap = useCallback(() => {
    trackItwBannerTap(trackingProperties);
  }, [trackingProperties]);

  return { trackAlertTap };
};
