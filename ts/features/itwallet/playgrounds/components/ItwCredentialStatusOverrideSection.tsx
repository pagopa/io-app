import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCredentialsAllSelector } from "../../credentials/store/selectors";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import {
  itwDebugClearGlobalStatusOverride,
  itwDebugSaveOriginalCredentials,
  itwDebugSetGlobalStatusOverride
} from "../store/actions";
import {
  itwDebugGlobalStatusOverrideSelector,
  itwDebugSavedCredentialsSelector
} from "../store/selectors";
import { applyStatusToCredential } from "../utils/itwDebugCredentialUtils";

const ALL_STATUSES: ReadonlyArray<ItwCredentialStatus> = [
  "valid",
  "invalid",
  "expiring",
  "expired",
  "jwtExpiring",
  "jwtExpired",
  "unknown"
];

export const ItwCredentialStatusOverrideSection = () => {
  const dispatch = useIODispatch();
  const override = useIOSelector(itwDebugGlobalStatusOverrideSelector);
  const savedCredentials = useIOSelector(itwDebugSavedCredentialsSelector);
  const allCredentials = useIOSelector(itwCredentialsAllSelector);

  const applyOverride = (status: ItwCredentialStatus) => {
    const credentials = Object.values(allCredentials);

    // Save originals before the first override (only once per session)
    if (savedCredentials === undefined) {
      dispatch(itwDebugSaveOriginalCredentials(credentials));
    }

    // Overwrite every credential with a modified copy that produces the target status
    const modified = credentials.map(c => applyStatusToCredential(c, status));
    dispatch(itwCredentialsStore(modified));
    dispatch(itwDebugSetGlobalStatusOverride(status));
  };

  const resetOverride = () => {
    if (savedCredentials !== undefined) {
      dispatch(itwCredentialsStore(Object.values(savedCredentials)));
    }
    dispatch(itwDebugClearGlobalStatusOverride());
  };

  const handlePress = () => {
    Alert.alert(
      "Simula stato credenziali",
      "Modifica i dati nello store delle credenziali per simulare lo stato selezionato. Usa Reset per ripristinare i dati reali.",
      [
        ...ALL_STATUSES.map(status => ({
          text: status === override ? `✓ ${status}` : status,
          onPress: () => applyOverride(status)
        })),
        ...(override !== undefined
          ? [
              {
                text: "Reset",
                style: "destructive" as const,
                onPress: resetOverride
              }
            ]
          : []),
        { text: "Annulla", style: "cancel" as const }
      ]
    );
  };

  return (
    <View style={{ paddingBottom: 24 }}>
      <ListItemHeader label="Status Override (dev only)" />
      <ListItemNav
        value="Stato globale credenziali"
        description={
          override ? `Override attivo: ${override}` : "Nessun override"
        }
        onPress={handlePress}
      />
    </View>
  );
};
