import { PropsWithChildren } from "react";
import { AlertEdgeToEdgeWrapper, IOColors } from "@pagopa/io-app-design-system";
import { StatusBar } from "react-native";
import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";

type StatusMessagesProps = PropsWithChildren;

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const statusAlert = useStatusAlertProps();

  return (
    <AlertEdgeToEdgeWrapper alertProps={statusAlert?.alertProps}>
      {statusAlert && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor={IOColors["info-100"]}
        />
      )}
      {children}
      {statusAlert?.bottomSheet}
    </AlertEdgeToEdgeWrapper>
  );
};
