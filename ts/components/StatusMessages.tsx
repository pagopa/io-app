import React, { useMemo } from "react";
import {
  AlertEdgeToEdgeProps,
  AlertEdgeToEdgeWrapper
} from "@pagopa/io-app-design-system";
import { useIOSelector } from "../store/hooks";
import { currentRouteSelector } from "../store/reducers/navigation";
import { statusMessageByRouteSelector } from "../store/reducers/backendStatus";
import { getFullLocale } from "../utils/locale";
import { LevelEnum } from "../../definitions/content/StatusMessage";

type StatusMessagesProps = React.PropsWithChildren;

const statusVariantMap: Record<LevelEnum, AlertEdgeToEdgeProps["variant"]> = {
  [LevelEnum.normal]: "info",
  [LevelEnum.critical]: "error",
  [LevelEnum.warning]: "warning"
};

export const useStatusAlertProps = (
  routeName?: string
): AlertEdgeToEdgeProps | undefined => {
  const currentRouteName = useIOSelector(currentRouteSelector);
  const currentStatusMessage = useIOSelector(
    statusMessageByRouteSelector(routeName ?? currentRouteName)
  );
  const locale = getFullLocale();

  return useMemo(() => {
    if (currentStatusMessage && currentStatusMessage.length > 0) {
      // By internal specifications if we have
      const alert = currentStatusMessage[0];

      return {
        content: alert.message[locale],
        variant: statusVariantMap[alert.level]
      };
    }
    return undefined;
  }, [currentStatusMessage, locale]);
};

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const alertProps: AlertEdgeToEdgeProps | undefined = useStatusAlertProps();

  return (
    <AlertEdgeToEdgeWrapper alertProps={alertProps}>
      {children}
    </AlertEdgeToEdgeWrapper>
  );
};
