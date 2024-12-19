import {
  AlertEdgeToEdgeProps,
  AlertEdgeToEdgeWrapper
} from "@pagopa/io-app-design-system";
import { PropsWithChildren } from "react";
import { useStatusAlertProps } from "../hooks/useStatusAlertProps";

type StatusMessagesProps = PropsWithChildren;

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const alertProps: AlertEdgeToEdgeProps | undefined = useStatusAlertProps();

  return (
    <AlertEdgeToEdgeWrapper alertProps={alertProps}>
      {children}
    </AlertEdgeToEdgeWrapper>
  );
};
