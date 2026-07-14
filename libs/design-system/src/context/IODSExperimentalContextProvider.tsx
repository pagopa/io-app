import { createContext, PropsWithChildren, useContext, useState } from "react";

type IOExperimentalContextType = {
  isExperimental: boolean;
  setExperimental: (isExperimental: boolean) => void;
};
/**
 * Experimental Context for new UI Representations
 */
export const IOExperimentalDesignContext =
  createContext<IOExperimentalContextType>({
    isExperimental: false,
    setExperimental: () => void 0
  });

export const useIOExperimentalDesign = () =>
  useContext(IOExperimentalDesignContext);

type IOExperimentalContextProviderProps = {
  isExperimentaEnabled?: boolean;
};

export const IODSExperimentalContextProvider = ({
  children,
  isExperimentaEnabled
}: PropsWithChildren<IOExperimentalContextProviderProps>) => {
  const [isExperimental, setExperimental] = useState(
    isExperimentaEnabled ?? false
  );

  return (
    <IOExperimentalDesignContext.Provider
      value={{ isExperimental, setExperimental }}
    >
      {children}
    </IOExperimentalDesignContext.Provider>
  );
};
