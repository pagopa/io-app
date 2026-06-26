import { createContext, PropsWithChildren, useContext, useState } from "react";

type IONewTypefaceContextType = {
  newTypefaceEnabled: boolean;
  setNewTypefaceEnabled: (newTypefaceEnabled: boolean) => void;
};
/**
 * Experimental Context for new UI Representations
 */
export const IONewTypefaceContext = createContext<IONewTypefaceContextType>({
  newTypefaceEnabled: true,
  setNewTypefaceEnabled: () => void 0
});

export const useIONewTypeface = () => useContext(IONewTypefaceContext);

type IOExperimentalContextProviderProps = {
  isNewTypefaceEnabled?: boolean;
};

export const IONewTypefaceContextProvider = ({
  children,
  isNewTypefaceEnabled
}: PropsWithChildren<IOExperimentalContextProviderProps>) => {
  const [newTypefaceEnabled, setNewTypefaceEnabled] = useState(
    isNewTypefaceEnabled ?? true
  );

  return (
    <IONewTypefaceContext.Provider
      value={{ newTypefaceEnabled, setNewTypefaceEnabled }}
    >
      {children}
    </IONewTypefaceContext.Provider>
  );
};
