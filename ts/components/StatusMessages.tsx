import * as React from "react";
import {
  AlertEdgeToEdgeProps,
  AlertEdgeToEdgeWrapper
} from "@pagopa/io-app-design-system";
import { useStatusAlertProps } from "../hooks/useStatusAlertProps";

type StatusMessagesProps = React.PropsWithChildren;

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const alertProps: AlertEdgeToEdgeProps | undefined = useStatusAlertProps();

  return (
    <AlertEdgeToEdgeWrapper alertProps={alertProps}>
      {children}
    </AlertEdgeToEdgeWrapper>
  );
};
