import { AlertEdgeToEdgeWrapper } from "@pagopa/io-app-design-system";
import { PropsWithChildren } from "react";
import { useStatusAlertProps } from "../hooks/useStatusAlertProps";

type StatusMessagesProps = PropsWithChildren;

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const statusAlert = useStatusAlertProps();

  return (
    <AlertEdgeToEdgeWrapper alertProps={statusAlert?.alertProps}>
      {children}
    </AlertEdgeToEdgeWrapper>
  );
};
