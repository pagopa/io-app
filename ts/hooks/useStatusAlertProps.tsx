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
import { trackItwOfflineBottomSheet } from "../features/itwallet/analytics";
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

/**
 * Helper to build the event properties for Mixpanel events related to banners.
 * @param eventType the type of the event, either "action" or "screen_view"
 * @param banner_page the current route where the banner is shown
 * @param banner_landing the URL of the banner, if any
 * @returns the event properties object
 */
const buildMPEventProperties = (
  eventType: "action" | "screen_view",
  banner_page: string,
  banner_landing?: string
) =>
  buildEventProperties("UX", eventType, {
    banner_page,
    banner_landing
  });

/**
 * Helper hook to derive the connectivity state based on the current connectivity status,
 * the offline access reason, the current route and the startup status, which helps to reduce
 * the complexity of the main hook.
 *
 * @returns the derived connectivity state based on the current connectivity status,
 */
export const useDerivedConnectivityState = () => {
  const currentRoute = useIOSelector(currentRouteSelector);
  const isConnected = useIOSelector(isConnectedSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const startupStatus = useIOSelector(isStartupLoaded);
  const prevIsConnected = usePrevious(isConnected);

  const isBlacklisted = useMemo(
    () => blackListOfflineAlertRoutes.has(currentRoute),
    [currentRoute]
  );

  if (startupStatus === StartupStatusEnum.INITIAL) {
    return "initial";
  }

  if (isBlacklisted) {
    return "blacklisted";
  }

  if (
    isConnected === false &&
    offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE
  ) {
    return `mini_app_${offlineAccessReason}` as const;
  }

  if (
    isConnected === true &&
    offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE
  ) {
    return "mini_app_back_online";
  }

  if (offlineAccessReason) {
    return `mini_app_${offlineAccessReason}` as const;
  }

  if (isConnected === false) {
    return "offline";
  }

  if (isConnected === true && prevIsConnected === false) {
    return "back_online";
  }

  return "online";
};

export const useStatusAlertProps = (): AlertProps | undefined => {
  const { isAlertVisible, setAlertVisible } = useIOAlertVisible();
  const [connectivityAlert, setConnectivityAlert] = useState<
    AlertEdgeToEdgeProps | undefined
  >(undefined);
  const [bottomSheet, setBottomSheet] = useState<JSX.Element | undefined>(
    undefined
  );

  const derivedConnectivityState = useDerivedConnectivityState();
  const prevDerivedConnectivityState = usePrevious(derivedConnectivityState);

  const currentStatusMessage = useIOSelector(statusMessageByRouteSelector);
  const currentRoute = useIOSelector(currentRouteSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);

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

  /**
   * Effect to handle the connectivity state changes and update the alert and bottom sheet accordingly.
   */
  useEffect(() => {
    if (derivedConnectivityState === prevDerivedConnectivityState) {
      // Skip if no change on the derived state
      return;
    }

    switch (derivedConnectivityState) {
      case "initial":
      case "blacklisted":
        setAlertVisible(false);
        setBottomSheet(undefined);
        setConnectivityAlert(undefined);
        break;

      case "mini_app_device_offline":
        setBottomSheet(itwOfflineModal?.bottomSheet);
        setConnectivityAlert({
          variant: "info",
          content: I18n.t(
            `features.itWallet.offline.device_offline.alert.content`
          ),
          action: I18n.t(
            `features.itWallet.offline.device_offline.alert.action`
          ),
          onPress: openItwOfflineBottomSheet
        });
        setAlertVisible(true);
        break;

      case "mini_app_back_online":
        setBottomSheet(undefined);
        setConnectivityAlert({
          variant: "success",
          content: I18n.t(
            `features.itWallet.offline.back_online.alert.content`
          ),
          action: I18n.t(`features.itWallet.offline.back_online.alert.action`),
          onPress: handleAppRestart
        });
        setAlertVisible(true);
        break;

      case "mini_app_session_expired":
        setBottomSheet(itwOfflineModal?.bottomSheet);
        setConnectivityAlert({
          variant: "info",
          content: I18n.t(
            `features.itWallet.offline.session_expired.alert.content`
          ),
          action: I18n.t(
            `features.itWallet.offline.session_expired.alert.action`
          ),
          onPress: openItwOfflineBottomSheet
        });
        setAlertVisible(true);
        break;

      case "mini_app_session_refresh":
        setBottomSheet(itwOfflineModal?.bottomSheet);
        setConnectivityAlert({
          variant: "info",
          content: I18n.t(
            `features.itWallet.offline.session_refresh.alert.content`
          ),
          action: I18n.t(
            `features.itWallet.offline.session_refresh.alert.action`
          ),
          onPress: openItwOfflineBottomSheet
        });
        setAlertVisible(true);
        break;

      case "mini_app_timeout":
        setBottomSheet(undefined);
        setConnectivityAlert({
          variant: "info",
          content: I18n.t(`features.itWallet.offline.timeout.alert.content`),
          action: I18n.t(`features.itWallet.offline.timeout.alert.action`),
          onPress: handleAppRestart
        });
        setAlertVisible(true);
        break;

      case "offline":
        setBottomSheet(commonOfflineModal?.bottomSheet);
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
        break;

      case "back_online":
        setBottomSheet(undefined);
        setConnectivityAlert({
          variant: "success",
          content: I18n.t("global.offline.connectionRestored")
        });

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
        break;

      case "online":
        break;
    }
  }, [
    derivedConnectivityState,
    prevDerivedConnectivityState,
    handleAppRestart,
    openItwOfflineBottomSheet,
    setAlertVisible,
    currentRoute,
    openCommonOfflineBottomSheet,
    setBottomSheet,
    itwOfflineModal,
    commonOfflineModal,
    isAlertVisible
  ]);

  useEffect(() => {
    if (connectivityAlert) {
      // Visibility is handled by the connectivity useEffect
      return;
    }
    if (!currentStatusMessage || currentStatusMessage.length === 0) {
      setAlertVisible(false);
    } else {
      setAlertVisible(true);
      mixpanelTrack(
        "REMOTE_BANNER",
        buildMPEventProperties(
          "screen_view",
          currentRoute,
          currentStatusMessage[0].web_url
            ? currentStatusMessage[0].web_url[localeFallback]
            : undefined
        )
      );
    }
  }, [
    connectivityAlert,
    currentStatusMessage,
    setAlertVisible,
    currentRoute,
    localeFallback
  ]);

  return useMemo(() => {
    if (connectivityAlert) {
      return {
        alertProps: connectivityAlert,
        bottomSheet
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
          onPress: () => {
            mixpanelTrack(
              "TAP_REMOTE_BANNER",
              buildMPEventProperties(
                "action",
                currentRoute,
                url[localeFallback]
              )
            );
            openWebUrl(url[localeFallback]);
          }
        })
      )
    );

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
    localeFallback,
    bottomSheet,
    currentRoute
  ]);
};
