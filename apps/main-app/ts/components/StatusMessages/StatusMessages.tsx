import { AlertEdgeToEdgeWrapper, useIOColors } from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { StatusBar } from "react-native";

import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";

type StatusMessagesProps = PropsWithChildren;

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const statusAlert = useStatusAlertProps();
  const colors = useIOColors();

  return (
    <AlertEdgeToEdgeWrapper alertProps={statusAlert?.alertProps}>
      {statusAlert && (
        <StatusBar
          backgroundColor={
            colors.surface[statusAlert.alertProps?.variant || "info"]
          }
          barStyle="dark-content"
        />
      )}
      {children}
      {statusAlert?.bottomSheet}
    </AlertEdgeToEdgeWrapper>
  );
};
