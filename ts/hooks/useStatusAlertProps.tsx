import { AlertEdgeToEdgeProps } from "@pagopa/io-app-design-system";
import { useEffect, useMemo, useState } from "react";
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
import { useIOBottomSheetAutoresizableModal } from "../utils/hooks/bottomSheet";
import { usePrevious } from "../utils/hooks/usePrevious";

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
const markdownContent =
  "Quando il tuo dispositivo è offline, alcuni servizi dell’app potrebbero non funzionare. \n\n Documenti su IO funziona **anche offline**, ma la validità dei tuoi documenti è aggiornata all’ultimo accesso in app con connessione a una rete. \n\n Collegati a internet e ricarica l’app per continuare ad usare tutti i servizi di IO.";

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
  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal({
    title: "Nessuna connessione",
    component: <IOMarkdown content={markdownContent} />
  });

  const currentStatusMessage = useIOSelector(
    statusMessageByRouteSelector(routeName)
  );

  const isConnected = useIOSelector(isConnectedSelector);
  const prevIsConnected = usePrevious(isConnected);

  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  useEffect(() => {
    if (isConnected === false) {
      setConnectivityAlert({
        variant: "info",
        content: "Nessuna connessione.",
        action: "Cosa posso fare?",
        onPress: present
      });
    }
    if (prevIsConnected === false && isConnected === true) {
      setConnectivityAlert({
        variant: "warning",
        content: "Connessione ripristinata."
      });

      setTimeout(() => {
        setConnectivityAlert(undefined);
      }, 3000);
    }
  }, [isConnected, present, prevIsConnected]);

  return useMemo(() => {
    if (isConnected === false || connectivityAlert) {
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
