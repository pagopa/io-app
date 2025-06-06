import { Alert } from "@pagopa/io-app-design-system";
import { Alert as RNAlert } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions/index";
import { itwSetEnv } from "../store/actions/environment.ts";
import { selectItwEnv } from "../store/selectors/environment.ts";

export const ItwEnvironmentAlert = () => {
  const dispatch = useIODispatch();
  const env = useIOSelector(selectItwEnv);

  if (env !== "pre") {
    return null;
  }

  const handlePress = () => {
    RNAlert.alert(
      `Disabilita ambiente di test`,
      `Tutte le credenziali ottenute verranno eliminate.`,
      [
        {
          text: "Annulla",
          style: "cancel"
        },
        {
          text: "Conferma",
          style: "destructive",
          onPress: () => {
            dispatch(itwLifecycleStoresReset());
            dispatch(itwSetEnv("prod"));
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <Alert
      testID="itwEnvironmentAlertTestID"
      variant="warning"
      content={
        "Ambiente di test IT Wallet attivo. Le credenziali ottenute non saranno valide."
      }
      action="Disabilita"
      onPress={handlePress}
    />
  );
};
