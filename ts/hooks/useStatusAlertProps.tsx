import { AlertEdgeToEdgeProps } from "@pagopa/io-app-design-system";
import { JSX, useEffect, useMemo, useState } from "react";
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

// This is a list of routes where the offline alert should not be shown
const blackListOfflineAlertRoutes = new Set<string>([
  ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
  ITW_ROUTES.PRESENTATION.CREDENTIAL_FISCAL_CODE_MODAL,
  ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT,
  ITW_ROUTES.OFFLINE.WALLET
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
export const useStatusAlertProps = (
  routeName?: string
): AlertProps | undefined => {
  const [connectivityAlert, setConnectivityAlert] = useState<
    AlertEdgeToEdgeProps | undefined
  >(undefined);
  const { present, bottomSheet } = useIOBottomSheetModal({
    title: I18n.t("global.offline.bottomSheet.title"),
    component: (
      <IOMarkdown content={I18n.t("global.offline.bottomSheet.content")} />
    )
  });

  const currentStatusMessage = useIOSelector(
    statusMessageByRouteSelector(routeName)
  );

  const currentRoute = useIOSelector(currentRouteSelector);
  const isConnected = useIOSelector(isConnectedSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);

  const prevIsConnected = usePrevious(isConnected);

  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  useEffect(() => {
    if (
      blackListOfflineAlertRoutes.has(currentRoute) ||
      offlineAccessReason !== undefined
    ) {
      /**
       * In case we are in the mini-app for offline usage or the current route is in the blacklist,
       * we don't need to show the alert.
       */
      setConnectivityAlert(undefined);
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

      void mixpanelTrack(
        "ONLINE_BANNER",
        buildEventProperties("TECH", undefined, {
          screen: currentRoute
        })
      );

      setTimeout(() => {
        setConnectivityAlert(undefined);
      }, 3000);
    }
  }, [
    isConnected,
    present,
    prevIsConnected,
    currentRoute,
    offlineAccessReason
  ]);

  return useMemo(() => {
    if (isConnected === false && connectivityAlert) {
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
          action: I18n.t("global.sectionStatus.moreInfo"),
          onPress: () => openWebUrl(url[localeFallback])
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
    currentStatusMessage,
    localeFallback,
    isConnected,
    bottomSheet,
    connectivityAlert
  ]);
};
