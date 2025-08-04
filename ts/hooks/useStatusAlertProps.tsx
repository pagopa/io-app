import { AlertEdgeToEdgeProps, useIOToast } from "@pagopa/io-app-design-system";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { GestureResponderEvent } from "react-native";
import { useIODispatch, useIOSelector } from "../store/hooks";
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
  ItwOfflineRicaricaAppIOSource,
  trackItwOfflineBottomSheet,
  trackItwOfflineReloadFailure,
  trackItwOfflineRicaricaAppIO
} from "../features/itwallet/analytics";
import { resetOfflineAccessReason } from "../features/ingress/store/actions";
import { startApplicationInitialization } from "../store/actions/application";
import { startupLoadSuccess } from "../store/actions/startup";
import { StartupStatusEnum } from "../store/reducers/startup";
import { useIOAlertVisible } from "../components/StatusMessages";
import { useOfflineAlertDetailModal } from "../features/itwallet/common/hooks/useOfflineAlertDetailModal";

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

/**
 * Hook that creates and manages a function to restart the application.
 *
 * @param source - The source of the app restart action, for analytics purposes
 * @returns A function to restart the application
 */
const useAppRestartAction = (source: ItwOfflineRicaricaAppIOSource) => {
  const toast = useIOToast();
  const dispatch = useIODispatch();
  const isConnected = useIOSelector(isConnectedSelector);

  return useCallback(() => {
    if (isConnected) {
      trackItwOfflineRicaricaAppIO(source);
      // Reset the offline access reason.
      // Since this state is `undefined` when the user is online,
      // the startup saga will proceed without blocking.
      dispatch(resetOfflineAccessReason());
      // Dispatch this action to mount the correct navigator.
      dispatch(startupLoadSuccess(StartupStatusEnum.INITIAL));
      // restart startup saga
      dispatch(startApplicationInitialization());
    } else {
      toast.error(I18n.t("features.itWallet.offline.failure"));
      trackItwOfflineReloadFailure();
    }
  }, [dispatch, isConnected, toast, source]);
};

type AlertProps = {
  alertProps?: AlertEdgeToEdgeProps;
  bottomSheet?: JSX.Element;
};
export const useStatusAlertProps = (): AlertProps | undefined => {
  const [connectivityAlert, setConnectivityAlert] = useState<
    AlertEdgeToEdgeProps | undefined
  >(undefined);
  const { present, bottomSheet } = useIOBottomSheetModal({
    title: I18n.t("global.offline.bottomSheet.title"),
    component: (
      <IOMarkdown content={I18n.t("global.offline.bottomSheet.content")} />
    )
  });
  const handleAppRestart = useAppRestartAction("banner");
  const currentStatusMessage = useIOSelector(statusMessageByRouteSelector);
  const currentRoute = useIOSelector(currentRouteSelector);
  const isConnected = useIOSelector(isConnectedSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const detailModal = useOfflineAlertDetailModal(offlineAccessReason);

  const { setAlertVisible } = useIOAlertVisible();
  const openItwOfflineBottomSheet = useCallback(() => {
    detailModal?.present();
    trackItwOfflineBottomSheet();
  }, [detailModal]);

  const prevIsConnected = usePrevious(isConnected);

  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  useEffect(() => {
    if (blackListOfflineAlertRoutes.has(currentRoute)) {
      /**
       * In case we are in the mini-app for offline usage or the current route is in the blacklist,
       * we don't need to show the alert.
       */
      setConnectivityAlert(undefined);
      setAlertVisible(false);
      return;
    }
    if (offlineAccessReason !== undefined) {
      if (
        offlineAccessReason === OfflineAccessReasonEnum.DEVICE_OFFLINE &&
        prevIsConnected === false &&
        isConnected === true
      ) {
        setConnectivityAlert({
          content: I18n.t(
            `features.itWallet.offline.back_online.alert.content`
          ),
          action: I18n.t(`features.itWallet.offline.back_online.alert.action`),
          variant: "success",
          onPress: handleAppRestart
        });
        setAlertVisible(true);
        return;
      }
      setConnectivityAlert({
        content: I18n.t(
          `features.itWallet.offline.${offlineAccessReason}.alert.content`
        ),
        action: I18n.t(
          `features.itWallet.offline.${offlineAccessReason}.alert.action`
        ),
        variant: "info",
        onPress: openItwOfflineBottomSheet
      });
      setAlertVisible(true);
      return;
    }
    if (isConnected === false) {
      setConnectivityAlert({
        variant: "info",
        content: I18n.t("global.offline.statusMessage.message"),
        action: I18n.t("global.offline.statusMessage.action"),
        onPress: () => {
          present();
          void mixpanelTrack(
            "APP_OFFLINE_BOTTOM_SHEET",
            buildEventProperties("UX", "screen_view", {
              screen: currentRoute
            })
          );
        }
      });
      setAlertVisible(true);
      void mixpanelTrack(
        "OFFLINE_BANNER",
        buildEventProperties("TECH", undefined, {
          screen: currentRoute
        })
      );
    }
    if (prevIsConnected === false && isConnected === true) {
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

      setTimeout(() => {
        setConnectivityAlert(undefined);
        setAlertVisible(false);
      }, 3000);
    }
  }, [
    isConnected,
    present,
    prevIsConnected,
    currentRoute,
    offlineAccessReason,
    openItwOfflineBottomSheet,
    handleAppRestart,
    setAlertVisible
  ]);

  return useMemo(() => {
    if (connectivityAlert) {
      return {
        alertProps: connectivityAlert,
        bottomSheet:
          offlineAccessReason !== undefined
            ? detailModal?.bottomSheet
            : bottomSheet
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
    setAlertVisible,
    connectivityAlert,
    currentStatusMessage,
    localeFallback,
    offlineAccessReason,
    detailModal?.bottomSheet,
    bottomSheet
  ]);
};
