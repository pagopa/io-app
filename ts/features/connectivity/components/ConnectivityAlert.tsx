import {
  AlertEdgeToEdgeProps,
  AlertEdgeToEdgeWrapper
} from "@pagopa/io-app-design-system";
import { PropsWithChildren, useMemo } from "react";
import { useIOSelector } from "../../../store/hooks";
import { connectivityStatusSelector } from "../store/selectors";
import { constVoid } from "fp-ts/lib/function";

type StatusMessagesProps = PropsWithChildren;

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const isConnected = useIOSelector(connectivityStatusSelector);
  const alertProps: AlertEdgeToEdgeProps | undefined = useMemo(
    () =>
      isConnected
        ? undefined
        : {
            variant: "info",
            content: "Nessuna connessione.",
            action: "Cosa posso fare?",
            onPress: constVoid
          },
    [isConnected]
  );
  return (
    <AlertEdgeToEdgeWrapper alertProps={alertProps}>
      {children}
    </AlertEdgeToEdgeWrapper>
  );
};
