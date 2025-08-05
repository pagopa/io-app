import React, { PropsWithChildren, useState } from "react";
import { AlertEdgeToEdgeWrapper, IOColors } from "@pagopa/io-app-design-system";
import { StatusBar } from "react-native";
import { useStatusAlertProps } from "../hooks/useStatusAlertProps";

type StatusMessagesProps = PropsWithChildren;

type IOAlertVisibleContext = {
  isAlertVisible: boolean;
  setAlertVisible: (isAlertVisible: boolean) => void;
};

/**
 * Experimental Context for new UI Representations
 */
export const IOAlertVisibleContext = React.createContext<IOAlertVisibleContext>(
  {
    isAlertVisible: false,
    setAlertVisible: () => void 0
  }
);

export const useIOAlertVisible = () => React.useContext(IOAlertVisibleContext);

type IOAlertVisibleContextProviderProps = {
  isNewTypefaceEnabled?: boolean;
};

export const IOAlertVisibleContextProvider = ({
  children
}: PropsWithChildren<IOAlertVisibleContextProviderProps>) => {
  const [isAlertVisible, setAlertVisible] = useState(false);

  return (
    <IOAlertVisibleContext.Provider value={{ isAlertVisible, setAlertVisible }}>
      {children}
    </IOAlertVisibleContext.Provider>
  );
};

export const StatusMessages = ({ children }: StatusMessagesProps) => {
  const statusAlert = useStatusAlertProps();

  return (
    <IOAlertVisibleContextProvider>
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
    </IOAlertVisibleContextProvider>
  );
};
