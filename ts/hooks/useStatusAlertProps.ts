import { AlertEdgeToEdgeProps } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { GestureResponderEvent } from "react-native";
import { useIOSelector } from "../store/hooks";
import { statusMessageByRouteSelector } from "../store/reducers/backendStatus/statusMessages";
import { getFullLocale } from "../utils/locale";
import { LevelEnum } from "../../definitions/content/StatusMessage";
import I18n from "../i18n";
import { openWebUrl } from "../utils/url";

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

export const useStatusAlertProps = (
  routeName?: string
): AlertEdgeToEdgeProps | undefined => {
  const currentStatusMessage = useIOSelector(
    statusMessageByRouteSelector(routeName)
  );
  const locale = getFullLocale();

  return useMemo(() => {
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
          onPress: () => openWebUrl(url[locale])
        })
      )
    );

    return {
      content: firstAlert.message[locale],
      variant: statusVariantMap[firstAlert.level],
      ...statusAction
    };
  }, [currentStatusMessage, locale]);
};
