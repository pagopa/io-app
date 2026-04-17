import React, { PropsWithChildren, useMemo, useState } from "react";

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
  const contextValue = useMemo(
    () => ({ isAlertVisible, setAlertVisible }),
    [isAlertVisible, setAlertVisible]
  );
  return (
    <IOAlertVisibleContext.Provider value={contextValue}>
      {children}
    </IOAlertVisibleContext.Provider>
  );
};
