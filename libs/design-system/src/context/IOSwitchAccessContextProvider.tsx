import { isSwitchAccessEnabled } from "@io-app/expo-switch-access";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";
import { AppState } from "react-native";

const SwitchAccessContext = createContext(false);

export const useSwitchAccessEnabled = () => useContext(SwitchAccessContext);

export const IOSwitchAccessContextProvider = ({
  children
}: PropsWithChildren) => {
  const [switchAccessEnabled, setSwitchAccessEnabled] = useState(false);

  useEffect(() => {
    const updateSwitchAccessState = () =>
      void isSwitchAccessEnabled().then(setSwitchAccessEnabled);

    void updateSwitchAccessState();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") {
        void updateSwitchAccessState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SwitchAccessContext.Provider value={switchAccessEnabled}>
      {children}
    </SwitchAccessContext.Provider>
  );
};
