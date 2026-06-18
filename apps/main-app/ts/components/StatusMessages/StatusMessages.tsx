import {
  AlertEdgeToEdgeProps,
  AlertEdgeToEdgeWrapper,
  IOColors
} from "@pagopa/io-app-design-system";
import { PropsWithChildren } from "react";
import { StatusBar } from "react-native";
import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";

type StatusMessagesProps = PropsWithChildren;

const mapStatusBarVariantStates: Record<
  NonNullable<AlertEdgeToEdgeProps["variant"]>,
  IOColors
> = {
  error: "error-100",
  warning: "warning-100",
  info: "info-100",
  success: "success-100"
};

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const statusAlert = useStatusAlertProps();

  return (
    <AlertEdgeToEdgeWrapper alertProps={statusAlert?.alertProps}>
      {statusAlert && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor={
            IOColors[
              mapStatusBarVariantStates[
                statusAlert.alertProps?.variant || "info"
              ]
            ]
          }
        />
      )}
      {children}
      {statusAlert?.bottomSheet}
    </AlertEdgeToEdgeWrapper>
  );
};
