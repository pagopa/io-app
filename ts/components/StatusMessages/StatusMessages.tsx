import {
  AlertEdgeToEdgeProps,
  AlertEdgeToEdgeWrapper,
  IOColors
} from "@pagopa/io-app-design-system";
import { PropsWithChildren, useEffect } from "react";
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
  const statusBarBackgroundColor =
    IOColors[
      mapStatusBarVariantStates[statusAlert?.alertProps?.variant || "info"]
    ];

  useEffect(() => {
    if (!statusAlert || !statusBarBackgroundColor) {
      return;
    }
    // Ensure status bar resets after full-screen modal overrides.
    StatusBar.setBackgroundColor?.(statusBarBackgroundColor);
    StatusBar.setBarStyle("dark-content");
  }, [statusAlert, statusBarBackgroundColor]);

  return (
    <AlertEdgeToEdgeWrapper alertProps={statusAlert?.alertProps}>
      {statusAlert && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor={statusBarBackgroundColor}
        />
      )}
      {children}
      {statusAlert?.bottomSheet}
    </AlertEdgeToEdgeWrapper>
  );
};
