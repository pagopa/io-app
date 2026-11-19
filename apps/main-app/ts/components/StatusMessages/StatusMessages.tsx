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
            colors.component.alertEdgeToEdge[
              statusAlert.alertProps?.variant || "info"
            ].background
          }
          barStyle="dark-content"
        />
      )}
      {children}
      {statusAlert?.bottomSheet}
    </AlertEdgeToEdgeWrapper>
  );
};
