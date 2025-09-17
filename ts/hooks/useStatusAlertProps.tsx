import { AlertEdgeToEdgeProps } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { GestureResponderEvent } from "react-native";
import { LevelEnum } from "../../definitions/content/StatusMessage";
import IOMarkdown from "../components/IOMarkdown";
import { useIOAlertVisible } from "../components/StatusMessages/IOAlertVisibleContext";
import { AUTHENTICATION_ROUTES } from "../features/authentication/common/navigation/routes";
import { isConnectedSelector } from "../features/connectivity/store/selectors";
import { OfflineAccessReasonEnum } from "../features/ingress/store/reducer";
import { offlineAccessReasonSelector } from "../features/ingress/store/selectors";
import {
  trackItwOfflineBanner,
  trackItwOfflineBottomSheet
} from "../features/itwallet/analytics";
import { useOfflineAlertDetailModal } from "../features/itwallet/common/hooks/useOfflineAlertDetailModal";
import { ITW_ROUTES } from "../features/itwallet/navigation/routes";
import { useAppRestartAction } from "../features/itwallet/wallet/hooks/useAppRestartAction";
import { mixpanelTrack } from "../mixpanel";
import { useIOSelector } from "../store/hooks";
import { statusMessageByRouteSelector } from "../store/reducers/backendStatus/statusMessages";
import { currentRouteSelector } from "../store/reducers/navigation";
import { isStartupLoaded, StartupStatusEnum } from "../store/reducers/startup";
import { buildEventProperties } from "../utils/analytics";
import { useIOBottomSheetModal } from "../utils/hooks/bottomSheet";
import { usePrevious } from "../utils/hooks/usePrevious";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../utils/locale";
import { openWebUrl } from "../utils/url";

// This is a list of routes where the offline alert should not be shown
const blackListOfflineAlertRoutes = new Set<string>([
  AUTHENTICATION_ROUTES.LANDING,
  ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
  ITW_ROUTES.PRESENTATION.CREDENTIAL_FISCAL_CODE_MODAL,
  ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT
]);

const statusVariantMap: Record<LevelEnum, AlertEdgeToEdgeProps["variant"]> = {
  [LevelEnum.normal]: "info",
  [LevelEnum.critical]: "error",
  [LevelEnum.warning]: "warning"
};

type AlertActionProps =
  | {
      action?: string;
      onPress: (event: GestureResponderEvent) => void;
    }
  | {
      action?: never;
      onPress?: never;
    };

type AlertProps = {
  alertProps?: AlertEdgeToEdgeProps;
  bottomSheet?: JSX.Element;
};

