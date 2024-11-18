import { AlertEdgeToEdgeProps } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { useIOSelector } from "../store/hooks";
import { statusMessageByRouteSelector } from "../store/reducers/backendStatus";
import { getFullLocale } from "../utils/locale";
import { LevelEnum } from "../../definitions/content/StatusMessage";

const statusVariantMap: Record<LevelEnum, AlertEdgeToEdgeProps["variant"]> = {
  [LevelEnum.normal]: "info",
  [LevelEnum.critical]: "error",
  [LevelEnum.warning]: "warning"
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
    return {
      content: firstAlert.message[locale],
      variant: statusVariantMap[firstAlert.level]
    };
  }, [currentStatusMessage, locale]);
};
