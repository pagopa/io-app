import { AlertEdgeToEdgeProps } from "@pagopa/io-app-design-system";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { GestureResponderEvent } from "react-native";
import { useIOSelector } from "../store/hooks";
import { statusMessageByRouteSelector } from "../store/reducers/backendStatus/statusMessages";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../utils/locale";
import { LevelEnum } from "../../definitions/content/StatusMessage";
import I18n from "../i18n";
import { openWebUrl } from "../utils/url";
import { isConnectedSelector } from "../features/connectivity/store/selectors";
import IOMarkdown from "../components/IOMarkdown";
import { useIOBottomSheetModal } from "../utils/hooks/bottomSheet";
import { usePrevious } from "../utils/hooks/usePrevious";
import { mixpanelTrack } from "../mixpanel";
import { currentRouteSelector } from "../store/reducers/navigation";
import { buildEventProperties } from "../utils/analytics";
import { offlineAccessReasonSelector } from "../features/ingress/store/selectors";
import { ITW_ROUTES } from "../features/itwallet/navigation/routes";
import { OfflineAccessReasonEnum } from "../features/ingress/store/reducer";
import {
  trackItwOfflineBanner,
  trackItwOfflineBottomSheet
} from "../features/itwallet/analytics";
import { useIOAlertVisible } from "../components/StatusMessages/IOAlertVisibleContext";
import { useOfflineAlertDetailModal } from "../features/itwallet/common/hooks/useOfflineAlertDetailModal";
import { useAppRestartAction } from "../features/itwallet/wallet/hooks/useAppRestartAction";
import { isStartupLoaded, StartupStatusEnum } from "../store/reducers/startup";

// This is a list of routes where the offline alert should not be shown
const blackListOfflineAlertRoutes = new Set<string>([
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

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    /**
     * Makes sure that the alert is not shown during the app startup
     * if we have connectivity and not in the offline mini app
     */
    if (
      isAlertVisible &&
      isConnected &&
      offlineAccessReason === undefined &&
      startupStatus === StartupStatusEnum.INITIAL
    ) {
      setConnectivityAlert(undefined);
      setAlertVisible(false);
      return;
    }

    /**
     * Screens in the blacklist should not display the alert
     */
    if (isBlacklisted && isAlertVisible) {
      setConnectivityAlert(undefined);
      setAlertVisible(false);
      return;
    }

    /**
     * Show the offline alert only if the device is offline and the current route
     * is not in the blacklist
     */
    if (!isBlacklisted && isConnected === false && !isAlertVisible) {
      setConnectivityAlert({
        variant: "info",
        ...(offlineAccessReason
          ? {
              content: I18n.t(
                `features.itWallet.offline.${offlineAccessReason}.alert.content`
              ),
              action: I18n.t(
                `features.itWallet.offline.${offlineAccessReason}.alert.action`
              ),
              onPress: openItwOfflineBottomSheet
            }
          : {
              content: I18n.t("global.offline.statusMessage.message"),
              action: I18n.t("global.offline.statusMessage.action"),
              onPress: openCommonOfflineBottomSheet
            })
      });

      setAlertVisible(true);

      if (offlineAccessReason) {
        trackItwOfflineBanner({
          screen: currentRoute,
          error_message_type: offlineAccessReason,
          use_case: "starting_app"
        });
      } else {
        void mixpanelTrack(
          "OFFLINE_BANNER",
          buildEventProperties("TECH", undefined, {
            screen: currentRoute
          })
        );
      }
      return;
    }

    /**
     * If the device was offline and returns online, show a "back online" alert
     * which disappears after 3 seconds
     */
    if (prevIsConnected === false && isConnected === true && isAlertVisible) {
      setConnectivityAlert(
        offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE
          ? {
              content: I18n.t(
                `features.itWallet.offline.back_online.alert.content`
              ),
              action: I18n.t(
                `features.itWallet.offline.back_online.alert.action`
              ),
              variant: "success",
              onPress: handleAppRestart
            }
          : {
              variant: "success",
              content: I18n.t("global.offline.connectionRestored")
            }
      );

      setAlertVisible(true);

      void mixpanelTrack(
        "ONLINE_BANNER",
        buildEventProperties("TECH", undefined, {
          screen: currentRoute
        })
      );

      if (offlineAccessReason !== OfflineAccessReasonEnum.DEVICE_OFFLINE) {
        /**
         * Removes the "back online" alert after 3 seconds only if the app is not
         * in the offline mode
         */
        setTimeout(() => {
          setConnectivityAlert(undefined);
          setAlertVisible(false);
        }, 3000);
      }
    }
  }, [
    isBlacklisted,
    currentRoute,
    setAlertVisible,
    startupStatus,
    handleAppRestart,
    isAlertVisible,
    isConnected,
    offlineAccessReason,
    openCommonOfflineBottomSheet,
    openItwOfflineBottomSheet,
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