export const useStatusAlertProps = (): AlertProps | undefined => {
  const { isAlertVisible, setAlertVisible } = useIOAlertVisible();
  const [connectivityAlert, setConnectivityAlert] = useState<
    AlertEdgeToEdgeProps | undefined
  >(undefined);

  const currentStatusMessage = useIOSelector(statusMessageByRouteSelector);
  const currentRoute = useIOSelector(currentRouteSelector);
  const isConnected = useIOSelector(isConnectedSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const startupStatus = useIOSelector(isStartupLoaded);
  const prevIsConnected = usePrevious(isConnected);

  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  // Bottom sheets
  const itwOfflineModal = useOfflineAlertDetailModal(
    offlineAccessReason ?? OfflineAccessReasonEnum.DEVICE_OFFLINE
  );
  const commonOfflineModal = useIOBottomSheetModal({
    title: I18n.t("global.offline.bottomSheet.title"),
    component: (
      <IOMarkdown content={I18n.t("global.offline.bottomSheet.content")} />
    )
  });

  const openCommonOfflineBottomSheet = useCallback(() => {
    commonOfflineModal?.present();
    void mixpanelTrack(
      "APP_OFFLINE_BOTTOM_SHEET",
      buildEventProperties("UX", "screen_view", {
        screen: currentRoute
      })
    );
  }, [commonOfflineModal, currentRoute]);

  const openItwOfflineBottomSheet = useCallback(() => {
    itwOfflineModal?.present();
    trackItwOfflineBottomSheet();
  }, [itwOfflineModal]);

  const handleAppRestart = useAppRestartAction("banner");

  const isBlacklisted = useMemo(
    () => blackListOfflineAlertRoutes.has(currentRoute),
    [currentRoute]
  );

  /**
   * This hook removes the alert as soon the route changes to a blacklisted one
   * and makes sure that the alert is not shown during the app startup
   */
  useEffect(() => {
    if (!isAlertVisible) {
      return;
    }

    if (isConnected && startupStatus === StartupStatusEnum.INITIAL) {
      setAlertVisible(false);
      setConnectivityAlert(undefined);
      return;
    }

    if (isBlacklisted) {
      setAlertVisible(false);
      setConnectivityAlert(undefined);
    }
  }, [
    isBlacklisted,
    isAlertVisible,
    setAlertVisible,
    isConnected,
    startupStatus
  ]);

  /**
   * Effects that runs only if there is an offline access reason
   * and we are in the offline mini app, only if the current route
   * is not in the blacklist
   */
  useEffect(() => {
    if (
      offlineAccessReason === undefined ||
      isBlacklisted ||
      startupStatus === StartupStatusEnum.INITIAL
    ) {
      return;
    }

    /**
     * Show the offline alert if the offline mini app is visible and the current route
     * is not in the blacklist
     */
    if (!isAlertVisible) {
      setConnectivityAlert({
        variant: "info",
        content: I18n.t(
          `features.itWallet.offline.${offlineAccessReason}.alert.content`
        ),
        action: I18n.t(
          `features.itWallet.offline.${offlineAccessReason}.alert.action`
        ),
        onPress: openItwOfflineBottomSheet
      });
      setAlertVisible(true);

      trackItwOfflineBanner({
        screen: currentRoute,
        error_message_type: offlineAccessReason,
        use_case: "starting_app"
      });
      return;
    }

    /**
     * If the device was offline and returns online, show a "back online"
     */
    if (
      isAlertVisible &&
      isConnected === true &&
      prevIsConnected === false &&
      offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE
    ) {
      setConnectivityAlert({
        content: I18n.t(`features.itWallet.offline.back_online.alert.content`),
        action: I18n.t(`features.itWallet.offline.back_online.alert.action`),
        variant: "success",
        onPress: handleAppRestart
      });

      setAlertVisible(true);

      void mixpanelTrack(
        "ONLINE_BANNER",
        buildEventProperties("TECH", undefined, {
          screen: currentRoute
        })
      );
    }
  }, [
    offlineAccessReason,
    isBlacklisted,
    isAlertVisible,
    setAlertVisible,
    currentRoute,
    openItwOfflineBottomSheet,
    isConnected,
    prevIsConnected,
    handleAppRestart,
    startupStatus
  ]);

  /**
   * Effects that runs when there is connectivity issues and we are
   * in the full app, only if the current route is not in the blacklist
   */
  useEffect(() => {
    if (
      offlineAccessReason !== undefined ||
      isBlacklisted ||
      startupStatus === StartupStatusEnum.INITIAL
    ) {
      return;
    }

    /**
     * Show the offline alert if the device is offline and the current route
     * is not in the blacklist
     */
    if (!isAlertVisible && isConnected === false) {
      setConnectivityAlert({
        variant: "info",
        content: I18n.t("global.offline.statusMessage.message"),
        action: I18n.t("global.offline.statusMessage.action"),
        onPress: openCommonOfflineBottomSheet
      });
      setAlertVisible(true);

      void mixpanelTrack(
        "OFFLINE_BANNER",
        buildEventProperties("TECH", undefined, {
          screen: currentRoute
        })
      );
      return;
    }

    /**
     * If the device was offline and returns online, show a "back online" alert
     * which disappears after 3 seconds
     */
    if (isAlertVisible && isConnected === true && prevIsConnected === false) {
      setConnectivityAlert({
        variant: "success",
        content: I18n.t("global.offline.connectionRestored")
      });
      setAlertVisible(true);

      void mixpanelTrack(
        "ONLINE_BANNER",
        buildEventProperties("TECH", undefined, {
          screen: currentRoute
        })
      );

      /**
       * Removes the "back online" alert after 3 seconds only if the app is not
       * in the offline mode
       */
      setTimeout(() => {
        setAlertVisible(false);
        setConnectivityAlert(undefined);
      }, 3000);
    }
  }, [
    offlineAccessReason,
    isBlacklisted,
    isConnected,
    isAlertVisible,
    setAlertVisible,
    startupStatus,
    currentRoute,
    openCommonOfflineBottomSheet,
    prevIsConnected
  ]);

  return useMemo(() => {
    if (connectivityAlert) {
      return {
        alertProps: connectivityAlert,
        bottomSheet:
          offlineAccessReason !== undefined
            ? itwOfflineModal.bottomSheet
            : commonOfflineModal.bottomSheet
      };
    }
    if (!currentStatusMessage || currentStatusMessage.length === 0) {
      return undefined;
    }
    // If there is at least one status-message to display, extract its content and variant (using memoization to avoid re-renderings, since we are creating a new instance)
    const firstAlert = currentStatusMessage[0];

    const statusAction: AlertActionProps = pipe(
      firstAlert.web_url,
      O.fromNullable,
      O.fold(
        () => ({}),
        url => ({
          action:
            firstAlert.label_cta?.[localeFallback] ||
            I18n.t("global.sectionStatus.moreInfo"),
          onPress: () => openWebUrl(url[localeFallback])
        })
      )
    );

    setAlertVisible(currentStatusMessage.length > 0);

    return {
      alertProps: {
        content: firstAlert.message[localeFallback],
        variant: statusVariantMap[firstAlert.level],
        ...statusAction
      }
    };
  }, [
    connectivityAlert,
    currentStatusMessage,
    setAlertVisible,
    localeFallback,
    offlineAccessReason,
    itwOfflineModal.bottomSheet,
    commonOfflineModal.bottomSheet
  ]);
};
